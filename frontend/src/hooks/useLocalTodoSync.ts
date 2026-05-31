import { useState, useEffect } from 'react'
import { Todo } from '@/types'

export function useLocalTodoSync(rawTodos: Todo[] | undefined) {
  const [localTodos, setLocalTodos] = useState<Todo[]>([])
  useEffect(() => {
    if (rawTodos !== undefined) setLocalTodos(rawTodos)
  }, [rawTodos])
  return [localTodos, setLocalTodos] as const
}
