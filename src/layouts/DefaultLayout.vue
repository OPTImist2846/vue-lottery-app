<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import { APP_NAME, PROJECT_REPOSITORY_URL } from '@/constants'
</script>

<template>
  <div class="default-layout d-flex flex-column">
    <AppHeader />
    <main class="container app-container flex-grow-1 py-4">
      <slot />
    </main>
    <footer class="container app-container py-3 text-center text-body-secondary">
      {{ APP_NAME }} ·
      <a :href="PROJECT_REPOSITORY_URL" target="_blank" rel="noopener">GitHub</a>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.default-layout {
  min-height: 100vh;
}
</style>
