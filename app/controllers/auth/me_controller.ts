import type { HttpContext } from '@adonisjs/core/http'

export default class MeController {
  async handle({ auth }: HttpContext) {
    return { user: auth.getUserOrFail() }
  }
}
