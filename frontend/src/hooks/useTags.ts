import useSWR from 'swr'
import { fetcher, fetchWithAuth } from '@/lib/fetcher'
import { Tag } from '@/types'

export function useTags() {
  const { data, error, isLoading, mutate } = useSWR<Tag[]>('/api/tags', fetcher)

  const createTag = async (tagData: Partial<Tag>) => {
    await fetchWithAuth('/api/tags', { method: 'POST', body: JSON.stringify(tagData) })
    mutate()
  }

  return { 
    tags: data || [], 
    isLoading, 
    isError: error, 
    mutate, 
    createTag
  }
}
