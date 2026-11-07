import type { ApplicationService } from '@adonisjs/core/types'

import ImovelRepository from '#repositories/contracts/imovel_repository'
import PasswordResetTokenRepository from '#repositories/contracts/password_reset_token_repository'
import UserRepository from '#repositories/contracts/user_repository'
import LucidImovelRepository from '#repositories/lucid/imovel_repository'
import LucidPasswordResetTokenRepository from '#repositories/lucid/password_reset_token_repository'
import LucidUserRepository from '#repositories/lucid/user_repository'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.bind(UserRepository, () => new LucidUserRepository())
    this.app.container.bind(ImovelRepository, () => new LucidImovelRepository())
    this.app.container.bind(
      PasswordResetTokenRepository,
      () => new LucidPasswordResetTokenRepository()
    )
  }
}
