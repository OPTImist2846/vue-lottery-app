<script setup lang="ts">
import { AUTHOR_GITHUB_URL } from '@/constants'

const AUTHOR = {
  fullName: 'Фисюк Олексій Ігорович',
  github: 'OPTImist2846',
}

const SKILL_GROUPS = [
  { title: 'Languages', skills: ['HTML5', 'CSS3 / SCSS', 'JavaScript (ES2023)', 'TypeScript'] },
  { title: 'Frameworks', skills: ['Vue 3', 'Vue Router', 'Pinia', 'Bootstrap 5'] },
  { title: 'Tooling', skills: ['Vite', 'Webpack', 'ESLint', 'Prettier', 'Husky'] },
  { title: 'Testing', skills: ['Vitest', 'Mocha', 'Vue Test Utils', 'JUnit 5'] },
  { title: 'Other', skills: ['Git & GitHub', 'REST API', 'JWT', 'PostgreSQL'] },
]
</script>

<template>
  <div class="d-grid gap-3">
    <section class="card">
      <div class="card-body p-4 d-flex flex-wrap align-items-center gap-4">
        <img
          :src="`https://github.com/${AUTHOR.github}.png?size=160`"
          alt=""
          width="96"
          height="96"
          class="rounded-circle bg-body-secondary"
        />
        <div>
          <p class="text-body-secondary mb-1">Student</p>
          <h1 class="fs-3 fw-bold mb-2">{{ AUTHOR.fullName }}</h1>
          <a
            :href="AUTHOR_GITHUB_URL"
            target="_blank"
            rel="noopener"
            class="d-inline-flex align-items-center gap-2"
          >
            <i class="bi bi-github" aria-hidden="true"></i>
            github.com/{{ AUTHOR.github }}
          </a>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-body">
        <h2 class="section-title mb-3">Technical skills</h2>
        <dl class="row mb-0">
          <template v-for="group in SKILL_GROUPS" :key="group.title">
            <dt class="col-sm-3 py-2">{{ group.title }}</dt>
            <dd class="col-sm-9 py-2 mb-0 d-flex flex-wrap gap-2">
              <span v-for="skill in group.skills" :key="skill" class="badge text-bg-light">
                {{ skill }}
              </span>
            </dd>
          </template>
        </dl>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.badge {
  font-size: 0.8125rem;
  font-weight: 600;
  border: 1px solid var(--bs-border-color);
}
</style>
