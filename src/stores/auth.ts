import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { ServiceProvider } from '@/services/service-provider'
import type { AuthUser, LoginCredentials } from '@/types/auth'
import type { User } from '@/types/user'

export const AUTH_STORAGE_KEY = 'vue-lottery-app:auth'

interface PersistedAuth {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
}

function readPersisted(): PersistedAuth {
  const empty: PersistedAuth = { accessToken: null, refreshToken: null, user: null }
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return empty
    const parsed = JSON.parse(raw) as Partial<PersistedAuth>
    return {
      accessToken: typeof parsed.accessToken === 'string' ? parsed.accessToken : null,
      refreshToken: typeof parsed.refreshToken === 'string' ? parsed.refreshToken : null,
      user: parsed.user ?? null,
    }
  } catch {
    return empty
  }
}

function toAuthUser({ id, username, email, firstName, lastName, gender, image }: AuthUser | User) {
  return { id, username, email, firstName, lastName, gender, image }
}

export const useAuthStore = defineStore('auth', () => {
  const persisted = readPersisted()
  const accessToken = ref<string | null>(persisted.accessToken)
  const refreshToken = ref<string | null>(persisted.refreshToken)
  const user = ref<AuthUser | null>(persisted.user)

  const isAuthenticated = computed(() => accessToken.value !== null)
  const displayName = computed(() =>
    user.value ? `${user.value.firstName} ${user.value.lastName}`.trim() : '',
  )

  watch(
    [accessToken, refreshToken, user],
    () => {
      try {
        if (accessToken.value === null) localStorage.removeItem(AUTH_STORAGE_KEY)
        else
          localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({
              accessToken: accessToken.value,
              refreshToken: refreshToken.value,
              user: user.value,
            }),
          )
      } catch {
        return
      }
    },
    { deep: true },
  )

  async function login(credentials: LoginCredentials): Promise<void> {
    const response = await ServiceProvider.auth.login(credentials)
    accessToken.value = response.accessToken
    refreshToken.value = response.refreshToken
    user.value = toAuthUser(response)
  }

  async function fetchCurrentUser(): Promise<void> {
    if (!isAuthenticated.value) return
    user.value = toAuthUser(await ServiceProvider.auth.me())
  }

  async function refresh(): Promise<boolean> {
    if (!refreshToken.value) return false
    try {
      const tokens = await ServiceProvider.auth.refresh(refreshToken.value)
      accessToken.value = tokens.accessToken
      refreshToken.value = tokens.refreshToken
      return true
    } catch {
      return false
    }
  }

  function logout(): void {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
  }

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    displayName,
    login,
    fetchCurrentUser,
    refresh,
    logout,
  }
})
