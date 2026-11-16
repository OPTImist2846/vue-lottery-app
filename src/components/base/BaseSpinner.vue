<script setup lang="ts">
const { label = 'Loading…' } = defineProps<{
  label?: string
}>()
</script>

<template>
  <div class="d-flex align-items-center justify-content-center gap-2 py-4 text-body-secondary">
    <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
    <span role="status">{{ label }}</span>
  </div>
</template>
