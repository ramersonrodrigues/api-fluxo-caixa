import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

import LancamentoService from '#services/lancamento_service'
import { type LancamentoData } from '#repositories/contracts/lancamento_repository'
import { createLancamentoValidator, updateLancamentoValidator } from '#validators/lancamento'
import type { PaginationOptions } from '#repositories/contracts/caixa_repository'

/** page/limit presentes (limit ≤ 200) ativam paginação na listagem. */
function paginacao(request: HttpContext['request']): PaginationOptions | undefined {
  const page = Number(request.input('page'))
  const limit = Number(request.input('limit'))
  return page > 0 && limit > 0 ? { page, limit: Math.min(limit, 200) } : undefined
}

function toInput(data: {
  descricao: string
  tipo: 'receita' | 'despesa'
  valorParcela: number
  qtdParcelas: number
  dataInicio: Date
}): LancamentoData {
  return { ...data, dataInicio: DateTime.fromJSDate(data.dataInicio) }
}

@inject()
export default class LancamentosController {
  constructor(protected lancamentoService: LancamentoService) {}

  async index({ auth, request }: HttpContext) {
    return this.lancamentoService.list(auth.getUserOrFail(), paginacao(request))
  }

  async store({ auth, request, response }: HttpContext) {
    const data = await request.validateUsing(createLancamentoValidator)
    const lancamento = await this.lancamentoService.create(auth.getUserOrFail(), toInput(data))
    return response.created({ lancamento })
  }

  async update({ auth, params, request }: HttpContext) {
    const data = await request.validateUsing(updateLancamentoValidator)
    const lancamento = await this.lancamentoService.update(
      auth.getUserOrFail(),
      params.id,
      toInput(data)
    )
    return { lancamento }
  }

  async destroy({ auth, params, response }: HttpContext) {
    await this.lancamentoService.delete(auth.getUserOrFail(), params.id)
    return response.noContent()
  }

  async desativar({ auth, params }: HttpContext) {
    const lancamento = await this.lancamentoService.desativar(auth.getUserOrFail(), params.id)
    return { lancamento }
  }

  async executarParcela({ auth, params }: HttpContext) {
    const parcela = await this.lancamentoService.executarParcela(
      auth.getUserOrFail(),
      params.id,
      params.parcelaId
    )
    return { parcela }
  }

  async estornarParcela({ auth, params }: HttpContext) {
    const parcela = await this.lancamentoService.estornarParcela(
      auth.getUserOrFail(),
      params.id,
      params.parcelaId
    )
    return { parcela }
  }
}
