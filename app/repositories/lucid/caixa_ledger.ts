import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

import CaixaMovimento from '#models/caixa_movimento'
import type { CaixaMovimentoData } from '#repositories/contracts/caixa_repository'

/**
 * Insere o movimento calculando saldo anterior/posterior a partir do
 * último movimento do usuário (com lock para evitar saldo inconsistente
 * em lançamentos simultâneos).
 */
export async function registrarMovimento(
  trx: TransactionClientContract,
  movimento: CaixaMovimentoData
): Promise<CaixaMovimento> {
  const ultimo = await CaixaMovimento.query({ client: trx })
    .where('user_id', movimento.userId)
    .orderBy('id', 'desc')
    .forUpdate()
    .first()

  const saldoAnterior = ultimo?.saldoPosterior ?? 0
  const delta = movimento.tipo === 'entrada' ? movimento.valor : -movimento.valor
  const saldoPosterior = Math.round((saldoAnterior + delta) * 100) / 100

  return CaixaMovimento.create({ ...movimento, saldoAnterior, saldoPosterior }, { client: trx })
}
