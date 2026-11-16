import type { Participant } from '@/types/participant'

export const STORAGE_KEY = 'vue-lottery-app:participants'

function isParticipant(value: unknown): value is Participant {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return ['id', 'name', 'birthDate', 'email', 'phone'].every(
    (key) => typeof record[key] === 'string',
  )
}

export function loadParticipants(storage: Storage = localStorage): Participant[] {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isParticipant) : []
  } catch {
    return []
  }
}

export function saveParticipants(
  participants: readonly Participant[],
  storage: Storage = localStorage,
): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(participants))
  } catch {
    return
  }
}
