import { Exception } from '@adonisjs/core/exceptions'

export default class OperacaoBloqueadaException extends Exception {
  static status = 422
  static code = 'E_OPERACAO_BLOQUEADA'
}
