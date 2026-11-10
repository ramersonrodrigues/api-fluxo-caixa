import { Exception } from '@adonisjs/core/exceptions'

export default class InvalidParcelaStatusException extends Exception {
  static status = 422
  static code = 'E_INVALID_PARCELA_STATUS'
}
