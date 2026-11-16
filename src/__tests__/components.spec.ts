import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'
import ParticipantForm from '@/components/participants/ParticipantForm.vue'
import SearchBar from '@/components/participants/SearchBar.vue'
import { MESSAGES } from '@/utils/validation'

async function fill(wrapper: ReturnType<typeof mount>, values: string[]) {
  const inputs = wrapper.findAll('input')
  for (const [index, value] of values.entries()) {
    await inputs[index]!.setValue(value)
  }
}

describe('ParticipantForm', () => {
  it('shows required errors only after submit', async () => {
    const wrapper = mount(ParticipantForm)
    expect(wrapper.findAll('.invalid-feedback')).toHaveLength(0)

    await wrapper.find('form').trigger('submit')

    expect(wrapper.findAll('.invalid-feedback').map((node) => node.text())).toEqual(
      Array(4).fill(MESSAGES.required),
    )
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('emits valid data and clears itself without showing errors', async () => {
    const wrapper = mount(ParticipantForm)
    await fill(wrapper, ['Sydney', '1987-08-15', 'sydney@example.com', '+380635555555'])

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          name: 'Sydney',
          birthDate: '1987-08-15',
          email: 'sydney@example.com',
          phone: '+380635555555',
        },
      ],
    ])
    expect(wrapper.findAll('input').map((input) => input.element.value)).toEqual(['', '', '', ''])
    expect(wrapper.find('.is-invalid').exists()).toBe(false)
  })

  it('submits on Enter', async () => {
    const wrapper = mount(ParticipantForm)
    await fill(wrapper, ['Sydney', '1987-08-15', 'sydney@example.com', '+380635555555'])

    await wrapper.findAll('input')[3]!.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('rejects an email that is already taken', async () => {
    const wrapper = mount(ParticipantForm, { props: { takenEmails: ['SYDNEY@example.com'] } })
    await fill(wrapper, ['Sydney', '1987-08-15', 'sydney@example.com', '+380635555555'])

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain(MESSAGES.emailTaken)
    expect(wrapper.emitted('submit')).toBeUndefined()
  })
})

describe('SearchBar', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('emits filter-by-name once, 300 ms after the last keystroke', async () => {
    const wrapper = mount(SearchBar)
    const input = wrapper.find('input')

    await input.setValue('Am')
    vi.advanceTimersByTime(200)
    await input.setValue('Ams')
    vi.advanceTimersByTime(299)
    expect(wrapper.emitted('filter-by-name')).toBeUndefined()

    vi.advanceTimersByTime(1)
    expect(wrapper.emitted('filter-by-name')).toEqual([['Ams']])
  })
})

describe('BaseModal', () => {
  it('renders slots and closes on Esc', async () => {
    const wrapper = mount(BaseModal, {
      props: {
        open: true,
        title: 'Title',
        'onUpdate:open': (value: boolean) => wrapper.setProps({ open: value }),
      },
      slots: { default: 'Body', footer: '<button class="no">Ні</button>' },
      global: { stubs: { teleport: true } },
    })
    await nextTick()

    expect(wrapper.text()).toContain('Title')
    expect(wrapper.text()).toContain('Body')
    expect(wrapper.find('.modal-footer .no').exists()).toBe(true)

    await wrapper.find('.modal').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })
})
