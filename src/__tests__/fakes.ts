import type { AuthRepository } from '@/services/auth.service'
import type { UserRepository } from '@/services/user.service'
import type { AuthTokens, LoginCredentials, LoginResponse } from '@/types/auth'
import type { CreateUserDto, ListParams, Page, UpdateUserDto, User } from '@/types/user'
import { HttpError } from '@/api/http-client'

export function makeUser(id: number, overrides: Partial<User> = {}): User {
  return {
    id,
    firstName: `First${id}`,
    lastName: `Last${id}`,
    age: 20 + id,
    gender: id % 2 === 0 ? 'female' : 'male',
    email: `user${id}@example.com`,
    phone: '+380 63 555 5555',
    username: `user${id}`,
    password: 'password123',
    ...overrides,
  }
}

export class FakeUserService implements UserRepository {
  items: User[]
  calls: string[] = []

  constructor(items: User[] = [makeUser(1), makeUser(2), makeUser(3)]) {
    this.items = items
  }

  private page(items: User[], { limit = 10, skip = 0 }: ListParams = {}): Page<User> {
    return { items: items.slice(skip, skip + limit), total: items.length, skip, limit }
  }

  async getAll(params?: ListParams): Promise<Page<User>> {
    this.calls.push('getAll')
    return this.page(this.items, params)
  }

  async search(query: string, params?: ListParams): Promise<Page<User>> {
    this.calls.push(`search:${query}`)
    const needle = query.toLowerCase()
    return this.page(
      this.items.filter((user) => user.firstName.toLowerCase().includes(needle)),
      params,
    )
  }

  async getById(id: number): Promise<User> {
    this.calls.push(`getById:${id}`)
    const user = this.items.find((item) => item.id === id)
    if (!user) throw new HttpError(404, `User with id '${id}' not found`)
    return user
  }

  async create(data: CreateUserDto): Promise<User> {
    this.calls.push('create')
    return { ...makeUser(this.items.length + 1), ...data }
  }

  async update(id: number, data: UpdateUserDto): Promise<User> {
    this.calls.push(`update:${id}`)
    return { ...(await this.getById(id)), ...data }
  }

  async delete(id: number): Promise<User> {
    this.calls.push(`delete:${id}`)
    return this.getById(id)
  }
}

export class FakeAuthService implements AuthRepository {
  async login({ username, password }: LoginCredentials): Promise<LoginResponse> {
    if (password !== 'emilyspass') throw new HttpError(400, 'Invalid credentials')
    return {
      ...makeUser(1, { username, firstName: 'Emily', lastName: 'Johnson' }),
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
    }
  }

  async me(): Promise<User> {
    return makeUser(1, { firstName: 'Emily', lastName: 'Johnson' })
  }

  async refresh(): Promise<AuthTokens> {
    return { accessToken: 'access-2', refreshToken: 'refresh-2' }
  }
}
