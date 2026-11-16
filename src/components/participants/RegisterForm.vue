<script setup lang="ts">
import ParticipantForm from '@/components/participants/ParticipantForm.vue'
import type { ParticipantInput } from '@/types/participant'

const { takenEmails } = defineProps<{
  takenEmails: string[]
}>()

const emit = defineEmits<{
  register: [input: ParticipantInput]
}>()
</script>

<template>
  <section class="card" aria-labelledby="register-form-title">
    <div class="card-body">
      <h2 id="register-form-title" class="fs-6 fw-bold text-uppercase mb-0">Register form</h2>
      <p class="text-body-secondary mb-3">Please fill in all the fields.</p>
      <ParticipantForm :taken-emails="takenEmails" @submit="emit('register', $event)" />
    </div>
  </section>
</template>
