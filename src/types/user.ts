export type Gender = 'male' | 'female'

export interface UserAddress {
  address: string
  city: string
  state: string
  stateCode?: string
  postalCode: string
  country: string
}

export interface UserCompany {
  department: string
  name: string
  title: string
}

export interface User {
  id: number
  firstName: string
  lastName: string
  maidenName?: string
  age: number
  gender: Gender | ''
  email: string
  phone: string
  username: string
  password: string
  birthDate?: string
  image?: string
  bloodGroup?: string
  height?: number | null
  weight?: number | null
  eyeColor?: string
  address?: UserAddress
  university?: string
  company?: UserCompany
  role?: 'admin' | 'moderator' | 'user'
}

export type CreateUserDto = Pick<
  User,
  'firstName' | 'lastName' | 'email' | 'username' | 'password' | 'age' | 'gender' | 'phone'
>

export type UpdateUserDto = Partial<CreateUserDto>

export type SortOrder = 'asc' | 'desc'

export type UserSortField = 'firstName' | 'age'

export interface ListParams {
  limit?: number
  skip?: number
  sortBy?: string
  order?: SortOrder
}

export interface Page<T> {
  items: T[]
  total: number
  skip: number
  limit: number
}
