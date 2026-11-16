import { AuthService, type AuthRepository } from './auth.service'
import { UserService, type UserRepository } from './user.service'

export interface Services {
  users: UserRepository
  auth: AuthRepository
}

export class ServiceProvider {
  private static userService?: UserRepository
  private static authService?: AuthRepository

  static get users(): UserRepository {
    this.userService ??= new UserService()
    return this.userService
  }

  static get auth(): AuthRepository {
    this.authService ??= new AuthService()
    return this.authService
  }

  static override(services: Partial<Services>): void {
    if (services.users) this.userService = services.users
    if (services.auth) this.authService = services.auth
  }

  static reset(): void {
    this.userService = undefined
    this.authService = undefined
  }
}
