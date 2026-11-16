<script setup lang="ts">
import AppLogo from '@/components/layout/AppLogo.vue'
</script>

<template>
  <main class="auth-layout d-flex flex-column align-items-center justify-content-center gap-4 p-3">
    <AppLogo size="lg" />
    <div class="auth-layout__panel">
      <slot />
    </div>
    <RouterLink :to="{ name: 'home' }" class="d-inline-flex align-items-center gap-2">
      <i class="bi bi-arrow-left" aria-hidden="true"></i>
      Back to home
    </RouterLink>
  </main>
</template>

<style scoped lang="scss">
.auth-layout {
  min-height: 100vh;

  &__panel {
    width: 100%;
    max-width: 24rem;
  }
}
</style>
