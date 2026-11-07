import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import AuthService from '#services/auth_service'
import { resetPasswordValidator } from '#validators/auth'

@inject()
export default class ResetPasswordController {
  constructor(protected authService: AuthService) {}

  async handle({ request }: HttpContext) {
    const { token, password } = await request.validateUsing(resetPasswordValidator)
    await this.authService.resetPassword(token, password)

    return { message: 'Password updated successfully' }
  }
}
