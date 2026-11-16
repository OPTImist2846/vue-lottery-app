import type { ListParams, Page } from '@/types/user'

export interface Readable<T> {
  getAll(params?: ListParams): Promise<Page<T>>
  getById(id: number): Promise<T>
}

export interface Searchable<T> {
  search(query: string, params?: ListParams): Promise<Page<T>>
}

export interface Creatable<T, TCreate> {
  create(data: TCreate): Promise<T>
}

export interface Editable<T, TUpdate> {
  update(id: number, data: TUpdate): Promise<T>
}

export interface Deletable<T> {
  delete(id: number): Promise<T>
}
