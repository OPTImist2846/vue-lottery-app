<script setup lang="ts">
import { APP_NAME } from '@/constants'

const { size = 'md' } = defineProps<{
  size?: 'md' | 'lg'
}>()
</script>

<template>
  <RouterLink
    :to="{ name: 'home' }"
    class="app-logo d-inline-flex align-items-center gap-2"
    :class="`app-logo--${size}`"
    :aria-label="`${APP_NAME} home`"
  >
    <span class="app-logo__mark" aria-hidden="true"><i class="bi bi-ticket-perforated"></i></span>
    <span class="app-logo__text">{{ APP_NAME }}</span>
  </RouterLink>
</template>

<style scoped lang="scss">
.app-logo {
  color: var(--bs-body-color);
  font-weight: 700;
  text-decoration: none;

  &__mark {
    display: inline-grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.375rem;
    color: #fff;
    background-color: var(--bs-primary);
  }

  &--lg {
    font-size: 1.25rem;

    .app-logo__mark {
      width: 2.5rem;
      height: 2.5rem;
    }
  }
}
</style>
