<script setup lang="ts">
import { computed } from 'vue'

const { variant = 'danger' } = defineProps<{
  variant?: 'danger' | 'success' | 'info' | 'warning'
}>()

defineSlots<{
  default?: () => unknown
  action?: () => unknown
}>()

const icon = computed(
  () =>
    ({
      danger: 'exclamation-triangle',
      warning: 'exclamation-triangle',
      success: 'check-circle',
      info: 'info-circle',
    })[variant],
)
</script>

<template>
  <div
    class="alert d-flex align-items-center gap-2 mb-0"
    :class="`alert-${variant}`"
    :role="variant === 'danger' ? 'alert' : 'status'"
  >
    <i class="bi" :class="`bi-${icon}`" aria-hidden="true"></i>
    <div class="flex-grow-1"><slot /></div>
    <slot name="action" />
  </div>
</template>
