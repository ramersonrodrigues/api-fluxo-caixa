import type { DateTime } from 'luxon'

import PasswordResetToken from '#models/password_reset_token'
import PasswordResetTokenRepository from '#repositories/contracts/password_reset_token_repository'

export default class LucidPasswordResetTokenRepository extends PasswordResetTokenRepository {
  create(userId: number, hashedToken: string, expiresAt: DateTime): Promise<PasswordResetToken> {
    return PasswordResetToken.create({ userId, token: hashedToken, expiresAt })
  }

  findByToken(hashedToken: string): Promise<PasswordResetToken | null> {
    return PasswordResetToken.query().where('token', hashedToken).first()
  }

  async deleteForUser(userId: number): Promise<void> {
    await PasswordResetToken.query().where('user_id', userId).delete()
  }

  async delete(token: PasswordResetToken): Promise<void> {
    await token.delete()
  }
}
