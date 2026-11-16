import { ref, watch } from 'vue'
import type { Participant, ParticipantInput } from '@/types/participant'
import { loadParticipants, saveParticipants } from '@/utils/storage'

function createId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function useParticipants(storage?: Storage) {
  const participants = ref<Participant[]>(loadParticipants(storage))

  watch(participants, (value) => saveParticipants(value, storage), { deep: true })

  function addParticipant(input: ParticipantInput): Participant {
    const participant: Participant = { id: createId(), ...input }
    participants.value.push(participant)
    return participant
  }

  function updateParticipant(id: string, input: ParticipantInput): void {
    const participant = participants.value.find((item) => item.id === id)
    if (participant) Object.assign(participant, input)
  }

  function removeParticipant(id: string): void {
    const index = participants.value.findIndex((item) => item.id === id)
    if (index !== -1) participants.value.splice(index, 1)
  }

  return { participants, addParticipant, updateParticipant, removeParticipant }
}
