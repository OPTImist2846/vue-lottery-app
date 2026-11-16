<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import SearchBar from '@/components/participants/SearchBar.vue'
import type { Participant, SortKey, SortState } from '@/types/participant'
import { filterByName, sortParticipants } from '@/utils/participants'

interface SortColumn {
  key: SortKey
  label: string
  icons: { asc: string; desc: string }
}

const { participants } = defineProps<{
  participants: Participant[]
}>()

const emit = defineEmits<{
  edit: [participant: Participant]
  delete: [participant: Participant]
}>()

const SORT_COLUMNS: Record<SortKey, SortColumn> = {
  name: {
    key: 'name',
    label: 'Name',
    icons: { asc: 'sort-alpha-down', desc: 'sort-alpha-down-alt' },
  },
  birthDate: {
    key: 'birthDate',
    label: 'Date of Birth',
    icons: { asc: 'sort-numeric-down', desc: 'sort-numeric-down-alt' },
  },
}

const nameFilter = ref('')
const sort = ref<SortState | null>(null)

const visibleParticipants = computed(() =>
  sortParticipants(filterByName(participants, nameFilter.value), sort.value),
)

function toggleSort(key: SortKey): void {
  sort.value =
    sort.value?.key === key
      ? { key, direction: sort.value.direction === 'asc' ? 'desc' : 'asc' }
      : { key, direction: 'asc' }
}

function sortIcon(key: SortKey): string {
  const { icons } = SORT_COLUMNS[key]
  return sort.value?.key === key ? icons[sort.value.direction] : icons.asc
}

function ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
  if (sort.value?.key !== key) return 'none'
  return sort.value.direction === 'asc' ? 'ascending' : 'descending'
}
</script>

<template>
  <section class="card" aria-label="Participants">
    <div class="card-body">
      <SearchBar class="mb-3" @filter-by-name="nameFilter = $event" />
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th scope="col" class="text-body-secondary">#</th>
              <th
                v-for="column in SORT_COLUMNS"
                :key="column.key"
                scope="col"
                :aria-sort="ariaSort(column.key)"
              >
                <button
                  type="button"
                  class="sort-control"
                  :class="{ 'sort-control--active': sort?.key === column.key }"
                  @click="toggleSort(column.key)"
                >
                  {{ column.label }}
                  <i class="bi" :class="`bi-${sortIcon(column.key)}`" aria-hidden="true"></i>
                </button>
              </th>
              <th scope="col">Email</th>
              <th scope="col">Phone number</th>
              <th scope="col"><span class="visually-hidden">Edit</span></th>
              <th scope="col"><span class="visually-hidden">Delete</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(participant, index) in visibleParticipants" :key="participant.id">
              <td class="text-body-secondary">{{ index + 1 }}</td>
              <td>{{ participant.name }}</td>
              <td class="text-nowrap">{{ participant.birthDate }}</td>
              <td class="text-nowrap">{{ participant.email }}</td>
              <td class="text-nowrap">{{ participant.phone }}</td>
              <td class="text-end">
                <BaseButton
                  variant="outline-primary"
                  size="sm"
                  icon="pencil"
                  @click="emit('edit', participant)"
                >
                  Редагувати дані
                </BaseButton>
              </td>
              <td class="text-end">
                <BaseButton
                  variant="outline-danger"
                  size="sm"
                  icon="trash"
                  @click="emit('delete', participant)"
                >
                  Видалити учасника
                </BaseButton>
              </td>
            </tr>
            <tr v-if="visibleParticipants.length === 0">
              <td colspan="7" class="text-center text-body-secondary py-4">
                {{
                  participants.length === 0
                    ? 'No participants yet.'
                    : `No participants match “${nameFilter}”.`
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.table {
  --bs-table-bg: transparent;

  th {
    font-weight: 600;
    white-space: nowrap;
  }
}

.sort-control {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0;
  border: 0;
  color: inherit;
  background: none;
  font-weight: inherit;
  cursor: pointer;

  .bi {
    color: #bbb;
  }

  &--active .bi,
  &:hover .bi {
    color: var(--bs-primary);
  }
}
</style>
