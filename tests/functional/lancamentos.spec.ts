import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

const USER = {
  fullName: 'Financeiro',
  email: 'fin@appfc.dev',
  password: 'senha1234',
  password_confirmation: 'senha1234',
}

const RECEITA_BODY = {
  descricao: 'Aluguel teste',
  tipo: 'receita',
  valorParcela: 1000,
  qtdParcelas: 3,
  dataInicio: '2026-01-10',
}

async function authClient(client: { post: (url: string) => any; headers?: never }) {
  await client.post('/auth/register').json(USER)
  const login = await client
    .post('/auth/login')
    .json({ email: USER.email, password: USER.password })
  const token = login.body().token.value as string
  return { Authorization: `Bearer ${token}` }
}

async function criarLancamento(client: any, bearer: Record<string, string>, body = RECEITA_BODY) {
  const response = await client.post('/lancamentos').headers(bearer).json(body)
  response.assertStatus(201)
  return response.body().lancamento
}

test.group('Lançamentos — ciclo de vida', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('cria lançamento com parcelas pendentes', async ({ client, assert }) => {
    const bearer = await authClient(client)
    const lancamento = await criarLancamento(client, bearer)

    assert.equal(lancamento.status, 'ativo')
    assert.lengthOf(lancamento.parcelas, 3)
    assert.isTrue(lancamento.parcelas.every((p: any) => p.status === 'pendente'))
  })

  test('executar parcela cria movimento no caixa', async ({ client, assert }) => {
    const bearer = await authClient(client)
    const lancamento = await criarLancamento(client, bearer)
    const parcela = lancamento.parcelas[0]

    await client
      .post(`/lancamentos/${lancamento.id}/parcelas/${parcela.id}/executar`)
      .headers(bearer)
      .then((r) => r.assertStatus(200))

    const caixa = await client.get('/caixa').headers(bearer)
    caixa.assertStatus(200)
    assert.lengthOf(caixa.body().movimentos, 1)
    assert.equal(Number(caixa.body().movimentos[0].valor), 1000)
  })

  test('executar parcela duas vezes retorna 422', async ({ client }) => {
    const bearer = await authClient(client)
    const lancamento = await criarLancamento(client, bearer)
    const parcela = lancamento.parcelas[0]

    await client
      .post(`/lancamentos/${lancamento.id}/parcelas/${parcela.id}/executar`)
      .headers(bearer)
    const segundo = await client
      .post(`/lancamentos/${lancamento.id}/parcelas/${parcela.id}/executar`)
      .headers(bearer)
    segundo.assertStatus(422)
  })

  test('não edita nem exclui lançamento com parcelas pagas', async ({ client }) => {
    const bearer = await authClient(client)
    const lancamento = await criarLancamento(client, bearer)
    await client
      .post(`/lancamentos/${lancamento.id}/parcelas/${lancamento.parcelas[0].id}/executar`)
      .headers(bearer)

    const put = await client
      .put(`/lancamentos/${lancamento.id}`)
      .headers(bearer)
      .json({ ...RECEITA_BODY, valorParcela: 2000 })
    put.assertStatus(422)

    const del = await client.delete(`/lancamentos/${lancamento.id}`).headers(bearer)
    del.assertStatus(422)
  })

  test('desativar cancela pendentes e preserva pagas', async ({ client, assert }) => {
    const bearer = await authClient(client)
    const lancamento = await criarLancamento(client, bearer)
    await client
      .post(`/lancamentos/${lancamento.id}/parcelas/${lancamento.parcelas[0].id}/executar`)
      .headers(bearer)

    const response = await client.post(`/lancamentos/${lancamento.id}/desativar`).headers(bearer)
    response.assertStatus(200)

    const desativado = response.body().lancamento
    assert.equal(desativado.status, 'cancelado')
    const porStatus = desativado.parcelas.map((p: any) => p.status)
    assert.deepEqual(porStatus, ['paga', 'cancelada', 'cancelada'])
  })

  test('estorno em lançamento cancelado vira cancelada, não pendente', async ({
    client,
    assert,
  }) => {
    const bearer = await authClient(client)
    const lancamento = await criarLancamento(client, bearer)
    const parcela = lancamento.parcelas[0]
    await client
      .post(`/lancamentos/${lancamento.id}/parcelas/${parcela.id}/executar`)
      .headers(bearer)
    await client.post(`/lancamentos/${lancamento.id}/desativar`).headers(bearer)

    const response = await client
      .post(`/lancamentos/${lancamento.id}/parcelas/${parcela.id}/estornar`)
      .headers(bearer)
    response.assertStatus(200)
    assert.equal(response.body().parcela.status, 'cancelada')

    // estorno registra contra-movimento, não apaga o original
    const caixa = await client.get('/caixa').headers(bearer)
    assert.lengthOf(caixa.body().movimentos, 2)
  })

  test('excluir lançamento sem pagas é permitido', async ({ client }) => {
    const bearer = await authClient(client)
    const lancamento = await criarLancamento(client, bearer)

    const response = await client.delete(`/lancamentos/${lancamento.id}`).headers(bearer)
    response.assertStatus(204)
  })

  test('listagem é isolada por usuário', async ({ client, assert }) => {
    const bearer = await authClient(client)
    await criarLancamento(client, bearer)

    // segundo usuário não vê o lançamento do primeiro
    await client.post('/auth/register').json({ ...USER, email: 'outro@appfc.dev' })
    const login2 = await client
      .post('/auth/login')
      .json({ email: 'outro@appfc.dev', password: USER.password })
    const bearer2 = { Authorization: `Bearer ${login2.body().token.value}` }

    const lista = await client.get('/lancamentos').headers(bearer2)
    lista.assertStatus(200)
    assert.lengthOf(lista.body().lancamentos, 0)
  })
})
