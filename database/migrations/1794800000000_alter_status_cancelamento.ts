import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Modelo híbrido: lançamentos/contratos com parcelas pagas não podem ser
 * editados nem excluídos — apenas desativados, cancelando as parcelas
 * pendentes. As pagas (e o caixa) permanecem intactos e estornáveis.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('lancamentos', (table) => {
      table.enum('status', ['ativo', 'cancelado']).notNullable().defaultTo('ativo')
    })
    this.schema.alterTable('lancamento_parcelas', (table) => {
      table.enum('status', ['pendente', 'paga', 'cancelada']).notNullable().alter()
    })
    this.schema.alterTable('contratos', (table) => {
      table.enum('status', ['ativo', 'rescindido']).notNullable().defaultTo('ativo')
    })
  }

  async down() {
    this.schema.alterTable('contratos', (table) => {
      table.dropColumn('status')
    })
    this.schema.alterTable('lancamento_parcelas', (table) => {
      table.enum('status', ['pendente', 'paga']).notNullable().alter()
    })
    this.schema.alterTable('lancamentos', (table) => {
      table.dropColumn('status')
    })
  }
}
