import { useState, useCallback, useMemo } from "react"
import dayjs from "dayjs"
import type { Dayjs } from "dayjs"
import { buildQuery } from "@/lib/queryBuilder"
import { useTodos, useTodoMutations, useLocalTodoSync, useDragDrop } from "@/hooks"
import { Todo } from "@/types"

interface UseCalendarTodosOptions {
  currentDate: Dayjs
  selectedDate: Dayjs | null
}

export function useCalendarTodos({ currentDate, selectedDate }: UseCalendarTodosOptions) {
  const monthQueryParams = useMemo(() => buildQuery({
    dueDateFrom: currentDate.startOf("month").format("YYYY-MM-DD"),
    dueDateTo: currentDate.endOf("month").format("YYYY-MM-DD"),
  }), [currentDate])

  const { rawTodos, refetch, isLoading } = useTodos(monthQueryParams)
  const { toggleTodo, deleteTodo, reorderTodos } = useTodoMutations()
  const [localTodos, setLocalTodos] = useLocalTodoSync(rawTodos)

  const { draggingFromId, onDragStart, onDragEnd } = useDragDrop({
    localTodos,
    setLocalTodos,
    reorderTodos,
    filterFn: selectedDate ? (t: Todo) => dayjs(t.dueDate).isSame(selectedDate, "day") : undefined,
  })

  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set())

  const handleToggle = useCallback(async (todo: Todo) => {
    if (togglingIds.has(todo.id)) return

    setTogglingIds(prev => new Set(prev).add(todo.id))
    const snapshot = localTodos
    const next = !todo.completed
    setLocalTodos(prev => prev.map(t =>
      t.id === todo.id ? { ...t, completed: next, completedAt: next ? new Date().toISOString() : null } : t
    ))
    try {
      await toggleTodo(todo.id, next)
    } catch {
      setLocalTodos(snapshot)
    } finally {
      setTogglingIds(prev => { const s = new Set(prev); s.delete(todo.id); return s })
    }
  }, [localTodos, toggleTodo, togglingIds])

  const handleDelete = useCallback(async (id: number) => {
    const snapshot = localTodos
    setLocalTodos(prev => prev.filter(t => t.id !== id))
    try {
      await deleteTodo(id)
    } catch {
      setLocalTodos(snapshot)
    }
  }, [localTodos, deleteTodo])

  const selectedTodos = useMemo(
    () => selectedDate ? localTodos.filter(t => dayjs(t.dueDate).isSame(selectedDate, "day")) : [],
    [localTodos, selectedDate]
  )

  return {
    localTodos,
    isLoading,
    refetch,
    selectedTodos,
    togglingIds,
    handleToggle,
    handleDelete,
    draggingFromId,
    onDragStart,
    onDragEnd,
  }
}
