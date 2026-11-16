import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import App from '@/App.vue'
import type { Participant } from '@/types/participant'
import { STORAGE_KEY } from '@/utils/storage'

const seed: Participant[] = ['Amsterdam', 'Washington', 'Sydney', 'Kyiv'].map((name, index) => ({
  id: String(index + 1),
  name,
  birthDate: `199${index}-01-01`,
  email: `${name.toLowerCase()}@example.com`,
  phone: '+380635555555',
}))

function mountApp() {
  return mount(App, { attachTo: document.body, global: { stubs: { teleport: true } } })
}

const newWinnerButton = (wrapper: ReturnType<typeof mountApp>) =>
  wrapper.findAll('button').find((button) => button.text() === 'New winner')!

const winnerNames = (wrapper: ReturnType<typeof mountApp>) =>
  wrapper.findAll('.winner-item').map((item) => item.text())

class MemoryStorage implements Storage {
  #data = new Map<string, string>()
  get length() {
    return this.#data.size
  }
  clear() {
    this.#data.clear()
  }
  getItem(key: string) {
    return this.#data.get(key) ?? null
  }
  key(index: number) {
    return [...this.#data.keys()][index] ?? null
  }
  removeItem(key: string) {
    this.#data.delete(key)
  }
  setItem(key: string, value: string) {
    this.#data.set(key, String(value))
  }
}

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage())
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('disables New winner while there are no participants', () => {
    const wrapper = mountApp()
    expect(newWinnerButton(wrapper).attributes('disabled')).toBeDefined()
  })

  it('restores participants from localStorage and saves changes with a deep watcher', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    const wrapper = mountApp()
    expect(wrapper.findAll('tbody tr')).toHaveLength(4)

    await wrapper.findAll('tbody tr')[0]!.findAll('button')[0]!.trigger('click')
    const nameInput = wrapper.find('.modal input')
    await nameInput.setValue('Amsterdam Updated')
    await wrapper.find('.modal form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('tbody').text()).toContain('Amsterdam Updated')
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as Participant[]
    expect(saved[0]!.name).toBe('Amsterdam Updated')
  })

  it('draws at most three unique winners and allows removing them', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    const wrapper = mountApp()

    for (let i = 0; i < 5; i += 1) await newWinnerButton(wrapper).trigger('click')

    const winners = winnerNames(wrapper)
    expect(winners).toHaveLength(3)
    expect(new Set(winners).size).toBe(3)
    expect(newWinnerButton(wrapper).attributes('disabled')).toBeDefined()

    await wrapper.find('.winner-item__remove').trigger('click')
    expect(winnerNames(wrapper)).toHaveLength(2)
    expect(newWinnerButton(wrapper).attributes('disabled')).toBeUndefined()
  })

  it('removes a deleted participant from the winners too', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed.slice(0, 1)))
    const wrapper = mountApp()

    await newWinnerButton(wrapper).trigger('click')
    expect(winnerNames(wrapper)).toEqual(['Amsterdam'])
    expect(newWinnerButton(wrapper).attributes('disabled')).toBeDefined()

    await wrapper.findAll('tbody tr')[0]!.findAll('button')[1]!.trigger('click')
    expect(wrapper.find('.modal').text()).toContain(
      'Ви дійсно бажаєте видалити учасника "Amsterdam", "amsterdam@example.com"?',
    )
    await wrapper
      .findAll('.modal button')
      .find((button) => button.text() === 'Так')!
      .trigger('click')

    expect(winnerNames(wrapper)).toEqual([])
    expect(wrapper.find('tbody').text()).toContain('No participants yet.')
  })

  it('sorts by name and toggles direction on a second click', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    const wrapper = mountApp()
    const nameSort = wrapper.findAll('.sort-control')[0]!
    const rowNames = () => wrapper.findAll('tbody tr').map((row) => row.findAll('td')[1]!.text())

    await nameSort.trigger('click')
    expect(rowNames()).toEqual(['Amsterdam', 'Kyiv', 'Sydney', 'Washington'])

    await nameSort.trigger('click')
    expect(rowNames()).toEqual(['Washington', 'Sydney', 'Kyiv', 'Amsterdam'])
  })
})
