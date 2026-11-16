<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import UserForm from '@/components/users/UserForm.vue'
import { useUsersStore } from '@/stores/users'
import type { CreateUserDto, User } from '@/types/user'
import { errorMessage, fullName, toUserDto } from '@/utils/user'

const { id } = defineProps<{
  id: string
}>()

const router = useRouter()
const usersStore = useUsersStore()

const open = ref(true)
const user = shallowRef<User | null>(null)
const loading = ref(false)
const loadError = ref<string | null>(null)
const saving = ref(false)
const saveError = ref<string | undefined>(undefined)

const title = computed(() => (user.value ? `Edit ${fullName(user.value)}` : 'Edit user'))

watch(
  () => id,
  async () => {
    loading.value = true
    loadError.value = null
    try {
      user.value = await usersStore.fetchById(Number(id))
    } catch (error) {
      loadError.value = errorMessage(error, 'Could not load the user.')
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

watch(open, (isOpen) => {
  if (!isOpen) void router.push({ name: 'user-details', params: { id } })
})

async function save(data: CreateUserDto): Promise<void> {
  saving.value = true
  saveError.value = undefined
  try {
    await usersStore.update(Number(id), data)
    open.value = false
  } catch (error) {
    saveError.value = errorMessage(error, 'Could not update the user.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal v-model:open="open" :title="title">
    <BaseSpinner v-if="loading" label="Loading user…" />
    <BaseAlert v-else-if="loadError">{{ loadError }}</BaseAlert>
    <UserForm
      v-else-if="user"
      :key="user.id"
      :initial="toUserDto(user)"
      submit-label="Оновити дані"
      :pending="saving"
      :server-error="saveError"
      @submit="save"
    />
  </BaseModal>
</template>
