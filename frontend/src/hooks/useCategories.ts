import useSWR from 'swr'
import { fetcher, fetchWithAuth } from '@/lib/fetcher'
import { Category } from '@/types'

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<Category[]>('/api/categories', fetcher)

  const createCategory = async (categoryData: Partial<Category>) => {
    await fetchWithAuth('/api/categories', { method: 'POST', body: JSON.stringify(categoryData) })
    mutate()
  }

  const deleteCategory = async (id: number) => {
    await fetchWithAuth(`/api/categories/${id}`, { method: 'DELETE' })
    mutate()
  }

  return { 
    categories: data || [], 
    isLoading, 
    isError: error, 
    mutate, 
    createCategory, 
    deleteCategory 
  }
}
