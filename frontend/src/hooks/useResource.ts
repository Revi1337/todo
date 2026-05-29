import useSWR, { mutate as globalMutate } from 'swr'
import { fetcher, fetchWithAuth } from '@/lib/fetcher'

const invalidate = (prefix: string) =>
  globalMutate((key: unknown) => typeof key === 'string' && key.startsWith(prefix))

export function useResource<T>(endpoint: string) {
  const { data, error, isLoading, mutate } = useSWR<T[]>(endpoint, fetcher)

  const create = async (payload: Partial<T>) => {
    await fetchWithAuth(endpoint, { method: 'POST', body: JSON.stringify(payload) })
    await invalidate(endpoint)
  }

  const remove = async (id: number) => {
    await fetchWithAuth(`${endpoint}/${id}`, { method: 'DELETE' })
    await invalidate(endpoint)
  }

  return {
    data: data || [],
    isLoading,
    isError: error,
    mutate,
    create,
    remove,
  }
}
