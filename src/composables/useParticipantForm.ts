import { computed, reactive, ref, toValue, type MaybeRefOrGetter } from 'vue'
import type { ParticipantErrors, ParticipantField, ParticipantInput } from '@/types/participant'
import { hasErrors, normalizeInput, validateParticipant } from '@/utils/validation'

export const PARTICIPANT_FIELDS: readonly ParticipantField[] = [
  'name',
  'birthDate',
  'email',
  'phone',
]

export function emptyParticipantInput(): ParticipantInput {
  return { name: '', birthDate: '', email: '', phone: '' }
}

function untouched(): Record<ParticipantField, boolean> {
  return { name: false, birthDate: false, email: false, phone: false }
}

export interface ParticipantFormOptions {
  initial?: ParticipantInput
  takenEmails?: MaybeRefOrGetter<readonly string[]>
}

export function useParticipantForm({ initial, takenEmails = [] }: ParticipantFormOptions = {}) {
  const values = reactive<ParticipantInput>({ ...emptyParticipantInput(), ...initial })
  const touched = reactive(untouched())
  const submitted = ref(false)

  const errors = computed(() => validateParticipant(values, { takenEmails: toValue(takenEmails) }))
  const isValid = computed(() => !hasErrors(errors.value))

  const visibleErrors = computed<ParticipantErrors>(() => {
    const result: ParticipantErrors = {}
    for (const field of PARTICIPANT_FIELDS) {
      if ((touched[field] || submitted.value) && errors.value[field]) {
        result[field] = errors.value[field]
      }
    }
    return result
  })

  function isFieldValid(field: ParticipantField): boolean {
    return (touched[field] || submitted.value) && !errors.value[field]
  }

  function touch(field: ParticipantField): void {
    touched[field] = true
  }

  function reset(next: ParticipantInput = emptyParticipantInput()): void {
    Object.assign(values, next)
    Object.assign(touched, untouched())
    submitted.value = false
  }

  function submit(): ParticipantInput | null {
    submitted.value = true
    return isValid.value ? normalizeInput(values) : null
  }

  return { values, errors, visibleErrors, isValid, isFieldValid, touch, reset, submit }
}
