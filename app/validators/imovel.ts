import vine from '@vinejs/vine'

import { IMOVEL_TYPES } from '#models/imovel'

const imovelSchema = vine.object({
  name: vine.string().trim().minLength(2).maxLength(255),
  type: vine.enum(IMOVEL_TYPES),
  address: vine.string().trim().maxLength(255).nullable().optional(),
  description: vine.string().trim().maxLength(1000).nullable().optional(),
  value: vine.number().positive(),
  /** data URIs base64, máx. 10 imagens de ~1,5MB cada */
  imagens: vine.array(vine.string().trim().maxLength(2000000)).maxLength(10).optional(),
})

export const createImovelValidator = vine.compile(imovelSchema)
export const updateImovelValidator = vine.compile(imovelSchema)
