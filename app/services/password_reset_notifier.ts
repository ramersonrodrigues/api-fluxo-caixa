import logger from '@adonisjs/core/services/logger'

import type User from '#models/user'

/**
 * Delivers password reset tokens to users.
 *
 * Logs the plain token for now — swap the implementation for a real
 * mailer (e.g. @adonisjs/mail) once SMTP credentials are configured.
 */
export default class PasswordResetNotifier {
  async sendResetToken(user: User, plainToken: string): Promise<void> {
    logger.info(
      { userId: user.id, email: user.email, token: plainToken },
      'password reset token issued'
    )
  }
}
