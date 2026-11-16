<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { loginSchema } from '@/schemas/user'
import type { LoginCredentials } from '@/types/auth'

const { pending = false, serverError = undefined } = defineProps<{
  pending?: boolean
  serverError?: string
}>()

const emit = defineEmits<{
  submit: [credentials: LoginCredentials]
}>()

const { defineField, errors, handleSubmit } = useForm({
  validationSchema: toTypedSchema(loginSchema),
})

const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit((values) => emit('submit', values))
</script>

<template>
  <form class="d-grid gap-3" novalidate @submit.prevent="onSubmit">
    <BaseInput
      v-model="username"
      label="Username"
      autocomplete="username"
      placeholder="emilys"
      :error="errors.username"
      @blur="usernameAttrs.onBlur"
    />
    <BaseInput
      v-model="password"
      type="password"
      label="Password"
      autocomplete="current-password"
      placeholder="At least 8 characters"
      :error="errors.password"
      @blur="passwordAttrs.onBlur"
    />
    <BaseAlert v-if="serverError">{{ serverError }}</BaseAlert>
    <BaseButton type="submit" :disabled="pending" class="justify-content-center">
      <span v-if="pending" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
      <i v-else class="bi bi-box-arrow-in-right" aria-hidden="true"></i>
      Login
    </BaseButton>
  </form>
</template>
