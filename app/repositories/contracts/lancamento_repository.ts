import type { DateTime } from 'luxon'

import type Lancamento from '#models/lancamento'
import type LancamentoParcela from '#models/lancamento_parcela'
import type { CaixaMovimentoTipo } from '#models/caixa_movimento'

export interface LancamentoData {
  descricao: string
  tipo: 'receita' | 'despesa'
  valorParcela: number
  qtdParcelas: number
  dataInicio: DateTime
  contratoId?: number | null
}

export interface ParcelaData {
  numero: number
  dataVencimento: DateTime
  valor: number
}

export interface MovimentoData {
  userId: number
  tipo: CaixaMovimentoTipo
  descricao: string
  valor: number
  dataMovimento: DateTime
  lancamentoParcelaId: number
  estornoDeId?: number
}

export default abstract class LancamentoRepository {
  abstract listForUser(userId: number): Promise<Lancamento[]>
  abstract findForUser(userId: number, id: number): Promise<Lancamento>
  abstract create(
    userId: number,
    data: LancamentoData,
    parcelas: ParcelaData[]
  ): Promise<Lancamento>
  abstract update(
    lancamento: Lancamento,
    data: LancamentoData,
    parcelas: ParcelaData[]
  ): Promise<Lancamento>
  abstract delete(lancamento: Lancamento): Promise<void>
  /** Cancela o lançamento e suas parcelas pendentes (as pagas permanecem). */
  abstract desativar(lancamento: Lancamento): Promise<Lancamento>
  abstract findParcela(lancamento: Lancamento, parcelaId: number): Promise<LancamentoParcela>
  abstract executarParcela(
    parcela: LancamentoParcela,
    movimento: MovimentoData
  ): Promise<LancamentoParcela>
  abstract estornarParcela(parcela: LancamentoParcela): Promise<LancamentoParcela>
}
