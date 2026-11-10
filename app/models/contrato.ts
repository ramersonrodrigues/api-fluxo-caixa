import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'

import Imovel from '#models/imovel'
import Lancamento from '#models/lancamento'

export const TIPOS_PARCELAMENTO = ['maior', 'extra'] as const
export type TipoParcelamento = (typeof TIPOS_PARCELAMENTO)[number]

export default class Contrato extends BaseModel {
  static table = 'contratos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare imovelId: number

  @column()
  declare clienteNome: string

  @column()
  declare clienteCpf: string | null

  @column()
  declare clienteTelefone: string | null

  @column({ consume: (value: string | number) => Number(value) })
  declare valorAluguel: number

  @column()
  declare tipoParcelamento: TipoParcelamento

  @column.date()
  declare dataInicio: DateTime

  @column.date()
  declare dataFim: DateTime

  @column()
  declare diaVencimento: number

  @column()
  declare qtdMeses: number

  @column()
  declare qtdParcelas: number

  @belongsTo(() => Imovel)
  declare imovel: BelongsTo<typeof Imovel>

  /** Lançamento de receita gerado com as parcelas do aluguel. */
  @hasOne(() => Lancamento)
  declare lancamento: HasOne<typeof Lancamento>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
