import type { DateTime } from 'luxon'

import type CaixaMovimento from '#models/caixa_movimento'
import type { CaixaMovimentoTipo } from '#models/caixa_movimento'

export interface CaixaMovimentoData {
  userId: number
  tipo: CaixaMovimentoTipo
  descricao: string
  valor: number
  dataMovimento: DateTime
  lancamentoParcelaId?: number | null
  estornoDeId?: number | null
}

export interface CaixaMovimentoInput {
  tipo: CaixaMovimentoTipo
  descricao: string
  valor: number
  dataMovimento: DateTime
}

export default abstract class CaixaRepository {
  abstract listForUser(userId: number, inicio?: DateTime, fim?: DateTime): Promise<CaixaMovimento[]>
  abstract saldoForUser(userId: number): Promise<number>
  /** Resultado do período: entradas menos saídas entre início e fim. */
  abstract resultadoPeriodo(userId: number, inicio: DateTime, fim: DateTime): Promise<number>
  /** Lançamento manual de entrada/saída direto no caixa. */
  abstract create(userId: number, data: CaixaMovimentoInput): Promise<CaixaMovimento>
}
