import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
/**
 * A API é consumida por app mobile via Bearer token — CORS só se aplica a
 * clientes web. Origens restritas via ALLOWED_ORIGINS (lista separada por
 * vírgula); credentials desligado porque não usamos cookies.
 */
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:8081')
  .split(',')
  .map((origin) => origin.trim())

const corsConfig = defineConfig({
  enabled: true,
  origin: allowedOrigins,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: false,
  maxAge: 90,
})

export default corsConfig
