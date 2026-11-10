import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

import ContratoService, { type ContratoInput } from '#services/contrato_service'
import { createContratoValidator, updateContratoValidator } from '#validators/contrato'

function toInput(data: Omit<ContratoInput, 'dataInicio'> & { dataInicio: Date }): ContratoInput {
  return { ...data, dataInicio: DateTime.fromJSDate(data.dataInicio) }
}

@inject()
export default class ContratosController {
  constructor(protected contratoService: ContratoService) {}

  async index({ auth }: HttpContext) {
    const contratos = await this.contratoService.list(auth.getUserOrFail())
    return { contratos }
  }

  async store({ auth, request, response }: HttpContext) {
    const data = await request.validateUsing(createContratoValidator)
    const contrato = await this.contratoService.create(auth.getUserOrFail(), toInput(data))
    return response.created({ contrato })
  }

  async update({ auth, params, request }: HttpContext) {
    const data = await request.validateUsing(updateContratoValidator)
    const contrato = await this.contratoService.update(
      auth.getUserOrFail(),
      params.id,
      toInput(data)
    )
    return { contrato }
  }

  async destroy({ auth, params, response }: HttpContext) {
    await this.contratoService.delete(auth.getUserOrFail(), params.id)
    return response.noContent()
  }
}
