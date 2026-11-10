import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'imovel_imagens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('imovel_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('imoveis')
        .onDelete('CASCADE')

      /** data URI base64 (data:image/...;base64,...) */
      table.text('imagem', 'mediumtext').notNullable()
      table.integer('ordem').unsigned().notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
