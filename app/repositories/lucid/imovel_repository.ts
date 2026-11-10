import db from '@adonisjs/lucid/services/db'

import Imovel from '#models/imovel'
import ImovelRepository, { type ImovelData } from '#repositories/contracts/imovel_repository'

export default class LucidImovelRepository extends ImovelRepository {
  listForUser(userId: number): Promise<Imovel[]> {
    return Imovel.query()
      .where('user_id', userId)
      .preload('imagens', (query) => query.orderBy('ordem', 'asc'))
      .orderBy('created_at', 'desc')
  }

  findForUser(userId: number, id: number): Promise<Imovel> {
    return Imovel.query()
      .where('id', id)
      .where('user_id', userId)
      .preload('imagens', (query) => query.orderBy('ordem', 'asc'))
      .firstOrFail()
  }

  create(userId: number, data: ImovelData): Promise<Imovel> {
    return db.transaction(async (trx) => {
      const { imagens = [], ...imovelData } = data
      const imovel = new Imovel()
      imovel.useTransaction(trx)
      await imovel.fill({ ...imovelData, userId }).save()
      await this.salvarImagens(imovel, imagens)
      await imovel.load('imagens', (query) => query.orderBy('ordem', 'asc'))
      return imovel
    })
  }

  /** Atualiza dados e substitui o conjunto de imagens pelo enviado. */
  update(imovel: Imovel, data: ImovelData): Promise<Imovel> {
    return db.transaction(async (trx) => {
      const { imagens, ...imovelData } = data
      imovel.useTransaction(trx)
      await imovel.merge(imovelData).save()
      if (imagens !== undefined) {
        await imovel.related('imagens').query().delete()
        await this.salvarImagens(imovel, imagens)
      }
      await imovel.load('imagens', (query) => query.orderBy('ordem', 'asc'))
      return imovel
    })
  }

  async delete(imovel: Imovel): Promise<void> {
    await imovel.delete()
  }

  private async salvarImagens(imovel: Imovel, imagens: string[]): Promise<void> {
    await imovel.related('imagens').createMany(imagens.map((imagem, ordem) => ({ imagem, ordem })))
  }
}
