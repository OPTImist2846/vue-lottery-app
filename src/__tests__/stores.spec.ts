import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { ServiceProvider } from '@/services/service-provider'
import { AUTH_STORAGE_KEY, useAuthStore } from '@/stores/auth'
import { useLotteryStore } from '@/stores/lottery'
import { useUsersStore } from '@/stores/users'
import type { CreateUserDto } from '@/types/user'
import { FakeAuthService, FakeUserService, makeUser } from './fakes'

const newUser: CreateUserDto = {
  firstName: 'Anna',
  lastName: 'Koval',
  email: 'anna@example.com',
  username: 'annak',
  password: 'secret123',
  age: 25,
  gender: 'female',
  phone: '+380 63 000 0000',
}

describe('stores', () => {
  let users: FakeUserService

  beforeEach(() => {
    setActivePinia(createPinia())
    users = new FakeUserService()
    ServiceProvider.override({ users, auth: new FakeAuthService() })
  })

  afterEach(() => ServiceProvider.reset())

  describe('users store', () => {
    it('adds a created user to the first page with a unique local id', async () => {
      const store = useUsersStore()
      const first = await store.create(newUser)
      const second = await store.create({ ...newUser, email: 'other@example.com' })

      expect(first.id).not.toBe(second.id)
      const page = await store.fetchPage({ page: 1, q: '' })
      const view = store.present(page, { page: 1, q: '' })
      expect(view.users.slice(0, 2).map((user) => user.id)).toEqual([second.id, first.id])
      expect(view.total).toBe(5)
      expect(store.present(page, { page: 2, q: '' }).users).toHaveLength(3)
    })

    it('shows the server response of an update without refetching', async () => {
      const store = useUsersStore()
      const page = await store.fetchPage({ page: 1, q: '' })

      await store.update(2, { firstName: 'Changed' })

      expect(store.present(page, { page: 1, q: '' }).users[1]!.firstName).toBe('Changed')
      expect((await store.fetchById(2)).firstName).toBe('Changed')
    })

    it('updates locally created users without calling the API', async () => {
      const store = useUsersStore()
      const created = await store.create(newUser)

      await store.update(created.id, { age: 30 })

      expect((await store.fetchById(created.id)).age).toBe(30)
      expect(users.calls).not.toContain(`update:${created.id}`)
    })

    it('hides a deleted user and removes them from the winners', async () => {
      const store = useUsersStore()
      const lottery = useLotteryStore()
      const page = await store.fetchPage({ page: 1, q: '' })
      lottery.draw([page.items[0]!])

      await store.remove(1)

      expect(users.calls).toContain('delete:1')
      expect(store.present(page, { page: 1, q: '' }).users.map((user) => user.id)).toEqual([2, 3])
      expect(lottery.winners).toEqual([])
      await expect(store.fetchById(1)).rejects.toMatchObject({ status: 404 })
    })

    it('uses search when a query is present', async () => {
      const store = useUsersStore()

      const page = await store.fetchPage({ page: 1, q: ' first2 ' })

      expect(users.calls).toEqual(['search:first2'])
      expect(page.items.map((user) => user.id)).toEqual([2])
    })
  })

  describe('lottery store', () => {
    it('draws at most three unique winners', () => {
      const lottery = useLotteryStore()
      const list = [1, 2, 3, 4, 5].map((id) => makeUser(id))

      for (let i = 0; i < 5; i += 1) lottery.draw(list, () => 0)

      expect(lottery.winners.map((user) => user.id)).toEqual([1, 2, 3])
      expect(lottery.canDrawFrom(list)).toBe(false)
    })

    it('cannot draw from an empty list or when everyone already won', () => {
      const lottery = useLotteryStore()
      const only = [makeUser(1)]

      expect(lottery.canDrawFrom([])).toBe(false)
      lottery.draw(only)
      expect(lottery.canDrawFrom(only)).toBe(false)
    })
  })

  describe('auth store', () => {
    it('logs in, persists the tokens and clears them on logout', async () => {
      const auth = useAuthStore()

      await auth.login({ username: 'emilys', password: 'emilyspass' })
      await nextTick()

      expect(auth.isAuthenticated).toBe(true)
      expect(auth.displayName).toBe('Emily Johnson')
      expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)!)).toMatchObject({
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
      })

      auth.logout()
      await nextTick()

      expect(auth.isAuthenticated).toBe(false)
      expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
    })

    it('restores the session from localStorage and refreshes tokens', async () => {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ accessToken: 'old', refreshToken: 'refresh-old', user: null }),
      )
      const auth = useAuthStore()

      expect(auth.isAuthenticated).toBe(true)
      await expect(auth.refresh()).resolves.toBe(true)
      expect(auth.accessToken).toBe('access-2')
    })

    it('rejects invalid credentials without storing a token', async () => {
      const auth = useAuthStore()

      await expect(auth.login({ username: 'emilys', password: 'wrong-pass' })).rejects.toThrow(
        'Invalid credentials',
      )
      expect(auth.isAuthenticated).toBe(false)
    })
  })
})
