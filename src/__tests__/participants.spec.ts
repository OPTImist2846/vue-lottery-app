import { describe, expect, it } from 'vitest'
import type { Participant } from '@/types/participant'
import { filterByName, pickRandom, sortParticipants } from '@/utils/participants'

const make = (id: string, name: string, birthDate: string): Participant => ({
  id,
  name,
  birthDate,
  email: `${id}@example.com`,
  phone: '+380635555555',
})

const list = [
  make('1', 'washington', '1985-05-02'),
  make('2', 'Amsterdam', '1990-10-01'),
  make('3', 'Sydney', '1987-08-15'),
]

const names = (items: Participant[]) => items.map((item) => item.name)

describe('filterByName', () => {
  it('matches part of the name ignoring case', () => {
    expect(names(filterByName(list, ' SYD '))).toEqual(['Sydney'])
  })

  it('returns everything for an empty query', () => {
    expect(filterByName(list, '')).toHaveLength(3)
  })
})

describe('sortParticipants', () => {
  it('sorts by name in both directions ignoring case', () => {
    expect(names(sortParticipants(list, { key: 'name', direction: 'asc' }))).toEqual([
      'Amsterdam',
      'Sydney',
      'washington',
    ])
    expect(names(sortParticipants(list, { key: 'name', direction: 'desc' }))).toEqual([
      'washington',
      'Sydney',
      'Amsterdam',
    ])
  })

  it('sorts by birth date', () => {
    expect(names(sortParticipants(list, { key: 'birthDate', direction: 'asc' }))).toEqual([
      'washington',
      'Sydney',
      'Amsterdam',
    ])
  })

  it('does not mutate the source list', () => {
    const before = names(list)
    sortParticipants(list, { key: 'name', direction: 'asc' })
    expect(names(list)).toEqual(before)
  })

  it('applies filtering before sorting', () => {
    const result = sortParticipants(filterByName(list, 'a'), { key: 'name', direction: 'desc' })
    expect(names(result)).toEqual(['washington', 'Amsterdam'])
  })
})

describe('pickRandom', () => {
  it('returns null for an empty list', () => {
    expect(pickRandom([])).toBeNull()
  })

  it('uses the random source to pick an item', () => {
    expect(pickRandom(['a', 'b', 'c'], () => 0)).toBe('a')
    expect(pickRandom(['a', 'b', 'c'], () => 0.99)).toBe('c')
  })
})
