import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import type { UsersQuery } from '@/stores/users'
import type { SortOrder, UserSortField } from '@/types/user'

export const SORT_FIELDS: readonly UserSortField[] = ['firstName', 'age']

function first(value: LocationQuery[string] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' ? raw : ''
}

export function parseUsersQuery(query: LocationQuery): UsersQuery {
  const page = Number.parseInt(first(query.page), 10)
  const sortBy = first(query.sortBy) as UserSortField
  const order = first(query.order) as SortOrder
  const isSorted = SORT_FIELDS.includes(sortBy)
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    q: first(query.q).trim(),
    sortBy: isSorted ? sortBy : undefined,
    order: isSorted ? (order === 'desc' ? 'desc' : 'asc') : undefined,
  }
}

export function toRouteQuery({ page, q, sortBy, order }: UsersQuery): LocationQueryRaw {
  const query: LocationQueryRaw = {}
  if (page > 1) query.page = String(page)
  if (q.trim()) query.q = q.trim()
  if (sortBy) {
    query.sortBy = sortBy
    query.order = order ?? 'asc'
  }
  return query
}

export function nextSort(
  current: Pick<UsersQuery, 'sortBy' | 'order'>,
  field: UserSortField,
): Pick<UsersQuery, 'sortBy' | 'order'> {
  if (current.sortBy !== field) return { sortBy: field, order: 'asc' }
  return { sortBy: field, order: current.order === 'asc' ? 'desc' : 'asc' }
}
