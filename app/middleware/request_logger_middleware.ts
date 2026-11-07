import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Logs one line per HTTP request: method, url, status and duration.
 */
export default class RequestLoggerMiddleware {
  async handle({ request, response, logger }: HttpContext, next: NextFn) {
    const start = performance.now()

    try {
      const output = await next()
      const ms = (performance.now() - start).toFixed(1)
      logger.info(`${request.method()} ${request.url()} -> ${response.getStatus()} (${ms}ms)`)

      return output
    } catch (error) {
      const ms = (performance.now() - start).toFixed(1)
      logger.error(`${request.method()} ${request.url()} -> ERROR (${ms}ms)`)
      throw error
    }
  }
}
