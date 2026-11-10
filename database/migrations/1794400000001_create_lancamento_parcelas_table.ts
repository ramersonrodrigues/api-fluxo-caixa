import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lancamento_parcelas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('lancamento_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('lancamentos')
        .onDelete('CASCADE')

      table.integer('numero').unsigned().notNullable()
      table.date('data_vencimento').notNullable()
      table.decimal('valor', 15, 2).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
