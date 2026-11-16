import { http } from '@/api/http-client'
import type { AuthTokens, LoginCredentials, LoginResponse } from '@/types/auth'
import type { User } from '@/types/user'

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<LoginResponse>
  me(): Promise<User>
  refresh(refreshToken: string): Promise<AuthTokens>
}

function expiresInMins(): number {
  const value = Number(import.meta.env.VITE_AUTH_EXPIRES_IN_MINS)
  return Number.isFinite(value) && value > 0 ? value : 30
}

export class AuthService implements AuthRepository {
  login(credentials: LoginCredentials): Promise<LoginResponse> {
    return http<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { ...credentials, expiresInMins: expiresInMins() },
      auth: false,
    })
  }

  me(): Promise<User> {
    return http<User>('/auth/me')
  }

  refresh(refreshToken: string): Promise<AuthTokens> {
    return http<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken, expiresInMins: expiresInMins() },
      auth: false,
    })
  }
}
