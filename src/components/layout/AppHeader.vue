<script setup lang="ts">
import AppLogo from '@/components/layout/AppLogo.vue'
import AppNavigation from '@/components/layout/AppNavigation.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <header class="app-header bg-white">
    <div
      class="container app-container d-flex flex-wrap align-items-center justify-content-between gap-3 py-2"
    >
      <AppLogo />
      <div class="d-flex flex-wrap align-items-center gap-3">
        <span
          v-if="auth.isAuthenticated && auth.user"
          class="d-flex align-items-center gap-2 text-body-secondary"
        >
          <img
            v-if="auth.user.image"
            :src="auth.user.image"
            alt=""
            width="28"
            height="28"
            class="rounded-circle bg-body-secondary"
          />
          {{ auth.displayName }}
        </span>
        <AppNavigation />
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  border-bottom: 1px solid var(--bs-border-color);
}
</style>
