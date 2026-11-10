import { Exception } from '@adonisjs/core/exceptions'

export default class LancamentoDeContratoException extends Exception {
  static status = 422
  static code = 'E_LANCAMENTO_DE_CONTRATO'
  static message = 'Este lançamento foi gerado por um contrato. Altere ou exclua o contrato.'
}
