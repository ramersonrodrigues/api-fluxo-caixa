import vine from '@vinejs/vine'

import { CAIXA_MOVIMENTO_TYPES } from '#models/caixa_movimento'

export const createCaixaMovimentoValidator = vine.compile(
  vine.object({
    tipo: vine.enum(CAIXA_MOVIMENTO_TYPES),
    descricao: vine.string().trim().minLength(2).maxLength(255),
    valor: vine.number().positive(),
    dataMovimento: vine.date().beforeOrEqual('today').optional(),
  })
)
