import type { Participant, SortState } from '@/types/participant'

export function filterByName(participants: readonly Participant[], query: string): Participant[] {
  const needle = query.trim().toLocaleLowerCase()
  if (!needle) return [...participants]
  return participants.filter((participant) => participant.name.toLocaleLowerCase().includes(needle))
}

export function sortParticipants(
  participants: readonly Participant[],
  sort: SortState | null,
): Participant[] {
  const copy = [...participants]
  if (!sort) return copy
  const factor = sort.direction === 'asc' ? 1 : -1
  return copy.sort((a, b) => {
    const result =
      sort.key === 'name'
        ? a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        : a.birthDate.localeCompare(b.birthDate)
    return result * factor
  })
}

export function pickRandom<T>(items: readonly T[], random: () => number = Math.random): T | null {
  if (items.length === 0) return null
  const index = Math.min(Math.floor(random() * items.length), items.length - 1)
  return items[index] ?? null
}
