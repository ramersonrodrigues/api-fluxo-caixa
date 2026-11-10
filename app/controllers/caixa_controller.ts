import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

import CaixaService from '#services/caixa_service'
import { createCaixaMovimentoValidator } from '#validators/caixa_movimento'

@inject()
export default class CaixaController {
  constructor(protected caixaService: CaixaService) {}

  /** GET /caixa?mes=AAAA-MM — mês atual por padrão. */
  async index({ auth, request }: HttpContext) {
    const mesParam = request.input('mes') as string | undefined
    const mes = mesParam ? DateTime.fromFormat(mesParam, 'yyyy-LL') : undefined
    return this.caixaService.list(auth.getUserOrFail(), mes?.isValid ? mes : undefined)
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
