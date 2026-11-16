<script setup lang="ts">
type ButtonVariant =
  'primary' | 'secondary' | 'danger' | 'outline-primary' | 'outline-secondary' | 'outline-danger'

const {
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  icon = undefined,
} = defineProps<{
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  icon?: string
}>()
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn-${variant}`, { [`btn-${size}`]: size !== 'md' }]"
    :disabled="disabled"
  >
    <i v-if="icon" class="bi" :class="`bi-${icon}`" aria-hidden="true"></i>
    <slot />
  </button>
</template>

<style scoped lang="scss">
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  white-space: nowrap;
}
</style>
