"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { DragDropContext, type DragStart, type DropResult } from "@hello-pangea/dnd"
import { ChevronLeft, ChevronRight } from "lucide-react"
import dayjs, { Dayjs } from "dayjs"
import { useTodos } from "@/hooks/useTodos"
import { useCategories } from "@/hooks/useCategories"
import { useTags } from "@/hooks/useTags"
import { Todo, TodoFilter } from "@/types"
import { buildQuery } from "@/lib/queryBuilder"
import { Column } from "./Column"
import { FilterPanel } from "./FilterPanel"
import { TodoFormDialog } from "./TodoFormDialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useFilterSheet } from "@/contexts/FilterSheetContext"

function formatDateLabel(date: Dayjs): string {
  const today = dayjs().startOf("day")
  const diff = date.startOf("day").diff(today, "day")
  const formatted = date.format("M월 D일")
  if (diff === -1) return `어제 (${formatted})`
  if (diff === 0) return `오늘 (${formatted})`
  if (diff === 1) return `내일 (${formatted})`
  return formatted
}

export function Board() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => dayjs())
  const [filter, setFilter] = useState<TodoFilter>({})
  const [search, setSearch] = useState("")

  const queryParams = useMemo(
    () => buildQuery({
      ...filter,
      dueDate: selectedDate.format("YYYY-MM-DD"),
      search: search || undefined,
    }),
    [filter, search, selectedDate]
  )

  const { todos: swrTodos, toggleTodo, deleteTodo, reorderTodos } = useTodos(queryParams)
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
  const completedTodos = useMemo(() => localTodos.filter(t => t.completed), [localTodos])

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
  }, [localTodos, reorderTodos, swrTodos])

  const handleToggle = useCallback(async (id: number) => {
    const snapshot = localTodos
    const todo = localTodos.find(t => t.id === id)
    if (!todo) return
    const next = !todo.completed

    setLocalTodos(prev => {
      const toggled = { ...todo, completed: next, completedAt: next ? new Date().toISOString() : null }
      const others = prev.filter(t => t.id !== id)
      const activeGroup = others.filter(t => !t.completed)
      const completedGroup = others.filter(t => t.completed)
      return next
        ? [...activeGroup, toggled, ...completedGroup]
        : [toggled, ...activeGroup, ...completedGroup]
    })

    try {
      await toggleTodo(id, next)
    } catch {
      setLocalTodos(snapshot)
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

  const { open: filterSheetOpen, setOpen: setFilterSheetOpen } = useFilterSheet()

  const filterPanelProps = {
    filter, search, categories, tags,
    onFilterChange: setFilter,
    onSearchChange: setSearch,
    onReset: handleReset,
    onCreateTodo: openCreate,
  }

  return (
    <>
      <div className="flex gap-8 h-full">
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-center gap-3 shrink-0">
            <button
              onClick={() => setSelectedDate(d => d.subtract(1, "day"))}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-base font-semibold w-44 text-center">
              {formatDateLabel(selectedDate)}
            </span>
            <button
              onClick={() => setSelectedDate(d => d.add(1, "day"))}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="flex-1 grid grid-rows-2 gap-6 min-h-0 overflow-hidden">
              <Column title="할 일" id="ACTIVE" todos={activeTodos}
                onToggle={handleToggle} onEdit={openEdit} onDelete={handleDelete} scrollable
                draggingFromId={draggingFromId} />
              <Column title="완료됨" id="COMPLETED" todos={completedTodos}
                onToggle={handleToggle} onEdit={openEdit} onDelete={handleDelete} scrollable
                draggingFromId={draggingFromId} />
            </div>
          </DragDropContext>
        </div>

        <FilterPanel {...filterPanelProps} />

        <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
          <SheetContent side="right" className="w-[280px] p-0 flex flex-col">
            <SheetHeader className="p-4 border-b border-border/50 text-left shrink-0">
              <SheetTitle>필터</SheetTitle>
            </SheetHeader>
            <div className="p-4 flex-1 min-h-0 overflow-y-auto">
              <FilterPanel {...filterPanelProps} asSheet />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <TodoFormDialog
        open={dialogOpen}
        onClose={handleClose}
        todo={editingTodo}
        defaultDueDate={selectedDate.format("YYYY-MM-DD")}
      />
    </>
  )
}
