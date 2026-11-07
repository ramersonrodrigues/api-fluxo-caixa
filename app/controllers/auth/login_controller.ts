import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import AuthService from '#services/auth_service'
import { loginValidator } from '#validators/auth'

@inject()
export default class LoginController {
  constructor(protected authService: AuthService) {}

  async handle({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const { user, token } = await this.authService.login(email, password)

    return {
      user,
      token: { type: 'bearer', value: token.value!.release() },
    }
  }
}
