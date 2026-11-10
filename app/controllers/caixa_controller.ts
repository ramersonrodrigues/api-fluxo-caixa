import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

import CaixaService from '#services/caixa_service'
import { createCaixaMovimentoValidator } from '#validators/caixa_movimento'
import type { PaginationOptions } from '#repositories/contracts/caixa_repository'

/** page/limit presentes (limit ≤ 200) ativam paginação na listagem. */
function paginacao(request: HttpContext['request']): PaginationOptions | undefined {
  const page = Number(request.input('page'))
  const limit = Number(request.input('limit'))
  return page > 0 && limit > 0 ? { page, limit: Math.min(limit, 200) } : undefined
}

@inject()
export default class CaixaController {
  constructor(protected caixaService: CaixaService) {}

  /** GET /caixa?mes=AAAA-MM[&page=&limit=] — mês atual por padrão. */
  async index({ auth, request }: HttpContext) {
    const mesParam = request.input('mes') as string | undefined
    const mes = mesParam ? DateTime.fromFormat(mesParam, 'yyyy-LL') : undefined
    return this.caixaService.list(
      auth.getUserOrFail(),
      mes?.isValid ? mes : undefined,
      paginacao(request)
    )
  }

  /** POST /caixa/movimentos — crédito/débito manual. */
  async store({ auth, request, response }: HttpContext) {
    const data = await request.validateUsing(createCaixaMovimentoValidator)
    const movimento = await this.caixaService.create(auth.getUserOrFail(), {
      ...data,
      dataMovimento: data.dataMovimento ? DateTime.fromJSDate(data.dataMovimento) : DateTime.now(),
    })
    return response.created({ movimento })
  }
}
