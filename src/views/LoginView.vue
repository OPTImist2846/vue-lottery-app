<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoginForm from '@/components/auth/LoginForm.vue'
import { useAuthStore } from '@/stores/auth'
import type { LoginCredentials } from '@/types/auth'
import { errorMessage } from '@/utils/user'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const pending = ref(false)
const serverError = ref<string | undefined>(undefined)

function redirectTarget(): string {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect
    : '/users'
}

async function login(credentials: LoginCredentials): Promise<void> {
  pending.value = true
  serverError.value = undefined
  try {
    await auth.login(credentials)
    await auth.fetchCurrentUser().catch(() => undefined)
    await router.replace(redirectTarget())
  } catch (error) {
    serverError.value = errorMessage(error, 'Login failed. Please try again.')
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section class="card">
    <div class="card-body p-4">
      <h1 class="fs-5 fw-bold mb-1">Sign in</h1>
      <p class="text-body-secondary mb-4">
        Use a DummyJSON account, for example <code>emilys</code> / <code>emilyspass</code>.
      </p>
      <LoginForm :pending="pending" :server-error="serverError" @submit="login" />
    </div>
  </section>
</template>
