import type { CreateUserDto, User } from '@/types/user'

export function fullName(user: Pick<User, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`.trim()
}

export function toUserDto(user: User): CreateUserDto {
  const { firstName, lastName, email, username, password, age, gender, phone } = user
  return { firstName, lastName, email, username, password, age, gender, phone }
}

export function errorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  return error instanceof Error && error.message ? error.message : fallback
}
