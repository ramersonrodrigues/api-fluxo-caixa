import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lancamentos'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('contrato_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('contratos')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['contrato_id'])
      table.dropColumn('contrato_id')
    })
  }
}
