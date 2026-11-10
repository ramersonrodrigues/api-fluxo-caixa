import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'caixa_movimentos'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('saldo_anterior', 15, 2).notNullable().defaultTo(0)
      table.decimal('saldo_posterior', 15, 2).notNullable().defaultTo(0)

      table
        .integer('estorno_de_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable(this.tableName)
        .onDelete('SET NULL')
    })

    // Recalcula saldo acumulado dos movimentos já existentes, por usuário.
    this.defer(async (db) => {
      const rows = await db
        .from(this.tableName)
        .select('id', 'user_id', 'tipo', 'valor')
        .orderBy('id', 'asc')
      const saldos = new Map<number, number>()
      for (const row of rows) {
        const anterior = saldos.get(row.user_id) ?? 0
        const delta = row.tipo === 'entrada' ? Number(row.valor) : -Number(row.valor)
        const posterior = Math.round((anterior + delta) * 100) / 100
        saldos.set(row.user_id, posterior)
        await db
          .from(this.tableName)
          .where('id', row.id)
          .update({ saldo_anterior: anterior, saldo_posterior: posterior })
      }
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['estorno_de_id'])
      table.dropColumn('estorno_de_id')
      table.dropColumn('saldo_anterior')
      table.dropColumn('saldo_posterior')
    })
  }
}
