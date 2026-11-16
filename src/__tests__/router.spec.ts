import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import { createAppRouter } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { nextSort, parseUsersQuery, toRouteQuery } from '@/utils/users-query'

describe('router', () => {
  beforeEach(() => setActivePinia(createPinia()))

  async function navigate(path: string) {
    const router = createAppRouter(createMemoryHistory())
    await router.push(path)
    return router.currentRoute.value
  }

  it('redirects guests from protected pages to login with a redirect parameter', async () => {
    const route = await navigate('/users/5/edit?tab=1')

    expect(route.name).toBe('login')
    expect(route.query.redirect).toBe('/users/5/edit?tab=1')
    expect(document.title).toBe('Login · Vue Lottery')
  })

  it('lets authenticated users open nested user routes with props', async () => {
    useAuthStore().accessToken = 'token'

    const route = await navigate('/users/5/edit')

    expect(route.name).toBe('user-edit')
    expect(route.params.id).toBe('5')
    expect(route.meta.requiresAuth).toBe(true)
    expect(route.meta.layout).toBeUndefined()
    expect(document.title).toBe('Edit user · Vue Lottery')
  })

  it('sends authenticated users from login to users', async () => {
    useAuthStore().accessToken = 'token'

    expect((await navigate('/login')).name).toBe('users')
  })

  it('uses the auth layout for login and a catch-all 404 route', async () => {
    expect((await navigate('/login')).meta.layout).toBe('auth')
    expect((await navigate('/missing/page')).name).toBe('not-found')
    expect((await navigate('/users/abc')).name).toBe('not-found')
  })
})

describe('users query', () => {
  it('parses page, search and sort from the URL and ignores invalid values', () => {
    expect(parseUsersQuery({ page: '2', q: ' john ', sortBy: 'age', order: 'desc' })).toEqual({
      page: 2,
      q: 'john',
      sortBy: 'age',
      order: 'desc',
    })
    expect(parseUsersQuery({ page: '-3', sortBy: 'password' })).toEqual({
      page: 1,
      q: '',
      sortBy: undefined,
      order: undefined,
    })
  })

  it('omits default values when building the URL query', () => {
    expect(toRouteQuery({ page: 1, q: '' })).toEqual({})
    expect(toRouteQuery({ page: 2, q: 'john', sortBy: 'firstName', order: 'asc' })).toEqual({
      page: '2',
      q: 'john',
      sortBy: 'firstName',
      order: 'asc',
    })
  })

  it('toggles the sort direction on a repeated click', () => {
    expect(nextSort({}, 'age')).toEqual({ sortBy: 'age', order: 'asc' })
    expect(nextSort({ sortBy: 'age', order: 'asc' }, 'age')).toEqual({
      sortBy: 'age',
      order: 'desc',
    })
    expect(nextSort({ sortBy: 'age', order: 'desc' }, 'firstName')).toEqual({
      sortBy: 'firstName',
      order: 'asc',
    })
  })
})
