import type Imovel from '#models/imovel'

export interface ImovelData {
  name: string
  type: 'casa' | 'apartamento' | 'terreno'
  address?: string | null
  description?: string | null
  value: number
}

export default abstract class ImovelRepository {
  abstract listForUser(userId: number): Promise<Imovel[]>
  abstract findForUser(userId: number, id: number): Promise<Imovel>
  abstract create(userId: number, data: ImovelData): Promise<Imovel>
  abstract update(imovel: Imovel, data: ImovelData): Promise<Imovel>
  abstract delete(imovel: Imovel): Promise<void>
}
