/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes.
|
*/

import app from '@adonisjs/core/services/app'
import limiter from '@adonisjs/limiter/services/main'

/**
 * Endpoints públicos de auth: 10 req/min por IP+email. Dificulta
 * brute-force de senha e enumeração de e-mail no forgot-password sem
 * punir redes que compartilham IP (CGNAT, empresas).
 *
 * Desligado nos testes: reaproveitar o mesmo e-mail a cada spec estouraria
 * o limite — throttling não é o objeto sob teste.
 */
export const throttleAuth = limiter.define('auth', (ctx) => {
  if (app.inTest) return null
  const email = String(ctx.request.input('email', '')).toLowerCase()
  return limiter.allowRequests(10).every('1 minute').usingKey(`${ctx.request.ip()}:${email}`)
})
