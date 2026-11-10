import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lancamentos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.string('descricao', 255).notNullable()
      table.enum('tipo', ['receita', 'despesa']).notNullable()
      table.decimal('valor_parcela', 15, 2).notNullable()
      table.integer('qtd_parcelas').unsigned().notNullable()
      table.date('data_inicio').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
