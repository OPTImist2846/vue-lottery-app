export interface ParticipantInput {
  name: string
  birthDate: string
  email: string
  phone: string
}

export interface Participant extends ParticipantInput {
  id: string
}

export type ParticipantField = keyof ParticipantInput

export type ParticipantErrors = Partial<Record<ParticipantField, string>>

export type SortKey = 'name' | 'birthDate'

export type SortDirection = 'asc' | 'desc'

export interface SortState {
  key: SortKey
  direction: SortDirection
}
