import type { AccessToken } from '@adonisjs/auth/access_tokens'

import type User from '#models/user'

export interface CreateUserData {
  fullName: string
  email: string
  password: string
  avatar?: string | null
}

export default abstract class UserRepository {
  abstract create(data: CreateUserData): Promise<User>
  abstract findById(id: number): Promise<User | null>
  abstract findByEmail(email: string): Promise<User | null>
  abstract verifyCredentials(email: string, password: string): Promise<User>
  abstract updatePassword(user: User, plainPassword: string): Promise<User>
  abstract updateProfile(
    user: User,
    data: { fullName: string; avatar?: string | null }
  ): Promise<User>
  abstract deactivateUser(user: User): Promise<void>
  abstract createAccessToken(user: User): Promise<AccessToken>
  abstract revokeAccessToken(user: User, identifier: string | number | BigInt): Promise<void>
  abstract revokeAllAccessTokens(user: User): Promise<void>
}
