export class HttpError extends Error {
  readonly status: number
  readonly data: unknown

  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.data = data
  }
}

export interface HttpInterceptors {
  getAccessToken: () => string | null
  refreshAccessToken: () => Promise<boolean>
  onAuthFailure: () => void
}

export type QueryValue = string | number | undefined | null

export interface HttpOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  query?: Record<string, QueryValue>
  auth?: boolean
  retryOnUnauthorized?: boolean
}

let interceptors: HttpInterceptors | null = null
let pendingRefresh: Promise<boolean> | null = null

export function setupHttpInterceptors(value: HttpInterceptors | null): void {
  interceptors = value
  pendingRefresh = null
}

function baseUrl(): string {
  const url = import.meta.env.VITE_API_URL
  if (!url) throw new Error('VITE_API_URL is not set. Copy .env.example to .env.')
  return url.replace(/\/+$/, '')
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${baseUrl()}${path}`)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '')
      url.searchParams.set(key, String(value))
  }
  return url.toString()
}

function refreshOnce(): Promise<boolean> {
  if (!interceptors) return Promise.resolve(false)
  pendingRefresh ??= interceptors.refreshAccessToken().finally(() => {
    pendingRefresh = null
  })
  return pendingRefresh
}

function errorMessage(data: unknown, response: Response): string {
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message
  }
  return `HTTP ${response.status}: ${response.statusText || 'Request failed'}`
}

export async function http<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const { body, query, auth = true, retryOnUnauthorized = true, headers, ...init } = options
  const token = auth ? (interceptors?.getAccessToken() ?? null) : null

  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 401 && auth && retryOnUnauthorized && interceptors) {
    if (await refreshOnce()) return http<T>(path, { ...options, retryOnUnauthorized: false })
    interceptors.onAuthFailure()
  }

  const data: unknown = await response.json().catch(() => undefined)
  if (!response.ok) throw new HttpError(response.status, errorMessage(data, response), data)
  return data as T
}
