import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'

import InvalidParcelaStatusException from '#exceptions/invalid_parcela_status_exception'
import LancamentoDeContratoException from '#exceptions/lancamento_de_contrato_exception'
import OperacaoBloqueadaException from '#exceptions/operacao_bloqueada_exception'
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
    this.assertSemBaixas(lancamento, 'editar')
    return this.lancamentos.update(lancamento, data, gerarParcelas(data))
  }

  async delete(user: User, id: number): Promise<void> {
    const lancamento = await this.findEditavel(user, id)
    this.assertSemBaixas(lancamento, 'excluir')
    await this.lancamentos.delete(lancamento)
  }

  /**
   * Cancela o lançamento: parcelas pendentes viram 'cancelada' e não podem
   * mais ser executadas. As pagas (e os movimentos do caixa) permanecem.
   */
  async desativar(user: User, id: number) {
    const lancamento = await this.findEditavel(user, id)
    if (lancamento.status === 'cancelado') {
      throw new OperacaoBloqueadaException('Este lançamento já está cancelado.')
    }
    return this.lancamentos.desativar(lancamento)
  }

  /**
   * Com parcelas pagas, editar/excluir destruiria histórico e permitiria
   * lançar o mesmo valor duas vezes no caixa — a saída é desativar.
   */
  private assertSemBaixas(
    lancamento: { status: string; parcelas: { status: string }[] },
    acao: string
  ) {
    if (lancamento.status === 'cancelado' && acao === 'editar') {
      throw new OperacaoBloqueadaException('Este lançamento está cancelado e não pode ser editado.')
    }
    if (lancamento.parcelas.some((p) => p.status === 'paga')) {
      throw new OperacaoBloqueadaException(
        `Este lançamento possui parcelas pagas. Desative-o em vez de ${acao}.`
      )
    }
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
    if (parcela.status !== 'pendente') {
      throw new InvalidParcelaStatusException('Esta parcela não está pendente.')
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
