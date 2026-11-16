<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { FILTER_DEBOUNCE_MS } from '@/constants'

const { placeholder = 'Search by name', initialQuery = '' } = defineProps<{
  placeholder?: string
  initialQuery?: string
}>()

const emit = defineEmits<{
  'filter-by-name': [query: string]
}>()

const query = ref(initialQuery)

watch(
  () => initialQuery,
  (value) => {
    if (value !== query.value.trim()) query.value = value
  },
)

watch(query, (value, _previous, onCleanup) => {
  const timer = setTimeout(() => emit('filter-by-name', value.trim()), FILTER_DEBOUNCE_MS)
  onCleanup(() => clearTimeout(timer))
})
</script>

<template>
  <div class="search-bar" role="search">
    <i class="search-bar__icon bi bi-search" aria-hidden="true"></i>
    <BaseInput v-model="query" type="search" :placeholder="placeholder" autocomplete="off" />
  </div>
</template>

<style scoped lang="scss">
.search-bar {
  position: relative;

  &__icon {
    position: absolute;
    top: 50%;
    left: 0.75rem;
    z-index: 1;
    color: #aaa;
    transform: translateY(-50%);
    pointer-events: none;
  }

  :deep(.form-control) {
    padding-left: 2.25rem;
  }
}
</style>
