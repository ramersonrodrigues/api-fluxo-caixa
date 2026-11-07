import { Exception } from '@adonisjs/core/exceptions'

export default class InvalidResetTokenException extends Exception {
  static status = 400
  static code = 'E_INVALID_RESET_TOKEN'
  static message = 'Invalid or expired password reset token'
}
