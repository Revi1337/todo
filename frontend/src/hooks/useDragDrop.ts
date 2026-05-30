import { useState, useCallback } from "react"
import { type DragStart, type DropResult } from "@hello-pangea/dnd"
import { Todo } from "@/types"

interface UseDragDropOptions {
  localTodos: Todo[]
  swrTodos: Todo[]
  setLocalTodos: (todos: Todo[]) => void
  reorderTodos: (items: { id: number; position: number }[]) => Promise<void>
}

export function useDragDrop({ localTodos, swrTodos, setLocalTodos, reorderTodos }: UseDragDropOptions) {
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
    const col = localTodos.filter(t => t.completed === isCompleted)
    const other = localTodos.filter(t => t.completed !== isCompleted)
    const newCol = [...col]
    const [moved] = newCol.splice(source.index, 1)
    newCol.splice(destination.index, 0, moved)

    const reorderItems = newCol.map((t, i) => ({ id: t.id, position: i }))
    const newTodos = isCompleted ? [...other, ...newCol] : [...newCol, ...other]

    setLocalTodos(newTodos)
    reorderTodos(reorderItems).catch(() => setLocalTodos(swrTodos))
  }, [localTodos, swrTodos, setLocalTodos, reorderTodos])

  return { draggingFromId, onDragStart, onDragEnd }
}
