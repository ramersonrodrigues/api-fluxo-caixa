import vine from '@vinejs/vine'

const passwordField = () => vine.string().minLength(8).maxLength(64).confirmed()
const emailField = () => vine.string().trim().email().normalizeEmail()

export const registerValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(255),
    email: emailField().unique(async (db, value) => {
      const match = await db.from('users').where('email', value).first()
      return !match
    }),
    password: passwordField(),
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
