import vine from '@vinejs/vine'

const passwordField = () => vine.string().minLength(8).maxLength(64).confirmed()
const emailField = () => vine.string().trim().email().normalizeEmail()

/**
 * Base64 data-URI image (~1MB of chars, roughly a 750KB picture). The
 * app compresses/resizes before encoding, so larger payloads are rejected.
 */
const avatarField = () =>
  vine
    .string()
    .maxLength(1_000_000)
    .regex(/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/)

export const registerValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(255),
    email: emailField().unique(async (db, value) => {
      const match = await db.from('users').where('email', value).first()
      return !match
    }),
    password: passwordField(),
    avatar: avatarField().optional(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: emailField(),
    password: vine.string(),
  })
)

export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: emailField(),
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    token: vine.string().trim().minLength(1),
    password: passwordField(),
  })
)

export const updateProfileValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(255),
    avatar: avatarField().nullable().optional(),
  })
)

export const changePasswordValidator = vine.compile(
  vine.object({
    currentPassword: vine.string(),
    password: passwordField(),
  })
)
