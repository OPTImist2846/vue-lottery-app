import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import LoginForm from '@/components/auth/LoginForm.vue'
import SearchBar from '@/components/users/SearchBar.vue'
import UserForm from '@/components/users/UserForm.vue'
import { loginSchema, userSchema } from '@/schemas/user'

const validUser = {
  firstName: 'Anna',
  lastName: 'Koval',
  username: 'annak',
  email: 'anna@example.com',
  password: 'secret123',
  age: '25',
  gender: 'female',
  phone: '+380 63 555 5555',
}

describe('schemas', () => {
  it('accepts a valid user and coerces the age', () => {
    expect(userSchema.parse(validUser).age).toBe(25)
  })

  it('reports required fields, email format and password length', () => {
    const result = userSchema.safeParse({
      ...validUser,
      firstName: ' ',
      email: 'bad',
      password: '123',
    })
    expect(result.success).toBe(false)
    const errors = result.error!.flatten().fieldErrors
    expect(errors.firstName).toEqual(['First name is required.'])
    expect(errors.email).toEqual(['Enter a valid email address.'])
    expect(errors.password).toEqual(['Password must be at least 8 characters.'])
  })

  it('requires a password of at least 8 characters to log in', () => {
    expect(loginSchema.safeParse({ username: 'emilys', password: 'short' }).success).toBe(false)
    expect(loginSchema.safeParse({ username: 'emilys', password: 'emilyspass' }).success).toBe(true)
  })
})

describe('UserForm', () => {
  it('shows validation errors and does not submit invalid data', async () => {
    const wrapper = mount(UserForm)

    await wrapper.find('form').trigger('submit')

    await vi.waitFor(() => expect(wrapper.findAll('.invalid-feedback')).toHaveLength(8))
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('submits a typed DTO when the data is valid', async () => {
    const wrapper = mount(UserForm, {
      props: { initial: { ...validUser, age: 25, gender: 'female' } },
    })

    await wrapper.find('form').trigger('submit')

    await vi.waitFor(() => expect(wrapper.emitted('submit')).toHaveLength(1))
    expect(wrapper.emitted('submit')![0]![0]).toEqual({ ...validUser, age: 25 })
  })
})

describe('LoginForm', () => {
  it('shows the server error inside the form', () => {
    const wrapper = mount(LoginForm, { props: { serverError: 'Invalid credentials' } })

    expect(wrapper.find('.alert-danger').text()).toContain('Invalid credentials')
  })
})

describe('SearchBar', () => {
  it('emits filter-by-name with a 300 ms debounce', async () => {
    vi.useFakeTimers()
    const wrapper = mount(SearchBar)

    await wrapper.find('input').setValue('jo')
    vi.advanceTimersByTime(100)
    await wrapper.find('input').setValue('john')
    vi.advanceTimersByTime(299)
    expect(wrapper.emitted('filter-by-name')).toBeUndefined()

    vi.advanceTimersByTime(1)
    expect(wrapper.emitted('filter-by-name')).toEqual([['john']])
    vi.useRealTimers()
  })
})
