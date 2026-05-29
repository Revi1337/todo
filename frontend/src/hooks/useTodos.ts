import useSWR from 'swr'
import { fetcher, fetchWithAuth } from '@/lib/fetcher'
import { Todo } from '@/types'

export function useTodos(queryParams = '') {
  const { data, error, isLoading, mutate } = useSWR<Todo[]>(`/api/todos${queryParams}`, fetcher)

  const createTodo = async (todoData: Partial<Todo>) => {
    await fetchWithAuth('/api/todos', { method: 'POST', body: JSON.stringify(todoData) })
    mutate()
  }

  const updateTodo = async (id: number, updates: Partial<Todo>) => {
    // Optimistic UI could be implemented here
    await fetchWithAuth(`/api/todos/${id}`, { method: 'PUT', body: JSON.stringify(updates) })
    mutate()
  }

  const deleteTodo = async (id: number) => {
    await fetchWithAuth(`/api/todos/${id}`, { method: 'DELETE' })
    mutate()
  }

  const toggleTodo = async (id: number, completed: boolean) => {
    await fetchWithAuth(`/api/todos/${id}`, { method: 'PUT', body: JSON.stringify({ completed }) })
    mutate()
  }

  return { 
    todos: data || [], 
    isLoading, 
    isError: error, 
    mutate, 
    createTodo, 
    updateTodo, 
    deleteTodo, 
    toggleTodo 
  }
}
