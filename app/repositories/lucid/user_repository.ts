import db from '@adonisjs/lucid/services/db'
import type { AccessToken } from '@adonisjs/auth/access_tokens'

import User from '#models/user'
import UserRepository, { type CreateUserData } from '#repositories/contracts/user_repository'

export default class LucidUserRepository extends UserRepository {
  create(data: CreateUserData): Promise<User> {
    return User.create(data)
  }

  findById(id: number): Promise<User | null> {
    return User.find(id)
  }

  findByEmail(email: string): Promise<User | null> {
    return User.query().where('email', email).first()
  }

  verifyCredentials(email: string, password: string): Promise<User> {
    return User.verifyCredentials(email, password)
  }

  async updatePassword(user: User, plainPassword: string): Promise<User> {
    user.password = plainPassword
    return user.save()
  }

  createAccessToken(user: User): Promise<AccessToken> {
    return User.accessTokens.create(user)
  }

  async revokeAccessToken(user: User, identifier: string | number | BigInt): Promise<void> {
    await User.accessTokens.delete(user, identifier)
  }

  async revokeAllAccessTokens(user: User): Promise<void> {
    await db.from('auth_access_tokens').where('tokenable_id', user.id).delete()
  }
}
