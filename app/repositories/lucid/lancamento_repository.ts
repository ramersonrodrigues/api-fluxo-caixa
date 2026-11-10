import db from '@adonisjs/lucid/services/db'
import { registrarMovimento } from '#repositories/lucid/caixa_ledger'
import { DateTime } from 'luxon'

import InvalidParcelaStatusException from '#exceptions/invalid_parcela_status_exception'

import CaixaMovimento from '#models/caixa_movimento'
import Lancamento from '#models/lancamento'
import LancamentoParcela from '#models/lancamento_parcela'
import LancamentoRepository, {
  type LancamentoData,
  type MovimentoData,
  type ParcelaData,
} from '#repositories/contracts/lancamento_repository'
import type { PageResult, PaginationOptions } from '#repositories/contracts/caixa_repository'

export default class LucidLancamentoRepository extends LancamentoRepository {
  async listForUser(
    userId: number,
    paginacao?: PaginationOptions
  ): Promise<PageResult<Lancamento>> {
    const base = Lancamento.query()
      .where('user_id', userId)
      .preload('parcelas', (query) => query.orderBy('numero', 'asc'))
      .orderBy('created_at', 'desc')

    if (paginacao) {
      const page = await base.paginate(paginacao.page, paginacao.limit)
      return {
        items: page.all(),
        meta: {
          total: page.total,
          perPage: page.perPage,
          currentPage: page.currentPage,
          lastPage: page.lastPage,
        },
      }
    }
    return { items: await base }
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
      await lancamento.fill({ ...data, userId, status: 'ativo' }).save()
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

  /**
   * A checagem de status é refeita dentro da transação com lock na
   * parcela: dois requests simultâneos não passam os dois pelo check
   * do service e lançam o valor duas vezes no caixa.
   */
  executarParcela(
    parcela: LancamentoParcela,
    movimento: MovimentoData
  ): Promise<LancamentoParcela> {
    return db.transaction(async (trx) => {
      const locked = await LancamentoParcela.query({ client: trx })
        .where('id', parcela.id)
        .forUpdate()
        .firstOrFail()
      if (locked.status !== 'pendente') {
        throw new InvalidParcelaStatusException('Esta parcela não está pendente.')
      }
      locked.useTransaction(trx)
      await locked.merge({ status: 'paga', pagoEm: DateTime.now() }).save()
      await registrarMovimento(trx, movimento)
      return locked
    })
  }

  /**
   * Estorno contábil: o movimento original permanece no extrato e um novo
   * movimento de tipo oposto é lançado referenciando-o (estorno_de_id).
   */
  estornarParcela(
    parcela: LancamentoParcela,
    lancamentoCancelado: boolean
  ): Promise<LancamentoParcela> {
    return db.transaction(async (trx) => {
      const locked = await LancamentoParcela.query({ client: trx })
        .where('id', parcela.id)
        .forUpdate()
        .firstOrFail()
      if (locked.status !== 'paga') {
        throw new InvalidParcelaStatusException('Esta parcela ainda não foi executada.')
      }
      locked.useTransaction(trx)
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
      await locked
        .merge({ status: lancamentoCancelado ? 'cancelada' : 'pendente', pagoEm: null })
        .save()
      return locked
    })
  }
}
