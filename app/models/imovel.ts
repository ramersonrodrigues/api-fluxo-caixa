import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export const IMOVEL_TYPES = ['casa', 'apartamento', 'terreno'] as const
export type ImovelType = (typeof IMOVEL_TYPES)[number]

export default class Imovel extends BaseModel {
  static table = 'imoveis'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare type: ImovelType

  @column()
  declare address: string | null

  @column()
  declare description: string | null

  @column({ consume: (value: string | number) => Number(value) })
  declare value: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
