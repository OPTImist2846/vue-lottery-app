<script setup lang="ts">
import { computed } from 'vue'

const { totalPages, disabled = false } = defineProps<{
  totalPages: number
  disabled?: boolean
}>()

const page = defineModel<number>('page', { required: true })

type PageItem = number | 'gap-start' | 'gap-end'

const items = computed<PageItem[]>(() => {
  const last = totalPages
  const current = page.value
  if (last <= 7) return Array.from({ length: last }, (_, index) => index + 1)
  const start = Math.max(2, current - 1)
  const end = Math.min(last - 1, current + 1)
  const middle = Array.from({ length: end - start + 1 }, (_, index) => start + index)
  return [
    1,
    ...(start > 2 ? (['gap-start'] as const) : []),
    ...middle,
    ...(end < last - 1 ? (['gap-end'] as const) : []),
    last,
  ]
})

function go(target: number): void {
  if (disabled || target < 1 || target > totalPages || target === page.value) return
  page.value = target
}
</script>

<template>
  <nav v-if="totalPages > 1" aria-label="Pagination">
    <ul class="pagination pagination-sm justify-content-center mb-0">
      <li class="page-item" :class="{ disabled: disabled || page <= 1 }">
        <button type="button" class="page-link" aria-label="Previous page" @click="go(page - 1)">
          &laquo;
        </button>
      </li>
      <li
        v-for="item in items"
        :key="item"
        class="page-item"
        :class="{ active: item === page, disabled: typeof item !== 'number' || disabled }"
      >
        <span v-if="typeof item !== 'number'" class="page-link">…</span>
        <button
          v-else
          type="button"
          class="page-link"
          :aria-current="item === page ? 'page' : undefined"
          @click="go(item)"
        >
          {{ item }}
        </button>
      </li>
      <li class="page-item" :class="{ disabled: disabled || page >= totalPages }">
        <button type="button" class="page-link" aria-label="Next page" @click="go(page + 1)">
          &raquo;
        </button>
      </li>
    </ul>
  </nav>
</template>
