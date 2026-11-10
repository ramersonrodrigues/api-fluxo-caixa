import vine from '@vinejs/vine'

import { TIPOS_PARCELAMENTO } from '#models/contrato'

const contratoSchema = vine.object({
  imovelId: vine.number().positive(),
  clienteNome: vine.string().trim().minLength(2).maxLength(255),
  clienteCpf: vine.string().trim().maxLength(14).nullable().optional(),
  clienteTelefone: vine.string().trim().maxLength(20).nullable().optional(),
  valorAluguel: vine.number().positive(),
  tipoParcelamento: vine.enum(TIPOS_PARCELAMENTO),
  dataInicio: vine.date(),
  diaVencimento: vine.number().min(1).max(28),
  qtdMeses: vine.number().min(1).max(360),
})

export const createContratoValidator = vine.compile(contratoSchema)
export const updateContratoValidator = vine.compile(contratoSchema)
