<script setup lang="ts">
import { computed, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BasePagination from '@/components/base/BasePagination.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import SearchBar from '@/components/users/SearchBar.vue'
import UserForm from '@/components/users/UserForm.vue'
import UsersTable from '@/components/users/UsersTable.vue'
import WinnersBlock from '@/components/winners/WinnersBlock.vue'
import { PAGE_SIZE } from '@/constants'
import { useLotteryStore } from '@/stores/lottery'
import { useUsersStore, type UsersQuery } from '@/stores/users'
import type { CreateUserDto, Page, User, UserSortField } from '@/types/user'
import { errorMessage, fullName } from '@/utils/user'
import { nextSort, parseUsersQuery, toRouteQuery } from '@/utils/users-query'

const route = useRoute()
const router = useRouter()
const usersStore = useUsersStore()
const lottery = useLotteryStore()

const query = computed(() => parseUsersQuery(route.query))
const serverPage = shallowRef<Page<User> | null>(null)
const loading = ref(false)
const loadError = ref<string | null>(null)
let latestRequest = 0

const view = computed(() => usersStore.present(serverPage.value, query.value))
const totalPages = computed(() => Math.max(1, Math.ceil(view.value.total / PAGE_SIZE)))

async function load(): Promise<void> {
  const request = ++latestRequest
  loading.value = true
  loadError.value = null
  try {
    const page = await usersStore.fetchPage(query.value)
    if (request === latestRequest) serverPage.value = page
  } catch (error) {
    if (request === latestRequest) loadError.value = errorMessage(error, 'Could not load users.')
  } finally {
    if (request === latestRequest) loading.value = false
  }
}

watch(
  () => (route.name === 'users' ? route.fullPath : null),
  (path) => {
    if (path === null) return
    usersStore.lastListQuery = toRouteQuery(query.value) as Record<string, string>
    void load()
  },
  { immediate: true },
)

function updateQuery(patch: Partial<UsersQuery>): void {
  void router.push({ name: 'users', query: toRouteQuery({ ...query.value, ...patch }) })
}

const currentPage = computed({
  get: () => query.value.page,
  set: (page: number) => updateQuery({ page }),
})

function search(q: string): void {
  if (q !== query.value.q) updateQuery({ q, page: 1 })
}

function sort(field: UserSortField): void {
  updateQuery({ ...nextSort(query.value, field), page: 1 })
}

const canDraw = computed(() => lottery.canDrawFrom(view.value.users))

const userForm = useTemplateRef<InstanceType<typeof UserForm>>('userForm')
const creating = ref(false)
const createError = ref<string | undefined>(undefined)
const createdUser = shallowRef<User | null>(null)

async function createUser(data: CreateUserDto): Promise<void> {
  creating.value = true
  createError.value = undefined
  try {
    createdUser.value = await usersStore.create(data)
    userForm.value?.reset()
    if (query.value.page !== 1 || query.value.q) updateQuery({ page: 1, q: '' })
  } catch (error) {
    createError.value = errorMessage(error, 'Could not create the user.')
  } finally {
    creating.value = false
  }
}

const deleteTarget = shallowRef<User | null>(null)
const isDeleteOpen = ref(false)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

function askDelete(user: User): void {
  deleteTarget.value = user
  deleteError.value = null
  isDeleteOpen.value = true
}

async function confirmDelete(): Promise<void> {
  if (!deleteTarget.value) return
  deleting.value = true
  deleteError.value = null
  try {
    await usersStore.remove(deleteTarget.value.id)
    isDeleteOpen.value = false
  } catch (error) {
    deleteError.value = errorMessage(error, 'Could not delete the user.')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="d-grid gap-3">
    <h1 class="visually-hidden">Users</h1>

    <WinnersBlock
      :winners="lottery.winners"
      :can-draw="canDraw"
      @draw="lottery.draw(view.users)"
      @remove="lottery.removeWinner"
    />

    <section class="card" aria-labelledby="create-user-title">
      <div class="card-body">
        <h2 id="create-user-title" class="section-title">Register form</h2>
        <p class="text-body-secondary mb-3">Please fill in all the fields.</p>
        <UserForm
          ref="userForm"
          submit-label="Save"
          :pending="creating"
          :server-error="createError"
          @submit="createUser"
        />
        <BaseAlert v-if="createdUser" variant="success" class="mt-3">
          User
          <RouterLink :to="{ name: 'user-details', params: { id: createdUser.id } }">
            {{ fullName(createdUser) }}
          </RouterLink>
          was added to the list.
        </BaseAlert>
      </div>
    </section>

    <section class="card" aria-label="Users list">
      <div class="card-body d-grid gap-3">
        <div class="d-flex flex-wrap align-items-center gap-3">
          <SearchBar
            class="flex-grow-1"
            placeholder="Search users by name"
            :initial-query="query.q"
            @filter-by-name="search"
          />
          <span class="text-body-secondary">Total: {{ view.total }}</span>
        </div>

        <BaseAlert v-if="loadError">
          {{ loadError }}
          <template #action>
            <BaseButton variant="outline-danger" size="sm" icon="arrow-clockwise" @click="load">
              Retry
            </BaseButton>
          </template>
        </BaseAlert>

        <BaseSpinner v-if="loading && !serverPage" label="Loading users…" />
        <UsersTable
          v-else-if="serverPage"
          :users="view.users"
          :sort-by="query.sortBy"
          :order="query.order"
          :loading="loading"
          @sort="sort"
          @delete="askDelete"
        />

        <BasePagination v-model:page="currentPage" :total-pages="totalPages" :disabled="loading" />
      </div>
    </section>

    <BaseModal v-model:open="isDeleteOpen" title="Видалення користувача">
      <p v-if="deleteTarget" class="mb-0">
        Ви дійсно бажаєте видалити користувача "{{ fullName(deleteTarget) }}", "{{
          deleteTarget.email
        }}"?
      </p>
      <BaseAlert v-if="deleteError" class="mt-3">{{ deleteError }}</BaseAlert>
      <template #footer="{ close }">
        <BaseButton variant="danger" :disabled="deleting" @click="confirmDelete">Так</BaseButton>
        <BaseButton variant="secondary" @click="close">Ні</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
