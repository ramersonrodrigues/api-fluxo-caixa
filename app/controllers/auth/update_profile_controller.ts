import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

import AuthService from '#services/auth_service'
import { updateProfileValidator } from '#validators/auth'

@inject()
export default class UpdateProfileController {
  constructor(protected authService: AuthService) {}

  async handle({ auth, request }: HttpContext) {
    const data = await request.validateUsing(updateProfileValidator)
    const user = await this.authService.updateProfile(auth.getUserOrFail(), data)
    return { user }
  }
}
