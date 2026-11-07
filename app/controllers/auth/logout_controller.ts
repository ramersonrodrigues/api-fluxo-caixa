import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import UserRepository from '#repositories/contracts/user_repository'

@inject()
export default class LogoutController {
  constructor(protected users: UserRepository) {}

  async handle({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    await this.users.revokeAccessToken(user, user.currentAccessToken.identifier)

    return response.noContent()
  }
}
