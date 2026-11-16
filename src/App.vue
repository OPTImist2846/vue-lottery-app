<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import ParticipantForm from '@/components/participants/ParticipantForm.vue'
import ParticipantsTable from '@/components/participants/ParticipantsTable.vue'
import RegisterForm from '@/components/participants/RegisterForm.vue'
import WinnersBlock from '@/components/winners/WinnersBlock.vue'
import { useParticipants } from '@/composables/useParticipants'
import { MAX_WINNERS } from '@/constants'
import type { Participant, ParticipantInput } from '@/types/participant'
import { pickRandom } from '@/utils/participants'

const { participants, addParticipant, updateParticipant, removeParticipant } = useParticipants()

const winnerIds = ref<string[]>([])

const winners = computed(() =>
  winnerIds.value
    .map((id) => participants.value.find((participant) => participant.id === id))
    .filter((participant): participant is Participant => participant !== undefined),
)

const candidates = computed(() =>
  participants.value.filter((participant) => !winnerIds.value.includes(participant.id)),
)

const canDraw = computed(() => winners.value.length < MAX_WINNERS && candidates.value.length > 0)

const allEmails = computed(() => participants.value.map((participant) => participant.email))

function drawWinner(): void {
  if (!canDraw.value) return
  const winner = pickRandom(candidates.value)
  if (winner) winnerIds.value.push(winner.id)
}

function removeWinner(id: string): void {
  winnerIds.value = winnerIds.value.filter((winnerId) => winnerId !== id)
}

const editTarget = shallowRef<Participant | null>(null)
const isEditOpen = ref(false)
const editFormKey = ref(0)

const editTakenEmails = computed(() =>
  participants.value
    .filter((participant) => participant.id !== editTarget.value?.id)
    .map((participant) => participant.email),
)

const editInitial = computed<ParticipantInput | undefined>(() => {
  if (!editTarget.value) return undefined
  const { name, birthDate, email, phone } = editTarget.value
  return { name, birthDate, email, phone }
})

function openEdit(participant: Participant): void {
  editTarget.value = participant
  editFormKey.value += 1
  isEditOpen.value = true
}

function saveEdit(input: ParticipantInput): void {
  if (editTarget.value) updateParticipant(editTarget.value.id, input)
  isEditOpen.value = false
}

const deleteTarget = shallowRef<Participant | null>(null)
const isDeleteOpen = ref(false)

function openDelete(participant: Participant): void {
  deleteTarget.value = participant
  isDeleteOpen.value = true
}

function confirmDelete(): void {
  const target = deleteTarget.value
  if (target) {
    removeWinner(target.id)
    removeParticipant(target.id)
  }
  isDeleteOpen.value = false
}
</script>

<template>
  <main class="lottery container py-5 d-grid gap-3">
    <h1 class="visually-hidden">Lottery</h1>

    <WinnersBlock
      :winners="winners"
      :can-draw="canDraw"
      @draw="drawWinner"
      @remove="removeWinner"
    />

    <RegisterForm :taken-emails="allEmails" @register="addParticipant" />

    <ParticipantsTable :participants="participants" @edit="openEdit" @delete="openDelete" />

    <BaseModal v-model:open="isEditOpen" title="Редагувати дані учасника">
      <ParticipantForm
        v-if="editInitial"
        :key="editFormKey"
        :initial="editInitial"
        :taken-emails="editTakenEmails"
        submit-label="Оновити дані"
        @submit="saveEdit"
      />
    </BaseModal>

    <BaseModal v-model:open="isDeleteOpen" title="Видалення учасника">
      <p v-if="deleteTarget" class="mb-0">
        Ви дійсно бажаєте видалити учасника "{{ deleteTarget.name }}", "{{ deleteTarget.email }}"?
      </p>
      <template #footer="{ close }">
        <BaseButton variant="danger" @click="confirmDelete">Так</BaseButton>
        <BaseButton variant="secondary" @click="close">Ні</BaseButton>
      </template>
    </BaseModal>
  </main>
</template>
