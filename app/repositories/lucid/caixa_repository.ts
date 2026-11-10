import db from '@adonisjs/lucid/services/db'
import type { DateTime } from 'luxon'

import CaixaMovimento from '#models/caixa_movimento'
import CaixaRepository, { type CaixaMovimentoInput } from '#repositories/contracts/caixa_repository'
import { registrarMovimento } from '#repositories/lucid/caixa_ledger'

export default class LucidCaixaRepository extends CaixaRepository {
  listForUser(userId: number, inicio?: DateTime, fim?: DateTime): Promise<CaixaMovimento[]> {
    return CaixaMovimento.query()
      .where('user_id', userId)
      .if(inicio, (query) => query.where('data_movimento', '>=', inicio!.toISODate()!))
      .if(fim, (query) => query.where('data_movimento', '<=', fim!.toISODate()!))
      .orderBy('id', 'desc')
  }

  /** Saldo atual = saldo posterior do último movimento registrado. */
  async saldoForUser(userId: number): Promise<number> {
    const ultimo = await CaixaMovimento.query()
      .where('user_id', userId)
      .orderBy('id', 'desc')
      .first()
    return ultimo?.saldoPosterior ?? 0
  }

  async resultadoPeriodo(userId: number, inicio: DateTime, fim: DateTime): Promise<number> {
    const row = await db
      .from('caixa_movimentos')
      .where('user_id', userId)
      .where('data_movimento', '>=', inicio.toISODate()!)
      .where('data_movimento', '<=', fim.toISODate()!)
      .select(
        db.raw("COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE -valor END), 0) AS saldo")
      )
      .first()
    return Number(row?.saldo ?? 0)
  }

  create(userId: number, data: CaixaMovimentoInput): Promise<CaixaMovimento> {
    return db.transaction((trx) => registrarMovimento(trx, { ...data, userId }))
  }
}
