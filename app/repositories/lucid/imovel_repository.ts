import Imovel from '#models/imovel'
import ImovelRepository, { type ImovelData } from '#repositories/contracts/imovel_repository'

export default class LucidImovelRepository extends ImovelRepository {
  listForUser(userId: number): Promise<Imovel[]> {
    return Imovel.query().where('user_id', userId).orderBy('created_at', 'desc')
  }

  findForUser(userId: number, id: number): Promise<Imovel> {
    return Imovel.query().where('id', id).where('user_id', userId).firstOrFail()
  }

  create(userId: number, data: ImovelData): Promise<Imovel> {
    return Imovel.create({ ...data, userId })
  }

  update(imovel: Imovel, data: ImovelData): Promise<Imovel> {
    imovel.merge(data)
    return imovel.save()
  }

  async delete(imovel: Imovel): Promise<void> {
    await imovel.delete()
  }
}
