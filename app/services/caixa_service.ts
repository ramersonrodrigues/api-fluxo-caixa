import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'

import type User from '#models/user'
import CaixaRepository, { type CaixaMovimentoInput } from '#repositories/contracts/caixa_repository'

@inject()
export default class CaixaService {
  constructor(protected caixa: CaixaRepository) {}

  /**
   * Extrato do mês informado (padrão: mês atual). Retorna o saldo geral
   * atual e o resultado do período (entradas − saídas do mês).
   */
  async list(user: User, mes?: DateTime) {
    const referencia = mes ?? DateTime.now()
    const inicio = referencia.startOf('month')
    const fim = referencia.endOf('month')
    const [movimentos, saldo, saldoMes] = await Promise.all([
      this.caixa.listForUser(user.id, inicio, fim),
      this.caixa.saldoForUser(user.id),
      this.caixa.resultadoPeriodo(user.id, inicio, fim),
    ])
    return { movimentos, saldo, saldoMes, mes: inicio.toISODate() }
  }

  /** Lançamento manual (crédito/débito direto, sem parcela vinculada). */
  create(user: User, data: CaixaMovimentoInput) {
    return this.caixa.create(user.id, data)
  }
}
