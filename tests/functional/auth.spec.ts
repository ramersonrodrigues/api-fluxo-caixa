import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

const REGISTER_BODY = {
  fullName: 'Usuário Teste',
  email: 'teste@appfc.dev',
  password: 'senha1234',
  password_confirmation: 'senha1234',
}

async function registerAndLogin(client: { post: (url: string) => any }) {
  await client.post('/auth/register').json(REGISTER_BODY)
  const login = await client
    .post('/auth/login')
    .json({ email: REGISTER_BODY.email, password: REGISTER_BODY.password })
  const token = login.body().token.value as string
  return token
}

test.group('Auth', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('registro retorna usuário + token bearer', async ({ client, assert }) => {
    const response = await client.post('/auth/register').json(REGISTER_BODY)

    response.assertStatus(201)
    const { user, token } = response.body()
    assert.equal(user.email, REGISTER_BODY.email)
    assert.equal(token.type, 'bearer')
    assert.isString(token.value)
  })

  test('registro rejeita e-mail duplicado', async ({ client }) => {
    await client.post('/auth/register').json(REGISTER_BODY)
    const dup = await client.post('/auth/register').json(REGISTER_BODY)
    dup.assertStatus(422)
  })

  test('login com credenciais válidas retorna token', async ({ client }) => {
    await client.post('/auth/register').json(REGISTER_BODY)
    const response = await client
      .post('/auth/login')
      .json({ email: REGISTER_BODY.email, password: REGISTER_BODY.password })

    response.assertStatus(200)
    assert_token_shape(response.body())
  })

  test('login com senha errada retorna 400', async ({ client }) => {
    await client.post('/auth/register').json(REGISTER_BODY)
    const response = await client
      .post('/auth/login')
      .json({ email: REGISTER_BODY.email, password: 'errada1234' })

    response.assertStatus(400)
  })

  test('GET /auth/me sem token retorna 401', async ({ client }) => {
    const response = await client.get('/auth/me')
    response.assertStatus(401)
  })

  test('GET /auth/me com token retorna o usuário', async ({ client, assert }) => {
    const token = await registerAndLogin(client)
    const response = await client.get('/auth/me').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.equal(response.body().user.email, REGISTER_BODY.email)
  })

  test('logout revoga o token', async ({ client }) => {
    const token = await registerAndLogin(client)
    const bearer = { Authorization: `Bearer ${token}` }

    await client
      .post('/auth/logout')
      .headers(bearer)
      .then((r) => r.assertStatus(204))
    const response = await client.get('/auth/me').headers(bearer)
    response.assertStatus(401)
  })
})

function assert_token_shape(body: { token?: { type?: string; value?: string } }) {
  if (body.token?.type !== 'bearer' || typeof body.token.value !== 'string') {
    throw new Error(`shape de token inesperado: ${JSON.stringify(body)}`)
  }
}
