<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <section class="card">
    <div class="card-body text-center py-5">
      <p class="display-code fw-bold text-primary mb-2">404</p>
      <h1 class="fs-4 fw-bold">Page not found</h1>
      <p class="text-body-secondary">
        There is no page at <code>{{ route.fullPath }}</code
        >.
      </p>
      <RouterLink
        :to="{ name: 'home' }"
        class="btn btn-primary d-inline-flex align-items-center gap-2"
      >
        <i class="bi bi-house" aria-hidden="true"></i>
        Go to home page
      </RouterLink>
    </div>
  </section>
</template>

<style scoped lang="scss">
.display-code {
  font-size: 4rem;
  line-height: 1;
}
</style>
