import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import AuthService from '#services/auth_service'
import { forgotPasswordValidator } from '#validators/auth'

@inject()
export default class ForgotPasswordController {
  constructor(protected authService: AuthService) {}

  async handle({ request }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)
    await this.authService.requestPasswordReset(email)

    return {
      message: 'If an account exists for this email, a password reset link has been sent',
    }
  }
}
