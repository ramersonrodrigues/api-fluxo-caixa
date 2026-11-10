import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

import LancamentoParcela from '#models/lancamento_parcela'

export const LANCAMENTO_TYPES = ['receita', 'despesa'] as const
export type LancamentoTipo = (typeof LANCAMENTO_TYPES)[number]

export const LANCAMENTO_STATUS = ['ativo', 'cancelado'] as const
export type LancamentoStatus = (typeof LANCAMENTO_STATUS)[number]

export default class Lancamento extends BaseModel {
  static table = 'lancamentos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare descricao: string

  @column()
  declare tipo: LancamentoTipo

  @column({ consume: (value: string | number) => Number(value) })
  declare valorParcela: number

  @column()
  declare qtdParcelas: number

  @column.date()
  declare dataInicio: DateTime

  /** Preenchido quando o lançamento foi gerado por um contrato de aluguel. */
  @column()
  declare contratoId: number | null

  @column()
  declare status: LancamentoStatus

  @hasMany(() => LancamentoParcela)
  declare parcelas: HasMany<typeof LancamentoParcela>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
