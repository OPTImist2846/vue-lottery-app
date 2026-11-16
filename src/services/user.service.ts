import { http } from '@/api/http-client'
import type { CreateUserDto, ListParams, Page, UpdateUserDto, User } from '@/types/user'
import type { Creatable, Deletable, Editable, Readable, Searchable } from './interfaces'

interface UsersResponse {
  users: User[]
  total: number
  skip: number
  limit: number
}

export type UserRepository = Readable<User> &
  Searchable<User> &
  Creatable<User, CreateUserDto> &
  Editable<User, UpdateUserDto> &
  Deletable<User>

function toPage({ users, total, skip, limit }: UsersResponse): Page<User> {
  return { items: users, total, skip, limit }
}

export class UserService implements UserRepository {
  async getAll({ limit = 10, skip = 0, sortBy, order }: ListParams = {}): Promise<Page<User>> {
    return toPage(await http<UsersResponse>('/users', { query: { limit, skip, sortBy, order } }))
  }

  async search(
    query: string,
    { limit = 10, skip = 0, sortBy, order }: ListParams = {},
  ): Promise<Page<User>> {
    return toPage(
      await http<UsersResponse>('/users/search', {
        query: { q: query, limit, skip, sortBy, order },
      }),
    )
  }

  getById(id: number): Promise<User> {
    return http<User>(`/users/${id}`)
  }

  create(data: CreateUserDto): Promise<User> {
    return http<User>('/users/add', { method: 'POST', body: data })
  }

  update(id: number, data: UpdateUserDto): Promise<User> {
    return http<User>(`/users/${id}`, { method: 'PUT', body: data })
  }

  delete(id: number): Promise<User> {
    return http<User>(`/users/${id}`, { method: 'DELETE' })
  }
}
