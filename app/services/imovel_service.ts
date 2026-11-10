import { inject } from '@adonisjs/core'

import OperacaoBloqueadaException from '#exceptions/operacao_bloqueada_exception'
import type User from '#models/user'
import ContratoRepository from '#repositories/contracts/contrato_repository'
import ImovelRepository, { type ImovelData } from '#repositories/contracts/imovel_repository'

@inject()
export default class ImovelService {
  constructor(
    protected imoveis: ImovelRepository,
    protected contratos: ContratoRepository
  ) {}

  list(user: User) {
    return this.imoveis.listForUser(user.id)
  }

  find(user: User, id: number) {
    return this.imoveis.findForUser(user.id, id)
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
    if (await this.contratos.existsForImovel(imovel.id)) {
      throw new OperacaoBloqueadaException(
        'Este imóvel possui contratos vinculados. Rescinda ou exclua o contrato antes.'
      )
    }
    await this.imoveis.delete(imovel)
  }
}
