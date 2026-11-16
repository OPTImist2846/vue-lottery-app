<script setup lang="ts">
import { useId } from 'vue'

const {
  label = undefined,
  type = 'text',
  placeholder = undefined,
  error = undefined,
  valid = false,
  min = undefined,
  max = undefined,
  autocomplete = undefined,
} = defineProps<{
  label?: string
  type?: 'text' | 'email' | 'tel' | 'date' | 'search' | 'password' | 'number'
  placeholder?: string
  error?: string
  valid?: boolean
  min?: string | number
  max?: string | number
  autocomplete?: string
}>()

const emit = defineEmits<{
  blur: []
}>()

const model = defineModel<string | number | undefined>({ required: true })

const id = useId()
const errorId = `${id}-error`
</script>

<template>
  <div class="base-input">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <input
      :id="id"
      v-model="model"
      class="form-control"
      :class="{ 'is-invalid': error, 'is-valid': valid && !error }"
      :type="type"
      :placeholder="placeholder"
      :min="min"
      :max="max"
      :autocomplete="autocomplete"
      :aria-label="label ? undefined : placeholder"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? errorId : undefined"
      @blur="emit('blur')"
    />
    <div v-if="error" :id="errorId" class="invalid-feedback">{{ error }}</div>
  </div>
</template>
