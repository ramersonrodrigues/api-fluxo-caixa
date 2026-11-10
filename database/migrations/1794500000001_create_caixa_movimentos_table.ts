import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'caixa_movimentos'

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

      table.enum('tipo', ['entrada', 'saida']).notNullable()
      table.string('descricao', 255).notNullable()
      table.decimal('valor', 15, 2).notNullable()
      table.date('data_movimento').notNullable()

      table
        .integer('lancamento_parcela_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('lancamento_parcelas')
        .onDelete('SET NULL')

      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
