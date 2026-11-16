<script setup lang="ts">
import { APP_NAME, MAX_WINNERS, PROJECT_REPOSITORY_URL } from '@/constants'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const FEATURES = [
  'Users from the DummyJSON REST API with pagination, search and sorting kept in the URL',
  `Random selection of up to ${MAX_WINNERS} unique winners`,
  'User details, nested edit route and delete confirmation in a modal window',
  'JWT login with automatic access token refresh on 401 responses',
  'Protected routes with navigation guards, route meta fields and layouts',
]

const TECHNOLOGIES = [
  'Vue 3 (Composition API)',
  'TypeScript',
  'Vue Router',
  'Pinia',
  'VeeValidate + Zod',
  'Bootstrap 5 (SCSS)',
  'Vite',
  'Vitest',
  'ESLint + Prettier',
  'DummyJSON API',
]
</script>

<template>
  <div class="d-grid gap-3">
    <section class="card">
      <div class="card-body p-4">
        <h1 class="fs-3 fw-bold">{{ APP_NAME }}</h1>
        <p class="text-body-secondary mb-3">
          A single page lottery application. Signed in users browse participants loaded from a REST
          API, register new ones and draw random winners. The project is built step by step during
          the client web systems course.
        </p>
        <div class="d-flex flex-wrap gap-2">
          <RouterLink
            :to="{ name: auth.isAuthenticated ? 'users' : 'login' }"
            class="btn btn-primary d-inline-flex align-items-center gap-2"
          >
            <i class="bi bi-people" aria-hidden="true"></i>
            {{ auth.isAuthenticated ? 'Open users' : 'Login to start' }}
          </RouterLink>
          <a
            :href="PROJECT_REPOSITORY_URL"
            target="_blank"
            rel="noopener"
            class="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
          >
            <i class="bi bi-github" aria-hidden="true"></i>
            Project on GitHub
          </a>
        </div>
      </div>
    </section>

    <div class="row g-3">
      <section class="col-md-7">
        <div class="card h-100">
          <div class="card-body">
            <h2 class="section-title mb-3">Features</h2>
            <ul class="list-group list-group-flush">
              <li v-for="feature in FEATURES" :key="feature" class="list-group-item px-0">
                <i class="bi bi-check-circle text-success me-2" aria-hidden="true"></i>
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </section>
      <section class="col-md-5">
        <div class="card h-100">
          <div class="card-body">
            <h2 class="section-title mb-3">Technologies</h2>
            <div class="d-flex flex-wrap gap-2">
              <span
                v-for="technology in TECHNOLOGIES"
                :key="technology"
                class="badge text-bg-light"
              >
                {{ technology }}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.h-100 {
  height: 100%;
}

.badge {
  font-size: 0.8125rem;
  font-weight: 600;
  border: 1px solid var(--bs-border-color);
}
</style>
