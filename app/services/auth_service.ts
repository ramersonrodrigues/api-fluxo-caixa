import { createHash, randomBytes } from 'node:crypto'

import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'

import InvalidResetTokenException from '#exceptions/invalid_reset_token_exception'
import PasswordResetTokenRepository from '#repositories/contracts/password_reset_token_repository'
import UserRepository, { type CreateUserData } from '#repositories/contracts/user_repository'
import PasswordResetNotifier from '#services/password_reset_notifier'

const RESET_TOKEN_TTL_MINUTES = 60

@inject()
export default class AuthService {
  constructor(
    protected users: UserRepository,
    protected resetTokens: PasswordResetTokenRepository,
    protected notifier: PasswordResetNotifier
  ) {}

  async register(data: CreateUserData) {
    const user = await this.users.create(data)
    const token = await this.users.createAccessToken(user)

    return { user, token }
  }

  async login(email: string, password: string) {
    const user = await this.users.verifyCredentials(email, password)
    const token = await this.users.createAccessToken(user)

    return { user, token }
  }

  /**
   * Issues a reset token and notifies the user. Resolves silently when the
   * email is unknown so the endpoint does not leak registered accounts.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.users.findByEmail(email)
    if (!user) return

    await this.resetTokens.deleteForUser(user.id)

    const plainToken = randomBytes(32).toString('base64url')
    const expiresAt = DateTime.now().plus({ minutes: RESET_TOKEN_TTL_MINUTES })

    await this.resetTokens.create(user.id, this.hashToken(plainToken), expiresAt)
    await this.notifier.sendResetToken(user, plainToken)
  }

  async resetPassword(plainToken: string, newPassword: string): Promise<void> {
    const record = await this.resetTokens.findByToken(this.hashToken(plainToken))
    if (!record || record.expiresAt < DateTime.now()) {
      throw new InvalidResetTokenException()
    }

    const user = await this.users.findById(record.userId)
    if (!user) {
      throw new InvalidResetTokenException()
    }

    await this.users.updatePassword(user, newPassword)
    await this.resetTokens.delete(record)
    await this.users.revokeAllAccessTokens(user)
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }
}
