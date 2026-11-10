import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ImovelImagem extends BaseModel {
  static table = 'imovel_imagens'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare imovelId: number

  /** data URI base64 (data:image/...;base64,...) */
  @column()
  declare imagem: string

  @column()
  declare ordem: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
