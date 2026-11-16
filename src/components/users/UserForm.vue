<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect, { type SelectOption } from '@/components/base/BaseSelect.vue'
import { userSchema, type UserFormValues } from '@/schemas/user'
import type { CreateUserDto } from '@/types/user'

const {
  initial = undefined,
  submitLabel = 'Save',
  pending = false,
  serverError = undefined,
} = defineProps<{
  initial?: Partial<CreateUserDto>
  submitLabel?: string
  pending?: boolean
  serverError?: string
}>()

const emit = defineEmits<{
  submit: [values: CreateUserDto]
}>()

const GENDER_OPTIONS: SelectOption[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
]

function initialValues(): Partial<UserFormValues> {
  if (!initial) return {}
  const { gender, ...rest } = initial
  return { ...rest, gender: gender === 'male' || gender === 'female' ? gender : undefined }
}

const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(userSchema),
  initialValues: initialValues(),
})

const [firstName, firstNameAttrs] = defineField('firstName')
const [lastName, lastNameAttrs] = defineField('lastName')
const [username, usernameAttrs] = defineField('username')
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const [age, ageAttrs] = defineField('age')
const [gender, genderAttrs] = defineField('gender')
const [phone, phoneAttrs] = defineField('phone')

const onSubmit = handleSubmit((values) => emit('submit', values))

defineExpose({ reset: () => resetForm({ values: {} }) })
</script>

<template>
  <form novalidate @submit.prevent="onSubmit">
    <div class="row g-3">
      <BaseInput
        v-model="firstName"
        class="col-md-6"
        label="First name"
        autocomplete="given-name"
        placeholder="Enter first name"
        :error="errors.firstName"
        @blur="firstNameAttrs.onBlur"
      />
      <BaseInput
        v-model="lastName"
        class="col-md-6"
        label="Last name"
        autocomplete="family-name"
        placeholder="Enter last name"
        :error="errors.lastName"
        @blur="lastNameAttrs.onBlur"
      />
      <BaseInput
        v-model="username"
        class="col-md-6"
        label="Username"
        autocomplete="username"
        placeholder="Enter username"
        :error="errors.username"
        @blur="usernameAttrs.onBlur"
      />
      <BaseInput
        v-model="email"
        class="col-md-6"
        type="email"
        label="Email"
        autocomplete="email"
        placeholder="Enter email"
        :error="errors.email"
        @blur="emailAttrs.onBlur"
      />
      <BaseInput
        v-model="password"
        class="col-md-6"
        type="password"
        label="Password"
        autocomplete="new-password"
        placeholder="At least 8 characters"
        :error="errors.password"
        @blur="passwordAttrs.onBlur"
      />
      <BaseInput
        v-model="phone"
        class="col-md-6"
        type="tel"
        label="Phone number"
        autocomplete="tel"
        placeholder="+380 63 555 5555"
        :error="errors.phone"
        @blur="phoneAttrs.onBlur"
      />
      <BaseInput
        v-model="age"
        class="col-md-6"
        type="number"
        label="Age"
        :min="1"
        :max="120"
        placeholder="Enter age"
        :error="errors.age"
        @blur="ageAttrs.onBlur"
      />
      <BaseSelect
        v-model="gender"
        class="col-md-6"
        label="Gender"
        placeholder="Select gender"
        :options="GENDER_OPTIONS"
        :error="errors.gender"
        @blur="genderAttrs.onBlur"
      />
    </div>
    <BaseAlert v-if="serverError" class="mt-3">{{ serverError }}</BaseAlert>
    <div class="d-flex justify-content-end mt-3">
      <BaseButton type="submit" :disabled="pending">
        <span v-if="pending" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        {{ submitLabel }}
      </BaseButton>
    </div>
  </form>
</template>
