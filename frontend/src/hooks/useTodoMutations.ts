import { toast } from 'sonner'
import { fetchWithAuth } from '@/lib/fetcher'
import { Todo } from '@/types'

export function useTodoMutations() {
  const createTodo = async (todoData: Partial<Todo>) => {
    try {
      await fetchWithAuth('/api/todos', { method: 'POST', body: JSON.stringify(todoData) })
    } catch {
      toast.error('할 일을 생성하지 못했습니다.')
      throw new Error('createTodo failed')
    }
  }

  const updateTodo = async (id: number, updates: Partial<Todo>) => {
    try {
      await fetchWithAuth(`/api/todos/${id}`, { method: 'PUT', body: JSON.stringify(updates) })
    } catch {
      toast.error('할 일을 수정하지 못했습니다.')
      throw new Error('updateTodo failed')
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      await fetchWithAuth(`/api/todos/${id}`, { method: 'DELETE' })
    } catch {
      toast.error('할 일을 삭제하지 못했습니다.')
      throw new Error('deleteTodo failed')
    }
  }

  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      await fetchWithAuth(`/api/todos/${id}`, { method: 'PATCH', body: JSON.stringify({ completed }) })
    } catch {
      toast.error('상태를 변경하지 못했습니다.')
      throw new Error('toggleTodo failed')
    }
  }

  const reorderTodos = async (items: { id: number; position: number }[]) => {
    try {
      await fetchWithAuth('/api/todos/reorder', { method: 'PATCH', body: JSON.stringify({ items }) })
    } catch {
      toast.error('순서를 저장하지 못했습니다.')
      throw new Error('reorderTodos failed')
    }
  }

  return { createTodo, updateTodo, deleteTodo, toggleTodo, reorderTodos }
}
