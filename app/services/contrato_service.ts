import { inject } from '@adonisjs/core'
import type { DateTime } from 'luxon'

import type { TipoParcelamento } from '#models/contrato'
import type User from '#models/user'
import ContratoRepository, { type ContratoData } from '#repositories/contracts/contrato_repository'
import ImovelRepository from '#repositories/contracts/imovel_repository'
import type { LancamentoData, ParcelaData } from '#repositories/contracts/lancamento_repository'

export interface ContratoInput {
  imovelId: number
  clienteNome: string
  clienteCpf?: string | null
  clienteTelefone?: string | null
  valorAluguel: number
  tipoParcelamento: TipoParcelamento
  dataInicio: DateTime
  diaVencimento: number
  qtdMeses: number
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

/** Primeiro vencimento em ou após o início (dia 1–28 sempre existe no mês). */
function primeiroVencimento(inicio: DateTime, diaVencimento: number): DateTime {
  const mesmoMes = inicio.set({ day: diaVencimento })
  return diaVencimento >= inicio.day ? mesmoMes : mesmoMes.plus({ months: 1 })
}

/**
 * Dias entre o início e o 1º vencimento, contando inclusive o dia do
 * vencimento (início dia 1, vencimento dia 5 → 5 dias). 0 quando iguais.
 */
function diasDiferenca(inicio: DateTime, fv: DateTime): number {
  if (fv.hasSame(inicio, 'day')) return 0
  return Math.round(fv.diff(inicio, 'days').days) + 1
}

/** Valor proporcional aos dias extras (aluguel ÷ 30 × dias, "dia comercial"). */
const valorProporcional = (valor: number, dias: number) => round2((valor / 30) * dias)

/**
 * Parcelas do contrato — mesma regra do app:
 * - sem diferença de dias: qtdMeses parcelas nos vencimentos;
 * - 'maior': 1ª no início com aluguel + proporcional, demais nos vencimentos
 *   seguintes (pula o vencimento do mesmo mês);
 * - 'extra': 1ª no início só com o proporcional + qtdMeses parcelas nos
 *   vencimentos (a 2ª cai no mesmo mês).
 */
export function gerarParcelasContrato(input: ContratoInput): ParcelaData[] {
  const fv = primeiroVencimento(input.dataInicio, input.diaVencimento)
  const dias = diasDiferenca(input.dataInicio, fv)
  const parcelas: ParcelaData[] = []
  const push = (dataVencimento: DateTime, valor: number) =>
    parcelas.push({ numero: parcelas.length + 1, dataVencimento, valor })

  if (dias === 0) {
    for (let i = 0; i < input.qtdMeses; i++) push(fv.plus({ months: i }), input.valorAluguel)
  } else if (input.tipoParcelamento === 'maior') {
    push(input.dataInicio, round2(input.valorAluguel + valorProporcional(input.valorAluguel, dias)))
    for (let i = 1; i < input.qtdMeses; i++) push(fv.plus({ months: i }), input.valorAluguel)
  } else {
    push(input.dataInicio, valorProporcional(input.valorAluguel, dias))
    for (let i = 0; i < input.qtdMeses; i++) push(fv.plus({ months: i }), input.valorAluguel)
  }
  return parcelas
}

@inject()
export default class ContratoService {
  constructor(
    protected contratos: ContratoRepository,
    protected imoveis: ImovelRepository
  ) {}

  list(user: User) {
    return this.contratos.listForUser(user.id)
  }

  async create(user: User, input: ContratoInput) {
    const imovel = await this.imoveis.findForUser(user.id, input.imovelId)
    const { data, lancamento, parcelas } = this.montar(input, imovel.name)
    return this.contratos.create(user.id, data, lancamento, parcelas)
  }

  async update(user: User, id: number, input: ContratoInput) {
    const [contrato, imovel] = await Promise.all([
      this.contratos.findForUser(user.id, id),
      this.imoveis.findForUser(user.id, input.imovelId),
    ])
    const { data, lancamento, parcelas } = this.montar(input, imovel.name)
    return this.contratos.update(contrato, data, lancamento, parcelas)
  }

  async delete(user: User, id: number): Promise<void> {
    const contrato = await this.contratos.findForUser(user.id, id)
    await this.contratos.delete(contrato)
  }

  /**
   * Deriva os campos calculados (dataFim = 1º vencimento + qtdMeses,
   * qtdParcelas) e monta o lançamento de receita correspondente.
   */
  private montar(input: ContratoInput, imovelNome: string) {
    const parcelas = gerarParcelasContrato(input)
    const fv = primeiroVencimento(input.dataInicio, input.diaVencimento)
    const data: ContratoData = {
      ...input,
      dataFim: fv.plus({ months: input.qtdMeses }),
      qtdParcelas: parcelas.length,
    }
    const lancamento: LancamentoData = {
      descricao: `Aluguel — ${imovelNome} (${input.clienteNome})`,
      tipo: 'receita',
      valorParcela: input.valorAluguel,
      qtdParcelas: parcelas.length,
      dataInicio: input.dataInicio,
    }
    return { data, lancamento, parcelas }
  }
}
