import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError, http, setupHttpInterceptors } from '@/api/http-client'

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('http client', () => {
  const fetchMock = vi.fn<typeof fetch>()
  let token = 'expired'
  const interceptors = {
    getAccessToken: () => token,
    refreshAccessToken: vi.fn<() => Promise<boolean>>(async () => {
      token = 'fresh'
      return true
    }),
    onAuthFailure: vi.fn<() => void>(),
  }

  beforeEach(() => {
    token = 'expired'
    fetchMock.mockReset()
    interceptors.refreshAccessToken.mockClear()
    interceptors.onAuthFailure.mockClear()
    vi.stubGlobal('fetch', fetchMock)
    setupHttpInterceptors(interceptors)
  })

  afterEach(() => setupHttpInterceptors(null))

  it('builds the URL from VITE_API_URL and skips empty query values', async () => {
    fetchMock.mockResolvedValue(json(200, { ok: true }))

    await http('/users/search', { query: { q: 'john', limit: 10, sortBy: undefined, order: '' } })

    expect(fetchMock.mock.calls[0]![0]).toBe('https://api.test/users/search?q=john&limit=10')
  })

  it('adds the Bearer token and JSON body', async () => {
    fetchMock.mockResolvedValue(json(200, {}))

    await http('/users/add', { method: 'POST', body: { firstName: 'A' } })

    const init = fetchMock.mock.calls[0]![1]!
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer expired',
      'Content-Type': 'application/json',
    })
    expect(init.body).toBe('{"firstName":"A"}')
  })

  it('refreshes the token once on 401 and retries the request', async () => {
    fetchMock
      .mockResolvedValueOnce(json(401, { message: 'Invalid/Expired Token!' }))
      .mockResolvedValueOnce(json(200, { id: 1 }))

    await expect(http('/auth/me')).resolves.toEqual({ id: 1 })

    expect(interceptors.refreshAccessToken).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[1]![1]!.headers).toMatchObject({ Authorization: 'Bearer fresh' })
  })

  it('shares one refresh between parallel 401 responses', async () => {
    fetchMock
      .mockResolvedValueOnce(json(401, {}))
      .mockResolvedValueOnce(json(401, {}))
      .mockResolvedValue(json(200, {}))

    await Promise.all([http('/auth/me'), http('/auth/me')])

    expect(interceptors.refreshAccessToken).toHaveBeenCalledTimes(1)
  })

  it('reports an auth failure when the refresh fails', async () => {
    interceptors.refreshAccessToken.mockResolvedValueOnce(false)
    fetchMock.mockResolvedValue(json(401, { message: 'Invalid/Expired Token!' }))

    await expect(http('/auth/me')).rejects.toMatchObject({ status: 401 })
    expect(interceptors.onAuthFailure).toHaveBeenCalledTimes(1)
  })

  it('does not refresh for requests without auth', async () => {
    fetchMock.mockResolvedValue(json(400, { message: 'Invalid credentials' }))

    const request = http('/auth/login', { method: 'POST', body: {}, auth: false })

    await expect(request).rejects.toBeInstanceOf(HttpError)
    await expect(request).rejects.toMatchObject({ status: 400, message: 'Invalid credentials' })
    expect(interceptors.refreshAccessToken).not.toHaveBeenCalled()
    expect(fetchMock.mock.calls[0]![1]!.headers).not.toHaveProperty('Authorization')
  })
})
