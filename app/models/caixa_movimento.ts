import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import LancamentoParcela from '#models/lancamento_parcela'

export const CAIXA_MOVIMENTO_TYPES = ['entrada', 'saida'] as const
export type CaixaMovimentoTipo = (typeof CAIXA_MOVIMENTO_TYPES)[number]

export default class CaixaMovimento extends BaseModel {
  static table = 'caixa_movimentos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare tipo: CaixaMovimentoTipo

  @column()
  declare descricao: string

  @column({ consume: (value: string | number) => Number(value) })
  declare valor: number

  @column.date()
  declare dataMovimento: DateTime

  @column({ consume: (value: string | number) => Number(value) })
  declare saldoAnterior: number

  @column({ consume: (value: string | number) => Number(value) })
  declare saldoPosterior: number

  @column()
  declare lancamentoParcelaId: number | null

  /** Preenchido quando este movimento é o estorno de outro. */
  @column()
  declare estornoDeId: number | null

  @belongsTo(() => LancamentoParcela)
  declare parcela: BelongsTo<typeof LancamentoParcela>

  @belongsTo(() => CaixaMovimento, { foreignKey: 'estornoDeId' })
  declare estornoDe: BelongsTo<typeof CaixaMovimento>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
