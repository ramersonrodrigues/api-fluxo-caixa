import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import AuthService from '#services/auth_service'
import { changePasswordValidator } from '#validators/auth'

@inject()
export default class ChangePasswordController {
  constructor(protected authService: AuthService) {}

  async handle({ auth, request, response }: HttpContext) {
    const { currentPassword, password } = await request.validateUsing(changePasswordValidator)
    const user = auth.getUserOrFail()
    await this.authService.changePassword(user, currentPassword, password)
    return response.noContent()
  }
}
