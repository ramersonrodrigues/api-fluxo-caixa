import type { DateTime } from 'luxon'

import type PasswordResetToken from '#models/password_reset_token'

export default abstract class PasswordResetTokenRepository {
  abstract create(
    userId: number,
    hashedToken: string,
    expiresAt: DateTime
  ): Promise<PasswordResetToken>
  abstract findByToken(hashedToken: string): Promise<PasswordResetToken | null>
  abstract deleteForUser(userId: number): Promise<void>
  abstract delete(token: PasswordResetToken): Promise<void>
}
