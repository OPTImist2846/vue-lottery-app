<script setup lang="ts">
import { useId } from 'vue'

export interface SelectOption {
  value: string
  label: string
}

const {
  label = undefined,
  options,
  placeholder = 'Select…',
  error = undefined,
} = defineProps<{
  label?: string
  options: SelectOption[]
  placeholder?: string
  error?: string
}>()

const emit = defineEmits<{
  blur: []
}>()

const model = defineModel<string | undefined>({ required: true })

const id = useId()
const errorId = `${id}-error`
</script>

<template>
  <div class="base-select">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <select
      :id="id"
      v-model="model"
      class="form-select"
      :class="{ 'is-invalid': error }"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? errorId : undefined"
      @blur="emit('blur')"
    >
      <option :value="undefined" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <div v-if="error" :id="errorId" class="invalid-feedback">{{ error }}</div>
  </div>
</template>
