import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'

import type User from '#models/user'

/**
 * Delivers password reset tokens to users.
 *
 * Logs the plain token only in dev (facilitates manual testing until a
 * real mailer is configured); in production it would leak a credential
 * into the logs, so only metadata is logged.
 */
export default class PasswordResetNotifier {
  async sendResetToken(user: User, plainToken: string): Promise<void> {
    if (app.inDev) {
      logger.info(
        { userId: user.id, email: user.email, token: plainToken },
        'password reset token issued'
      )
    } else {
      logger.info({ userId: user.id, email: user.email }, 'password reset token issued')
    }
  }
}
