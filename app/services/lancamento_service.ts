import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'

import InvalidParcelaStatusException from '#exceptions/invalid_parcela_status_exception'
import LancamentoDeContratoException from '#exceptions/lancamento_de_contrato_exception'
import type User from '#models/user'
import LancamentoRepository, {
  type LancamentoData,
  type ParcelaData,
} from '#repositories/contracts/lancamento_repository'

/**
 * Parcelas mensais de mesmo valor a partir da data de início. Luxon
 * `plus({ months })` ajusta ao último dia do mês quando o dia não
 * existe (31/01 + 1 mês → 28/02), mesma regra do frontend.
 */
function gerarParcelas(data: LancamentoData): ParcelaData[] {
  return Array.from({ length: data.qtdParcelas }, (_, i) => ({
    numero: i + 1,
    dataVencimento: data.dataInicio.plus({ months: i }),
    valor: data.valorParcela,
  }))
}

@inject()
export default class LancamentoService {
  constructor(protected lancamentos: LancamentoRepository) {}

  list(user: User) {
    return this.lancamentos.listForUser(user.id)
  }

  create(user: User, data: LancamentoData) {
    return this.lancamentos.create(user.id, data, gerarParcelas(data))
  }

  async update(user: User, id: number, data: LancamentoData) {
    const lancamento = await this.findEditavel(user, id)
    return this.lancamentos.update(lancamento, data, gerarParcelas(data))
  }

  async delete(user: User, id: number): Promise<void> {
    const lancamento = await this.findEditavel(user, id)
    await this.lancamentos.delete(lancamento)
  }

  /** Lançamentos gerados por contrato só mudam através do contrato. */
  private async findEditavel(user: User, id: number) {
    const lancamento = await this.lancamentos.findForUser(user.id, id)
    if (lancamento.contratoId !== null) throw new LancamentoDeContratoException()
    return lancamento
  }

  /**
   * Baixa da parcela: marca como paga e lança no caixa a entrada
   * (receita) ou saída (despesa) na data de hoje.
   */
  async executarParcela(user: User, lancamentoId: number, parcelaId: number) {
    const lancamento = await this.lancamentos.findForUser(user.id, lancamentoId)
    const parcela = await this.lancamentos.findParcela(lancamento, parcelaId)
    if (parcela.status === 'paga') {
      throw new InvalidParcelaStatusException('Esta parcela já foi executada.')
    }
    return this.lancamentos.executarParcela(parcela, {
      userId: user.id,
      tipo: lancamento.tipo === 'receita' ? 'entrada' : 'saida',
      descricao: `${lancamento.descricao} — parcela ${parcela.numero}/${lancamento.qtdParcelas}`,
      valor: parcela.valor,
      dataMovimento: DateTime.now(),
      lancamentoParcelaId: parcela.id,
    })
  }

  /** Estorna a baixa: remove o movimento do caixa e volta a pendente. */
  async estornarParcela(user: User, lancamentoId: number, parcelaId: number) {
    const lancamento = await this.lancamentos.findForUser(user.id, lancamentoId)
    const parcela = await this.lancamentos.findParcela(lancamento, parcelaId)
    if (parcela.status !== 'paga') {
      throw new InvalidParcelaStatusException('Esta parcela ainda não foi executada.')
    }
    return this.lancamentos.estornarParcela(parcela)
  }
}
