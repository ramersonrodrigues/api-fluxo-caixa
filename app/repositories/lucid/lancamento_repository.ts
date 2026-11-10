import db from '@adonisjs/lucid/services/db'
import { registrarMovimento } from '#repositories/lucid/caixa_ledger'
import { DateTime } from 'luxon'

import CaixaMovimento from '#models/caixa_movimento'
import Lancamento from '#models/lancamento'
import LancamentoParcela from '#models/lancamento_parcela'
import LancamentoRepository, {
  type LancamentoData,
  type MovimentoData,
  type ParcelaData,
} from '#repositories/contracts/lancamento_repository'

export default class LucidLancamentoRepository extends LancamentoRepository {
  listForUser(userId: number): Promise<Lancamento[]> {
    return Lancamento.query()
      .where('user_id', userId)
      .preload('parcelas', (query) => query.orderBy('numero', 'asc'))
      .orderBy('created_at', 'desc')
  }

  findForUser(userId: number, id: number): Promise<Lancamento> {
    return Lancamento.query()
      .where('id', id)
      .where('user_id', userId)
      .preload('parcelas', (query) => query.orderBy('numero', 'asc'))
      .firstOrFail()
  }

  create(userId: number, data: LancamentoData, parcelas: ParcelaData[]): Promise<Lancamento> {
    return db.transaction(async (trx) => {
      const lancamento = new Lancamento()
      lancamento.useTransaction(trx)
      await lancamento.fill({ ...data, userId }).save()
      await lancamento.related('parcelas').createMany(parcelas)
      await lancamento.load('parcelas', (query) => query.orderBy('numero', 'asc'))
      return lancamento
    })
  }

  update(
    lancamento: Lancamento,
    data: LancamentoData,
    parcelas: ParcelaData[]
  ): Promise<Lancamento> {
    return db.transaction(async (trx) => {
      lancamento.useTransaction(trx)
      await lancamento.merge(data).save()
      await lancamento.related('parcelas').query().delete()
      await lancamento.related('parcelas').createMany(parcelas)
      await lancamento.load('parcelas', (query) => query.orderBy('numero', 'asc'))
      return lancamento
    })
  }

  async delete(lancamento: Lancamento): Promise<void> {
    await lancamento.delete()
  }

  desativar(lancamento: Lancamento): Promise<Lancamento> {
    return db.transaction(async (trx) => {
      lancamento.useTransaction(trx)
      await lancamento.merge({ status: 'cancelado' }).save()
      await lancamento
        .related('parcelas')
        .query()
        .where('status', 'pendente')
        .update({ status: 'cancelada' })
      await lancamento.load('parcelas', (query) => query.orderBy('numero', 'asc'))
      return lancamento
    })
  }

  findParcela(lancamento: Lancamento, parcelaId: number): Promise<LancamentoParcela> {
    return lancamento.related('parcelas').query().where('id', parcelaId).firstOrFail()
  }

  executarParcela(
    parcela: LancamentoParcela,
    movimento: MovimentoData
  ): Promise<LancamentoParcela> {
    return db.transaction(async (trx) => {
      parcela.useTransaction(trx)
      await parcela.merge({ status: 'paga', pagoEm: DateTime.now() }).save()
      await registrarMovimento(trx, movimento)
      return parcela
    })
  }

  /**
   * Estorno contábil: o movimento original permanece no extrato e um novo
   * movimento de tipo oposto é lançado referenciando-o (estorno_de_id).
   */
  estornarParcela(parcela: LancamentoParcela): Promise<LancamentoParcela> {
    return db.transaction(async (trx) => {
      parcela.useTransaction(trx)
      const original = await CaixaMovimento.query({ client: trx })
        .where('lancamento_parcela_id', parcela.id)
        .whereNull('estorno_de_id')
        .whereNotExists((sub) =>
          sub.from('caixa_movimentos as e').whereRaw('e.estorno_de_id = caixa_movimentos.id')
        )
        .orderBy('id', 'desc')
        .firstOrFail()

      await registrarMovimento(trx, {
        userId: original.userId,
        tipo: original.tipo === 'entrada' ? 'saida' : 'entrada',
        descricao: `Estorno — ${original.descricao}`,
        valor: original.valor,
        dataMovimento: DateTime.now(),
        lancamentoParcelaId: parcela.id,
        estornoDeId: original.id,
      })
      await parcela.merge({ status: 'pendente', pagoEm: null }).save()
      return parcela
    })
  }
}
