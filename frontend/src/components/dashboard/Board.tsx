"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { DragDropContext, type DragStart, type DropResult } from "@hello-pangea/dnd"
import { useTodos } from "@/hooks/useTodos"
import { useCategories } from "@/hooks/useCategories"
import { useTags } from "@/hooks/useTags"
import { Todo, TodoFilter } from "@/types"
import { buildQuery } from "@/lib/queryBuilder"
import { Column } from "./Column"
import { FilterPanel } from "./FilterPanel"
import { TodoFormDialog } from "./TodoFormDialog"

export function Board() {
  const [filter, setFilter] = useState<TodoFilter>({})
  const [search, setSearch] = useState("")

  const queryParams = useMemo(
    () => buildQuery({ ...filter, search: search || undefined }),
    [filter, search]
  )

  const { todos: swrTodos, toggleTodo, deleteTodo, isLoading } = useTodos(queryParams)
  const { categories } = useCategories()
  const { tags } = useTags()

  const [localTodos, setLocalTodos] = useState<Todo[]>([])
  const [draggingFromId, setDraggingFromId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  useEffect(() => {
    if (swrTodos) setLocalTodos(swrTodos)
  }, [swrTodos])

  const activeTodos = useMemo(() => localTodos.filter(t => !t.completed), [localTodos])
  const completedTodos = useMemo(
    () => localTodos
      .filter(t => t.completed)
      .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()),
    [localTodos]
  )

  const onDragStart = useCallback((start: DragStart) => {
    setDraggingFromId(start.source.droppableId)
  }, [])

  const onDragEnd = useCallback((result: DropResult) => {
    setDraggingFromId(null)
    if (!result.destination) return
    const { source, destination } = result
    if (source.droppableId !== destination.droppableId) return

    setLocalTodos(prev => {
      const todos = [...prev]
      const isCompleted = source.droppableId === "COMPLETED"
      const col = todos.filter(t => t.completed === isCompleted)
      const other = todos.filter(t => t.completed !== isCompleted)
      const [moved] = col.splice(source.index, 1)
      col.splice(destination.index, 0, moved)
      return isCompleted ? [...other, ...col] : [...col, ...other]
    })
  }, [])

  const handleToggle = useCallback(async (id: number) => {
    const todo = localTodos.find(t => t.id === id)
    if (!todo) return
    const next = !todo.completed
    setLocalTodos(prev => prev.map(t =>
      t.id === id ? { ...t, completed: next, completedAt: next ? new Date().toISOString() : null } : t
    ))
    try {
      await toggleTodo(id, next)
    } catch {
      setLocalTodos(prev => prev.map(t =>
        t.id === id ? { ...t, completed: todo.completed, completedAt: todo.completedAt } : t
      ))
    }
  }, [localTodos, toggleTodo])

  const handleDelete = useCallback(async (id: number) => {
    const snapshot = localTodos
    setLocalTodos(prev => prev.filter(t => t.id !== id))
    try {
      await deleteTodo(id)
    } catch {
      setLocalTodos(snapshot)
    }
  }, [localTodos, deleteTodo])

  const openCreate = useCallback(() => { setEditingTodo(null); setDialogOpen(true) }, [])
  const openEdit = useCallback((todo: Todo) => { setEditingTodo(todo); setDialogOpen(true) }, [])
  const handleReset = useCallback(() => { setFilter({}); setSearch("") }, [])
  const handleClose = useCallback(() => setDialogOpen(false), [])

  if (isLoading) return <div className="p-8 flex justify-center text-muted-foreground">로딩 중...</div>

  return (
    <>
      <div className="flex gap-8 h-full">
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex-1 grid grid-rows-2 gap-6 h-full min-h-0 overflow-hidden">
            <Column title="할 일" id="ACTIVE" todos={activeTodos}
              onToggle={handleToggle} onEdit={openEdit} onDelete={handleDelete} scrollable
              draggingFromId={draggingFromId} />
            <Column title="완료됨" id="COMPLETED" todos={completedTodos}
              onToggle={handleToggle} onEdit={openEdit} onDelete={handleDelete} scrollable
              draggingFromId={draggingFromId} />
          </div>
        </DragDropContext>

        <FilterPanel
          filter={filter}
          search={search}
          categories={categories}
          tags={tags}
          onFilterChange={setFilter}
          onSearchChange={setSearch}
          onReset={handleReset}
          onCreateTodo={openCreate}
        />
      </div>

      <TodoFormDialog open={dialogOpen} onClose={handleClose} todo={editingTodo} />
    </>
  )
}
