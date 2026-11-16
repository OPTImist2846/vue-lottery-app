import { z } from 'zod'

export const PASSWORD_MIN_LENGTH = 8

export const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/

const required = (label: string) => z.string({ required_error: `${label} is required.` }).trim()

export const userSchema = z.object({
  firstName: required('First name').min(1, 'First name is required.'),
  lastName: required('Last name').min(1, 'Last name is required.'),
  username: required('Username')
    .min(1, 'Username is required.')
    .min(3, 'Username must be at least 3 characters.'),
  email: required('Email').min(1, 'Email is required.').email('Enter a valid email address.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.')
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`),
  age: z.coerce
    .number({ invalid_type_error: 'Age is required.' })
    .int('Age must be a whole number.')
    .min(1, 'Age is required.')
    .max(120, 'Age must be 120 or less.'),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Gender is required.' }),
  }),
  phone: required('Phone')
    .min(1, 'Phone is required.')
    .regex(PHONE_PATTERN, 'Enter a valid phone number, e.g. +380 63 555 5555.'),
})

export type UserFormValues = z.infer<typeof userSchema>

export const loginSchema = z.object({
  username: required('Username').min(1, 'Username is required.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.')
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`),
})

export type LoginFormValues = z.infer<typeof loginSchema>
