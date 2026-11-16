<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useParticipantForm } from '@/composables/useParticipantForm'
import type { ParticipantField, ParticipantInput } from '@/types/participant'
import { toIsoDate } from '@/utils/validation'

interface FieldConfig {
  key: ParticipantField
  label: string
  type: 'text' | 'date' | 'email' | 'tel'
  placeholder: string
  autocomplete: string
}

const {
  initial = undefined,
  takenEmails = [],
  submitLabel = 'Save',
} = defineProps<{
  initial?: ParticipantInput
  takenEmails?: string[]
  submitLabel?: string
}>()

const emit = defineEmits<{
  submit: [input: ParticipantInput]
}>()

const FIELDS: readonly FieldConfig[] = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'Enter user name',
    autocomplete: 'name',
  },
  {
    key: 'birthDate',
    label: 'Date of Birth',
    type: 'date',
    placeholder: 'yyyy-mm-dd',
    autocomplete: 'bday',
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter email',
    autocomplete: 'email',
  },
  {
    key: 'phone',
    label: 'Phone number',
    type: 'tel',
    placeholder: '+380XXXXXXXXX',
    autocomplete: 'tel',
  },
]

const today = toIsoDate(new Date())

const form = useParticipantForm({ initial, takenEmails: () => takenEmails })
const { values, visibleErrors, isFieldValid, touch } = form

function handleSubmit(): void {
  const input = form.submit()
  if (!input) return
  emit('submit', input)
  form.reset(initial)
}
</script>

<template>
  <form novalidate @submit.prevent="handleSubmit" @keydown.enter.prevent="handleSubmit">
    <BaseInput
      v-for="field in FIELDS"
      :key="field.key"
      v-model="values[field.key]"
      class="mb-3"
      :label="field.label"
      :type="field.type"
      :placeholder="field.placeholder"
      :autocomplete="field.autocomplete"
      :max="field.type === 'date' ? today : undefined"
      :error="visibleErrors[field.key]"
      :valid="isFieldValid(field.key)"
      @update:model-value="touch(field.key)"
      @blur="touch(field.key)"
    />
    <div class="d-flex justify-content-end pt-2">
      <BaseButton type="submit">{{ submitLabel }}</BaseButton>
    </div>
  </form>
</template>
