import type { Router } from 'vue-router'
import { setupHttpInterceptors } from '@/api/http-client'
import { useAuthStore } from '@/stores/auth'

export function setupHttp(router: Router): void {
  const auth = useAuthStore()
  setupHttpInterceptors({
    getAccessToken: () => auth.accessToken,
    refreshAccessToken: () => auth.refresh(),
    onAuthFailure: () => {
      auth.logout()
      const current = router.currentRoute.value
      if (current.meta.requiresAuth) {
        void router.push({ name: 'login', query: { redirect: current.fullPath } })
      }
    },
  })
}
