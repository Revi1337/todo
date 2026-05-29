import { Tag } from '@/types'
import { useResource } from './useResource'

export function useTags() {
  const { data, isLoading, isError, mutate, create } = useResource<Tag>('/api/tags')

  return {
    tags: data,
    isLoading,
    isError,
    mutate,
    createTag: create,
  }
}
