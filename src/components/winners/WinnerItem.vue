<script setup lang="ts">
const { name } = defineProps<{
  name: string
}>()

const emit = defineEmits<{
  remove: []
}>()
</script>

<template>
  <span class="winner-item badge text-bg-primary">
    {{ name }}
    <button
      type="button"
      class="winner-item__remove"
      :aria-label="`Remove ${name} from winners`"
      @click="emit('remove')"
    >
      <i class="bi bi-x" aria-hidden="true"></i>
    </button>
  </span>
</template>

<style scoped lang="scss">
.winner-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem 0.25rem 0.3rem 0.5rem;
  font-weight: 600;

  &__remove {
    display: inline-flex;
    padding: 0;
    border: 0;
    color: inherit;
    background: none;
    line-height: 1;
    opacity: 0.8;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      opacity: 1;
    }
  }
}
</style>
