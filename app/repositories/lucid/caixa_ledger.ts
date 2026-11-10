import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

import CaixaMovimento from '#models/caixa_movimento'
import User from '#models/user'
import type { CaixaMovimentoData } from '#repositories/contracts/caixa_repository'

/**
 * Insere o movimento calculando saldo anterior/posterior a partir do
 * último movimento do usuário.
 *
 * O lock FOR UPDATE é na linha do usuário (não no último movimento):
 * serializa escritas concorrentes do mesmo usuário inclusive quando o
 * ledger ainda está vazio, caso em que não haveria linha para travar.
 */
export async function registrarMovimento(
  trx: TransactionClientContract,
  movimento: CaixaMovimentoData
): Promise<CaixaMovimento> {
  await User.query({ client: trx }).where('id', movimento.userId).forUpdate().firstOrFail()

  const ultimo = await CaixaMovimento.query({ client: trx })
    .where('user_id', movimento.userId)
    .orderBy('id', 'desc')
    .first()

  const saldoAnterior = ultimo?.saldoPosterior ?? 0
  const delta = movimento.tipo === 'entrada' ? movimento.valor : -movimento.valor
  const saldoPosterior = Math.round((saldoAnterior + delta) * 100) / 100

  return CaixaMovimento.create({ ...movimento, saldoAnterior, saldoPosterior }, { client: trx })
}
