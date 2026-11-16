import { defineStore } from 'pinia'
import { ref } from 'vue'
import { HttpError } from '@/api/http-client'
import { LOCAL_USER_ID_START, PAGE_SIZE } from '@/constants'
import { ServiceProvider } from '@/services/service-provider'
import type {
  CreateUserDto,
  Page,
  SortOrder,
  UpdateUserDto,
  User,
  UserSortField,
} from '@/types/user'
import { useLotteryStore } from './lottery'

export interface UsersQuery {
  page: number
  q: string
  sortBy?: UserSortField
  order?: SortOrder
}

function matchesQuery(user: User, q: string): boolean {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  return [user.firstName, user.lastName, user.username, user.email].some((value) =>
    value.toLowerCase().includes(needle),
  )
}

export const useUsersStore = defineStore('users', () => {
  const created = ref<User[]>([])
  const updated = ref<Record<number, User>>({})
  const deletedIds = ref<number[]>([])
  const lastListQuery = ref<Record<string, string>>({})
  let nextLocalId = LOCAL_USER_ID_START

  function isLocal(id: number): boolean {
    return created.value.some((user) => user.id === id)
  }

  function isDeleted(id: number): boolean {
    return deletedIds.value.includes(id)
  }

  function resolve(user: User): User {
    return created.value.find((item) => item.id === user.id) ?? updated.value[user.id] ?? user
  }

  function fetchPage({ page, q, sortBy, order }: UsersQuery): Promise<Page<User>> {
    const params = { limit: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE, sortBy, order }
    return q.trim()
      ? ServiceProvider.users.search(q.trim(), params)
      : ServiceProvider.users.getAll(params)
  }

  function present(serverPage: Page<User> | null, { page, q }: Pick<UsersQuery, 'page' | 'q'>) {
    const local = created.value.filter((user) => matchesQuery(user, q))
    const remote = (serverPage?.items ?? []).filter((user) => !isDeleted(user.id)).map(resolve)
    const removed = q.trim() ? 0 : deletedIds.value.length
    return {
      users: page === 1 ? [...local, ...remote] : remote,
      total: Math.max((serverPage?.total ?? 0) + local.length - removed, 0),
    }
  }

  async function fetchById(id: number): Promise<User> {
    const local = created.value.find((user) => user.id === id)
    if (local) return local
    if (isDeleted(id)) throw new HttpError(404, `User with id '${id}' not found`)
    return resolve(await ServiceProvider.users.getById(id))
  }

  async function create(data: CreateUserDto): Promise<User> {
    const response = await ServiceProvider.users.create(data)
    const user: User = { ...response, ...data, id: nextLocalId }
    nextLocalId += 1
    created.value.unshift(user)
    return user
  }

  async function update(id: number, data: UpdateUserDto): Promise<User> {
    const lottery = useLotteryStore()
    const index = created.value.findIndex((user) => user.id === id)
    if (index !== -1) {
      const user = { ...created.value[index]!, ...data }
      created.value.splice(index, 1, user)
      lottery.syncWinner(user)
      return user
    }
    const response = await ServiceProvider.users.update(id, data)
    const user: User = { ...updated.value[id], ...response, ...data, id }
    updated.value[id] = user
    lottery.syncWinner(user)
    return user
  }

  async function remove(id: number): Promise<void> {
    if (isLocal(id)) {
      created.value = created.value.filter((user) => user.id !== id)
    } else {
      await ServiceProvider.users.delete(id)
      deletedIds.value.push(id)
      delete updated.value[id]
    }
    useLotteryStore().removeWinner(id)
  }

  return {
    created,
    updated,
    deletedIds,
    lastListQuery,
    isLocal,
    resolve,
    fetchPage,
    present,
    fetchById,
    create,
    update,
    remove,
  }
})
