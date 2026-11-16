<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import type { SortOrder, User, UserSortField } from '@/types/user'
import { fullName } from '@/utils/user'

interface SortColumn {
  field: UserSortField
  label: string
  icons: { asc: string; desc: string }
}

const {
  users,
  sortBy = undefined,
  order = undefined,
  loading = false,
} = defineProps<{
  users: User[]
  sortBy?: UserSortField
  order?: SortOrder
  loading?: boolean
}>()

const emit = defineEmits<{
  sort: [field: UserSortField]
  delete: [user: User]
}>()

const NAME_COLUMN: SortColumn = {
  field: 'firstName',
  label: 'Name',
  icons: { asc: 'sort-alpha-down', desc: 'sort-alpha-down-alt' },
}

const AGE_COLUMN: SortColumn = {
  field: 'age',
  label: 'Age',
  icons: { asc: 'sort-numeric-down', desc: 'sort-numeric-down-alt' },
}

function sortIcon({ field, icons }: SortColumn): string {
  return sortBy === field && order === 'desc' ? icons.desc : icons.asc
}

function ariaSort(field: UserSortField): 'ascending' | 'descending' | 'none' {
  if (sortBy !== field) return 'none'
  return order === 'desc' ? 'descending' : 'ascending'
}
</script>

<template>
  <div class="table-responsive users-table" :class="{ 'users-table--loading': loading }">
    <table class="table table-hover align-middle mb-0">
      <thead>
        <tr>
          <th scope="col" class="text-body-secondary">#</th>
          <th scope="col" :aria-sort="ariaSort(NAME_COLUMN.field)">
            <button
              type="button"
              class="sort-control"
              :class="{ 'sort-control--active': sortBy === NAME_COLUMN.field }"
              @click="emit('sort', NAME_COLUMN.field)"
            >
              {{ NAME_COLUMN.label }}
              <i class="bi" :class="`bi-${sortIcon(NAME_COLUMN)}`" aria-hidden="true"></i>
            </button>
          </th>
          <th scope="col">Username</th>
          <th scope="col">Email</th>
          <th scope="col">Phone number</th>
          <th scope="col" :aria-sort="ariaSort(AGE_COLUMN.field)">
            <button
              type="button"
              class="sort-control"
              :class="{ 'sort-control--active': sortBy === AGE_COLUMN.field }"
              @click="emit('sort', AGE_COLUMN.field)"
            >
              {{ AGE_COLUMN.label }}
              <i class="bi" :class="`bi-${sortIcon(AGE_COLUMN)}`" aria-hidden="true"></i>
            </button>
          </th>
          <th scope="col">Gender</th>
          <th scope="col"><span class="visually-hidden">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td class="text-body-secondary">{{ user.id }}</td>
          <td class="text-nowrap">
            <RouterLink :to="{ name: 'user-details', params: { id: user.id } }">
              {{ fullName(user) }}
            </RouterLink>
          </td>
          <td>{{ user.username }}</td>
          <td class="text-nowrap">{{ user.email }}</td>
          <td class="text-nowrap">{{ user.phone }}</td>
          <td>{{ user.age }}</td>
          <td class="text-capitalize">{{ user.gender || '—' }}</td>
          <td>
            <div class="d-flex gap-1 justify-content-end">
              <RouterLink
                class="btn btn-sm btn-outline-secondary"
                :to="{ name: 'user-details', params: { id: user.id } }"
                :aria-label="`View ${fullName(user)}`"
              >
                <i class="bi bi-eye" aria-hidden="true"></i>
              </RouterLink>
              <RouterLink
                class="btn btn-sm btn-outline-primary"
                :to="{ name: 'user-edit', params: { id: user.id } }"
                :aria-label="`Edit ${fullName(user)}`"
              >
                <i class="bi bi-pencil" aria-hidden="true"></i>
              </RouterLink>
              <BaseButton
                variant="outline-danger"
                size="sm"
                icon="trash"
                :aria-label="`Delete ${fullName(user)}`"
                @click="emit('delete', user)"
              />
            </div>
          </td>
        </tr>
        <tr v-if="users.length === 0 && !loading">
          <td colspan="8" class="text-center text-body-secondary py-4">No users found.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.users-table {
  transition: opacity 0.15s ease;

  &--loading {
    opacity: 0.5;
    pointer-events: none;
  }
}

.table {
  --bs-table-bg: transparent;

  th {
    font-weight: 600;
    white-space: nowrap;
  }
}

.text-capitalize {
  text-transform: capitalize;
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
