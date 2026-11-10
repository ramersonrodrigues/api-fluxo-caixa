import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import Lancamento from '#models/lancamento'

export const PARCELA_STATUS = ['pendente', 'paga'] as const
export type ParcelaStatus = (typeof PARCELA_STATUS)[number]

export default class LancamentoParcela extends BaseModel {
  static table = 'lancamento_parcelas'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare lancamentoId: number

  @column()
  declare numero: number

  @column.date()
  declare dataVencimento: DateTime

  @column({ consume: (value: string | number) => Number(value) })
  declare valor: number

  @column()
  declare status: ParcelaStatus

  @column.dateTime()
  declare pagoEm: DateTime | null

  @belongsTo(() => Lancamento)
  declare lancamento: BelongsTo<typeof Lancamento>
}
