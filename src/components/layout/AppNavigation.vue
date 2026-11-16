<script setup lang="ts">
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'

interface NavItem {
  label: string
  icon: string
  to: RouteLocationRaw
  section: string
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home', icon: 'house', to: { name: 'home' }, section: '/' },
  { label: 'About author', icon: 'person-badge', to: { name: 'about' }, section: '/about' },
  { label: 'Users', icon: 'people', to: { name: 'users' }, section: '/users' },
]

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

function isActive(section: string): boolean {
  if (section === '/') return route.path === '/'
  return route.path === section || route.path.startsWith(`${section}/`)
}

async function logout(): Promise<void> {
  auth.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <nav class="app-navigation d-flex flex-wrap align-items-center gap-2" aria-label="Main">
    <ul class="nav nav-pills gap-1">
      <li v-for="item in NAV_ITEMS" :key="item.section" class="nav-item">
        <RouterLink
          :to="item.to"
          class="nav-link d-flex align-items-center gap-2"
          :class="{ active: isActive(item.section) }"
          :aria-current="isActive(item.section) ? 'page' : undefined"
        >
          <i class="bi" :class="`bi-${item.icon}`" aria-hidden="true"></i>
          {{ item.label }}
        </RouterLink>
      </li>
    </ul>
    <BaseButton
      v-if="auth.isAuthenticated"
      variant="outline-secondary"
      size="sm"
      icon="box-arrow-right"
      @click="logout"
    >
      Logout
    </BaseButton>
    <RouterLink
      v-else
      :to="{ name: 'login' }"
      class="btn btn-sm btn-primary d-inline-flex align-items-center gap-2"
      :class="{ active: isActive('/login') }"
    >
      <i class="bi bi-box-arrow-in-right" aria-hidden="true"></i>
      Login
    </RouterLink>
  </nav>
</template>

<style scoped lang="scss">
.nav-link {
  --bs-nav-link-color: var(--bs-body-color);
  --bs-nav-link-hover-color: var(--bs-primary);
  --bs-nav-link-padding-y: 0.375rem;
  --bs-nav-link-padding-x: 0.75rem;
  font-weight: 600;
}
</style>
