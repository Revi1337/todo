import { useState, useCallback } from "react"
import { type DragStart, type DropResult } from "@hello-pangea/dnd"
import { Todo } from "@/types"

interface UseDragDropOptions {
  localTodos: Todo[]
  setLocalTodos: (todos: Todo[]) => void
  reorderTodos: (items: { id: number; position: number }[]) => Promise<void>
  filterFn?: (todo: Todo) => boolean
}

export function useDragDrop({ localTodos, setLocalTodos, reorderTodos, filterFn }: UseDragDropOptions) {
  const [draggingFromId, setDraggingFromId] = useState<string | null>(null)

  const onDragStart = useCallback((start: DragStart) => {
    setDraggingFromId(start.source.droppableId)
  }, [])

  const onDragEnd = useCallback((result: DropResult) => {
    setDraggingFromId(null)
    if (!result.destination) return
    const { source, destination } = result
    if (source.droppableId !== destination.droppableId) return
    if (source.index === destination.index) return

    const isCompleted = source.droppableId === "COMPLETED"

    const visibleTodos = filterFn ? localTodos.filter(filterFn) : localTodos
    const hiddenTodos = filterFn ? localTodos.filter(t => !filterFn(t)) : []

    const col = visibleTodos.filter(t => t.completed === isCompleted)
    const otherVisible = visibleTodos.filter(t => t.completed !== isCompleted)
    const newCol = [...col]
    const [moved] = newCol.splice(source.index, 1)
    newCol.splice(destination.index, 0, moved)

    const reorderItems = newCol.map((t, i) => ({ id: t.id, position: i }))
    const newVisible = isCompleted ? [...otherVisible, ...newCol] : [...newCol, ...otherVisible]
    const newTodos = [...hiddenTodos, ...newVisible]
    const snapshot = localTodos

    setLocalTodos(newTodos)
    reorderTodos(reorderItems).catch(() => setLocalTodos(snapshot))
  }, [localTodos, setLocalTodos, reorderTodos, filterFn])

  return { draggingFromId, onDragStart, onDragEnd }
}
