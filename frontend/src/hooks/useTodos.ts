import useSWR, { mutate as globalMutate } from 'swr'
import { fetcher, fetchWithAuth } from '@/lib/fetcher'
import { Todo } from '@/types'

const emptyTodos: Todo[] = []

const invalidateTodos = () =>
  globalMutate((key: unknown) => typeof key === 'string' && key.startsWith('/api/todos'))

export function useTodos(queryParams = '') {
  const { data, error, isLoading, mutate } = useSWR<Todo[]>(
    `/api/todos${queryParams}`,
    fetcher,
    { keepPreviousData: true }
  )

  const createTodo = async (todoData: Partial<Todo>) => {
    await fetchWithAuth('/api/todos', { method: 'POST', body: JSON.stringify(todoData) })
    await invalidateTodos()
  }

  const updateTodo = async (id: number, updates: Partial<Todo>) => {
    await fetchWithAuth(`/api/todos/${id}`, { method: 'PUT', body: JSON.stringify(updates) })
    await invalidateTodos()
  }

  const deleteTodo = async (id: number) => {
    await fetchWithAuth(`/api/todos/${id}`, { method: 'DELETE' })
    await invalidateTodos()
  }

  const toggleTodo = async (id: number, completed: boolean) => {
    await fetchWithAuth(`/api/todos/${id}`, { method: 'PATCH', body: JSON.stringify({ completed }) })
    await invalidateTodos()
  }

  return {
    todos: data || emptyTodos,
    isLoading,
    isError: error,
    mutate,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo
  }
}
