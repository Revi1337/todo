import { useState, useEffect, useCallback } from 'react'
import { fetcher } from '@/lib/fetcher'
import { Todo } from '@/types'

const emptyTodos: Todo[] = []

export function useTodos(queryParams = '') {
  const [data, setData] = useState<Todo[] | undefined>(undefined)
  const [error, setError] = useState<unknown>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setData(undefined)
    fetcher(`/api/todos${queryParams}`)
      .then((result: Todo[]) => { if (!cancelled) { setData(result); setError(null) } })
      .catch(e => { if (!cancelled) setError(e) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [queryParams])

  const refetch = useCallback(async () => {
    try {
      const result: Todo[] = await fetcher(`/api/todos${queryParams}`)
      setData(result)
      setError(null)
    } catch (e) {
      setError(e)
    }
  }, [queryParams])

  return {
    todos: data ?? emptyTodos,
    rawTodos: data,
    isLoading,
    isValidating: isLoading,
    isError: error,
    refetch,
  }
}
