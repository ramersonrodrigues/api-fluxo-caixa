import vine from '@vinejs/vine'

import { LANCAMENTO_TYPES } from '#models/lancamento'

const lancamentoSchema = vine.object({
  descricao: vine.string().trim().minLength(2).maxLength(255),
  tipo: vine.enum(LANCAMENTO_TYPES),
  valorParcela: vine.number().positive(),
  qtdParcelas: vine.number().min(1).max(999),
  dataInicio: vine.date(),
})

export const createLancamentoValidator = vine.compile(lancamentoSchema)
export const updateLancamentoValidator = vine.compile(lancamentoSchema)
