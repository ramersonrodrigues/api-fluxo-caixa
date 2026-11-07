/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

import { middleware } from '#start/kernel'

const RegisterController = () => import('#controllers/auth/register_controller')
const LoginController = () => import('#controllers/auth/login_controller')
const LogoutController = () => import('#controllers/auth/logout_controller')
const MeController = () => import('#controllers/auth/me_controller')
const ForgotPasswordController = () => import('#controllers/auth/forgot_password_controller')
const ResetPasswordController = () => import('#controllers/auth/reset_password_controller')
const UpdateProfileController = () => import('#controllers/auth/update_profile_controller')
const ChangePasswordController = () => import('#controllers/auth/change_password_controller')
const DeleteAccountController = () => import('#controllers/auth/delete_account_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router
  .group(() => {
    router.post('/register', [RegisterController])
    router.post('/login', [LoginController])
    router.post('/forgot-password', [ForgotPasswordController])
    router.post('/reset-password', [ResetPasswordController])

    router
      .group(() => {
        router.get('/me', [MeController])
        router.post('/logout', [LogoutController])
        router.put('/profile', [UpdateProfileController])
        router.post('/change-password', [ChangePasswordController])
        router.delete('/account', [DeleteAccountController])
      })
      .use(middleware.auth())
  })
  .prefix('/auth')
