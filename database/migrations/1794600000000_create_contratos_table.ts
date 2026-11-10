import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'contratos'

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

      table
        .integer('imovel_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('imoveis')
        .onDelete('CASCADE')

      table.string('cliente_nome', 255).notNullable()
      table.string('cliente_cpf', 14).nullable()
      table.string('cliente_telefone', 20).nullable()

      table.decimal('valor_aluguel', 15, 2).notNullable()
      table.enum('tipo_parcelamento', ['maior', 'extra']).notNullable()
      table.date('data_inicio').notNullable()
      table.date('data_fim').notNullable()
      table.integer('dia_vencimento').unsigned().notNullable()
      table.integer('qtd_meses').unsigned().notNullable()
      table.integer('qtd_parcelas').unsigned().notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
