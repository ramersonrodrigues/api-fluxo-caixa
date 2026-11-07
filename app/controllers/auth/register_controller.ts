import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import AuthService from '#services/auth_service'
import { registerValidator } from '#validators/auth'

@inject()
export default class RegisterController {
  constructor(protected authService: AuthService) {}

  async handle({ request, response, logger }: HttpContext) {
    logger.info(
      {
        payload: {
          ...request.body(),
          password: '[REDACTED]',
          password_confirmation: '[REDACTED]',
          avatar: request.body().avatar ? '[IMAGE]' : undefined,
        },
      },
      'register request received'
    )

    try {
      const data = await request.validateUsing(registerValidator)
      const { user, token } = await this.authService.register(data)

      logger.info({ userId: user.id, email: user.email }, 'register success')

      return response.created({
        user,
        token: { type: 'bearer', value: token.value!.release() },
      })
    } catch (error) {
      logger.error({ err: error }, 'register failed')
      throw error
    }
  }
}
