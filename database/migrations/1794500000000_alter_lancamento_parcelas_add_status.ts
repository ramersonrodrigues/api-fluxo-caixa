import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lancamento_parcelas'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('status', ['pendente', 'paga']).notNullable().defaultTo('pendente')
      table.timestamp('pago_em').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('status')
      table.dropColumn('pago_em')
    })
  }
}
