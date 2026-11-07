import { inject } from '@adonisjs/core'

import type User from '#models/user'
import ImovelRepository, { type ImovelData } from '#repositories/contracts/imovel_repository'

@inject()
export default class ImovelService {
  constructor(protected imoveis: ImovelRepository) {}

  list(user: User) {
    return this.imoveis.listForUser(user.id)
  }

  create(user: User, data: ImovelData) {
    return this.imoveis.create(user.id, data)
  }

  async update(user: User, id: number, data: ImovelData) {
    const imovel = await this.imoveis.findForUser(user.id, id)
    return this.imoveis.update(imovel, data)
  }

  async delete(user: User, id: number): Promise<void> {
    const imovel = await this.imoveis.findForUser(user.id, id)
    await this.imoveis.delete(imovel)
  }
}
