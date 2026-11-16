import { describe, expect, it } from 'vitest'
import type { ParticipantInput } from '@/types/participant'
import { MESSAGES, isRealDate, validateParticipant } from '@/utils/validation'

const valid: ParticipantInput = {
  name: 'Amsterdam',
  birthDate: '1990-10-01',
  email: 'amsterdam@example.com',
  phone: '+380635555555',
}

const today = '2026-11-16'

describe('validateParticipant', () => {
  it('accepts valid data', () => {
    expect(validateParticipant(valid, { today })).toEqual({})
  })

  it('requires every field', () => {
    const errors = validateParticipant(
      { name: ' ', birthDate: '', email: '', phone: '' },
      { today },
    )
    expect(errors).toEqual({
      name: MESSAGES.required,
      birthDate: MESSAGES.required,
      email: MESSAGES.required,
      phone: MESSAGES.required,
    })
  })

  it.each(['plainaddress', 'a@b', 'a@b.c', 'name@@example.com', 'name example@x.com'])(
    'rejects email %s',
    (email) => {
      expect(validateParticipant({ ...valid, email }, { today }).email).toBe(MESSAGES.email)
    },
  )

  it.each(['0635555555', '+38063555555', '+3806355555555', '+381635555555', '+380 63 555 5555'])(
    'rejects phone %s',
    (phone) => {
      expect(validateParticipant({ ...valid, phone }, { today }).phone).toBe(MESSAGES.phone)
    },
  )

  it('rejects a birth date in the future but accepts today', () => {
    expect(validateParticipant({ ...valid, birthDate: '2026-11-17' }, { today }).birthDate).toBe(
      MESSAGES.futureDate,
    )
    expect(validateParticipant({ ...valid, birthDate: today }, { today }).birthDate).toBeUndefined()
  })

  it('rejects impossible dates', () => {
    expect(isRealDate('2023-02-29')).toBe(false)
    expect(isRealDate('2024-02-29')).toBe(true)
    expect(validateParticipant({ ...valid, birthDate: '01/10/1990' }, { today }).birthDate).toBe(
      MESSAGES.date,
    )
  })

  it('checks email uniqueness case-insensitively', () => {
    const errors = validateParticipant(
      { ...valid, email: ' Amsterdam@Example.COM ' },
      { today, takenEmails: ['amsterdam@example.com'] },
    )
    expect(errors.email).toBe(MESSAGES.emailTaken)
  })
})
