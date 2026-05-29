import { mutate as globalMutate } from 'swr'
import { Category } from '@/types'
import { useResource } from './useResource'

const invalidateTodos = () =>
  globalMutate((key: unknown) => typeof key === 'string' && key.startsWith('/api/todos'))

export function useCategories() {
  const { data, isLoading, isError, mutate, create, remove } = useResource<Category>('/api/categories')

  const deleteCategory = async (id: number) => {
    await remove(id)
    await invalidateTodos()
  }

  return {
    categories: data,
    isLoading,
    isError,
    mutate,
    createCategory: create,
    deleteCategory,
  }
}
