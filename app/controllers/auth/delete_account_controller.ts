import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import AuthService from '#services/auth_service'

@inject()
export default class DeleteAccountController {
  constructor(protected authService: AuthService) {}

  async handle({ auth, response }: HttpContext) {
    await this.authService.deactivateAccount(auth.getUserOrFail())
    return response.noContent()
  }
}
