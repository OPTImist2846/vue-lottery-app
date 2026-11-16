<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import { useLotteryStore } from '@/stores/lottery'
import { useUsersStore } from '@/stores/users'
import type { User } from '@/types/user'
import { errorMessage, fullName } from '@/utils/user'

const { id } = defineProps<{
  id: string
}>()

const router = useRouter()
const usersStore = useUsersStore()
const lottery = useLotteryStore()

const loaded = shallowRef<User | null>(null)
const loading = ref(false)
const loadError = ref<string | null>(null)

const user = computed(() => (loaded.value ? usersStore.resolve(loaded.value) : null))

async function load(): Promise<void> {
  loading.value = true
  loadError.value = null
  try {
    loaded.value = await usersStore.fetchById(Number(id))
  } catch (error) {
    loaded.value = null
    loadError.value = errorMessage(error, 'Could not load the user.')
  } finally {
    loading.value = false
  }
}

watch(() => id, load, { immediate: true })

const details = computed(() => {
  const value = user.value
  if (!value) return []
  const address = value.address
    ? [value.address.address, value.address.city, value.address.state, value.address.country]
        .filter(Boolean)
        .join(', ')
    : ''
  return [
    { icon: 'envelope', label: 'Email', value: value.email },
    { icon: 'telephone', label: 'Phone', value: value.phone },
    { icon: 'calendar-event', label: 'Birth date', value: value.birthDate ?? '' },
    { icon: 'geo-alt', label: 'Address', value: address },
    { icon: 'mortarboard', label: 'University', value: value.university ?? '' },
    {
      icon: 'building',
      label: 'Company',
      value: value.company ? `${value.company.title}, ${value.company.name}` : '',
    },
  ].filter((row) => row.value)
})

const isDeleteOpen = ref(false)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

async function confirmDelete(): Promise<void> {
  if (!user.value) return
  deleting.value = true
  deleteError.value = null
  try {
    await usersStore.remove(user.value.id)
    isDeleteOpen.value = false
    await router.push({ name: 'users', query: usersStore.lastListQuery })
  } catch (error) {
    deleteError.value = errorMessage(error, 'Could not delete the user.')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="d-grid gap-3">
    <RouterLink
      :to="{ name: 'users', query: usersStore.lastListQuery }"
      class="d-inline-flex align-items-center gap-2"
    >
      <i class="bi bi-arrow-left" aria-hidden="true"></i>
      Back to users
    </RouterLink>

    <BaseSpinner v-if="loading" label="Loading user…" />

    <BaseAlert v-else-if="loadError">
      {{ loadError }}
      <template #action>
        <BaseButton variant="outline-danger" size="sm" icon="arrow-clockwise" @click="load">
          Retry
        </BaseButton>
      </template>
    </BaseAlert>

    <section v-else-if="user" class="card">
      <div class="card-body p-4 d-grid gap-4">
        <div class="d-flex flex-wrap align-items-center gap-4">
          <img
            v-if="user.image"
            :src="user.image"
            alt=""
            width="112"
            height="112"
            class="rounded-circle bg-body-secondary"
          />
          <div class="flex-grow-1">
            <h1 class="fs-3 fw-bold mb-1">{{ fullName(user) }}</h1>
            <p class="text-body-secondary mb-2">@{{ user.username }} · ID {{ user.id }}</p>
            <div class="d-flex flex-wrap gap-2">
              <span class="badge text-bg-light">{{ user.age }} years</span>
              <span v-if="user.gender" class="badge text-bg-light">{{ user.gender }}</span>
              <span v-if="user.role" class="badge text-bg-light">{{ user.role }}</span>
              <span v-if="lottery.isWinner(user.id)" class="badge text-bg-primary">Winner</span>
              <span v-if="usersStore.isLocal(user.id)" class="badge text-bg-warning">
                Created locally
              </span>
            </div>
          </div>
          <div class="d-flex gap-2">
            <RouterLink
              :to="{ name: 'user-edit', params: { id: user.id } }"
              class="btn btn-primary d-inline-flex align-items-center gap-2"
            >
              <i class="bi bi-pencil" aria-hidden="true"></i>
              Edit
            </RouterLink>
            <BaseButton variant="outline-danger" icon="trash" @click="isDeleteOpen = true">
              Delete
            </BaseButton>
          </div>
        </div>

        <dl class="row mb-0">
          <template v-for="row in details" :key="row.label">
            <dt class="col-sm-3 py-1 d-flex align-items-center gap-2">
              <i class="bi text-body-secondary" :class="`bi-${row.icon}`" aria-hidden="true"></i>
              {{ row.label }}
            </dt>
            <dd class="col-sm-9 py-1 mb-0">{{ row.value }}</dd>
          </template>
        </dl>
      </div>
    </section>

    <RouterView />

    <BaseModal v-model:open="isDeleteOpen" title="Видалення користувача">
      <p v-if="user" class="mb-0">
        Ви дійсно бажаєте видалити користувача "{{ fullName(user) }}", "{{ user.email }}"?
      </p>
      <BaseAlert v-if="deleteError" class="mt-3">{{ deleteError }}</BaseAlert>
      <template #footer="{ close }">
        <BaseButton variant="danger" :disabled="deleting" @click="confirmDelete">Так</BaseButton>
        <BaseButton variant="secondary" @click="close">Ні</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped lang="scss">
.badge {
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: capitalize;
  border: 1px solid var(--bs-border-color);
}
</style>
