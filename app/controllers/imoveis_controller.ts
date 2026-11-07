import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import ImovelService from '#services/imovel_service'
import { createImovelValidator, updateImovelValidator } from '#validators/imovel'

@inject()
export default class ImoveisController {
  constructor(protected imovelService: ImovelService) {}

  async index({ auth }: HttpContext) {
    const imoveis = await this.imovelService.list(auth.getUserOrFail())
    return { imoveis }
  }

  async store({ auth, request, response }: HttpContext) {
    const data = await request.validateUsing(createImovelValidator)
    const imovel = await this.imovelService.create(auth.getUserOrFail(), data)
    return response.created({ imovel })
  }

  async update({ auth, params, request }: HttpContext) {
    const data = await request.validateUsing(updateImovelValidator)
    const imovel = await this.imovelService.update(auth.getUserOrFail(), params.id, data)
    return { imovel }
  }

  async destroy({ auth, params, response }: HttpContext) {
    await this.imovelService.delete(auth.getUserOrFail(), params.id)
    return response.noContent()
  }
}
