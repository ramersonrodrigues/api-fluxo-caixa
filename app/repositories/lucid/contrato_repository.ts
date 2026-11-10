import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

import Contrato from '#models/contrato'
import Lancamento from '#models/lancamento'
import LancamentoParcela from '#models/lancamento_parcela'
import ContratoRepository, { type ContratoData } from '#repositories/contracts/contrato_repository'
import type { LancamentoData, ParcelaData } from '#repositories/contracts/lancamento_repository'

export default class LucidContratoRepository extends ContratoRepository {
  listForUser(userId: number): Promise<Contrato[]> {
    return Contrato.query().where('user_id', userId).preload('imovel').orderBy('created_at', 'desc')
  }

  findForUser(userId: number, id: number): Promise<Contrato> {
    return Contrato.query().where('id', id).where('user_id', userId).preload('imovel').firstOrFail()
  }

  create(
    userId: number,
    data: ContratoData,
    lancamento: LancamentoData,
    parcelas: ParcelaData[]
  ): Promise<Contrato> {
    return db.transaction(async (trx) => {
      const contrato = new Contrato()
      contrato.useTransaction(trx)
      await contrato.fill({ ...data, userId, status: 'ativo' }).save()
      await this.criarLancamento(trx, contrato, lancamento, parcelas)
      await contrato.load('imovel')
      return contrato
    })
  }

  update(
    contrato: Contrato,
    data: ContratoData,
    lancamento: LancamentoData,
    parcelas: ParcelaData[]
  ): Promise<Contrato> {
    return db.transaction(async (trx) => {
      contrato.useTransaction(trx)
      await contrato.merge(data).save()
      await Lancamento.query({ client: trx }).where('contrato_id', contrato.id).delete()
      await this.criarLancamento(trx, contrato, lancamento, parcelas)
      await contrato.load('imovel')
      return contrato
    })
  }

  async delete(contrato: Contrato): Promise<void> {
    await contrato.delete()
  }

  desativar(contrato: Contrato): Promise<Contrato> {
    return db.transaction(async (trx) => {
      contrato.useTransaction(trx)
      await contrato.merge({ status: 'rescindido' }).save()
      await Lancamento.query({ client: trx })
        .where('contrato_id', contrato.id)
        .update({ status: 'cancelado' })
      await LancamentoParcela.query({ client: trx })
        .where('status', 'pendente')
        .whereIn('lancamento_id', Lancamento.query().select('id').where('contrato_id', contrato.id))
        .update({ status: 'cancelada' })
      await contrato.load('imovel')
      return contrato
    })
  }

  findLancamentoVinculado(contratoId: number): Promise<Lancamento | null> {
    return Lancamento.query().where('contrato_id', contratoId).preload('parcelas').first()
  }

  async existsForImovel(imovelId: number): Promise<boolean> {
    const contrato = await Contrato.query().where('imovel_id', imovelId).first()
    return contrato !== null
  }

  private async criarLancamento(
    trx: TransactionClientContract,
    contrato: Contrato,
    data: LancamentoData,
    parcelas: ParcelaData[]
  ): Promise<void> {
    const lancamento = new Lancamento()
    lancamento.useTransaction(trx)
    await lancamento
      .fill({ ...data, userId: contrato.userId, contratoId: contrato.id, status: 'ativo' })
      .save()
    await lancamento.related('parcelas').createMany(parcelas)
  }
}
