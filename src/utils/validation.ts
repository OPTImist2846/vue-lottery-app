import type { ParticipantErrors, ParticipantInput } from '@/types/participant'

export const EMAIL_PATTERN = /^[\w.%+-]+@[a-z\d-]+(\.[a-z\d-]+)*\.[a-z]{2,}$/i
export const PHONE_PATTERN = /^\+380\d{9}$/
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const MESSAGES = {
  required: 'This value is required.',
  email: 'Enter a valid email, e.g. name@example.com.',
  emailTaken: 'A participant with this email already exists.',
  phone: 'Phone must be in the format +380XXXXXXXXX.',
  date: 'Enter a valid date in the format yyyy-mm-dd.',
  futureDate: 'Date of birth cannot be in the future.',
} as const

export function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isRealDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false
  const [year, month, day] = value.split('-').map(Number) as [number, number, number]
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function normalizeInput(input: ParticipantInput): ParticipantInput {
  return {
    name: input.name.trim(),
    birthDate: input.birthDate.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
  }
}

export interface ValidationContext {
  takenEmails?: readonly string[]
  today?: string
}

export function validateParticipant(
  input: ParticipantInput,
  { takenEmails = [], today = toIsoDate(new Date()) }: ValidationContext = {},
): ParticipantErrors {
  const { name, birthDate, email, phone } = normalizeInput(input)
  const errors: ParticipantErrors = {}

  if (!name) errors.name = MESSAGES.required

  if (!birthDate) errors.birthDate = MESSAGES.required
  else if (!isRealDate(birthDate)) errors.birthDate = MESSAGES.date
  else if (birthDate > today) errors.birthDate = MESSAGES.futureDate

  if (!email) errors.email = MESSAGES.required
  else if (!EMAIL_PATTERN.test(email)) errors.email = MESSAGES.email
  else if (takenEmails.some((taken) => normalizeEmail(taken) === normalizeEmail(email)))
    errors.email = MESSAGES.emailTaken

  if (!phone) errors.phone = MESSAGES.required
  else if (!PHONE_PATTERN.test(phone)) errors.phone = MESSAGES.phone

  return errors
}

export function hasErrors(errors: ParticipantErrors): boolean {
  return Object.keys(errors).length > 0
}
