"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { DragDropContext } from "@hello-pangea/dnd"
import { ChevronLeft, ChevronRight } from "lucide-react"
import dayjs from "dayjs"
import { useTodos } from "@/hooks/useTodos"
import { useCategories } from "@/hooks/useCategories"
import { useTags } from "@/hooks/useTags"
import { useBoardState } from "@/hooks/useBoardState"
import { useDragDrop } from "@/hooks/useDragDrop"
import { Todo } from "@/types"
import { buildQuery } from "@/lib/queryBuilder"
import { TodoActionsProvider } from "@/contexts/TodoActionsContext"
import { Column } from "./Column"
import { FilterPanel } from "./FilterPanel"
import { TodoFormDialog } from "./TodoFormDialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useFilterSheet } from "@/contexts/FilterSheetContext"

function formatDateLabel(date: dayjs.Dayjs): string {
  const today = dayjs().startOf("day")
  const diff = date.startOf("day").diff(today, "day")
  const formatted = date.format("M월 D일")
  if (diff === -1) return `어제 (${formatted})`
  if (diff === 0) return `오늘 (${formatted})`
  if (diff === 1) return `내일 (${formatted})`
  return formatted
}

export function Board() {
  const {
    selectedDate, filter, setFilter, search, setSearch,
    dialogOpen, editingTodo,
    goToPrevDay, goToNextDay,
    openCreate, openEdit, closeDialog, resetFilter,
  } = useBoardState()

  const queryParams = useMemo(
    () => buildQuery({
      ...filter,
      dueDate: selectedDate.format("YYYY-MM-DD"),
      search: search || undefined,
    }),
    [filter, search, selectedDate]
  )

  const { rawTodos, toggleTodo, deleteTodo, reorderTodos, mutate } = useTodos(queryParams)
  const { categories } = useCategories()
  const { tags } = useTags()

  const [localTodos, setLocalTodos] = useState<Todo[]>([])

  useEffect(() => {
    if (rawTodos !== undefined) setLocalTodos(rawTodos)
  }, [rawTodos])

  const clearCache = useCallback(() => mutate(undefined, { revalidate: false }), [mutate])

  const { draggingFromId, onDragStart, onDragEnd } = useDragDrop({
    localTodos,
    setLocalTodos,
    reorderTodos,
    clearCache,
  })

  const activeTodos = useMemo(() => localTodos.filter(t => !t.completed), [localTodos])
  const completedTodos = useMemo(() => localTodos.filter(t => t.completed), [localTodos])

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
      clearCache()
    } catch {
      setLocalTodos(snapshot)
    }
  }, [localTodos, toggleTodo, clearCache])

  const handleDelete = useCallback(async (id: number) => {
    const snapshot = localTodos
    setLocalTodos(prev => prev.filter(t => t.id !== id))
    try {
      await deleteTodo(id)
      clearCache()
    } catch {
      setLocalTodos(snapshot)
    }
  }, [localTodos, deleteTodo, clearCache])

  const { open: filterSheetOpen, setOpen: setFilterSheetOpen } = useFilterSheet()

  const filterPanelProps = {
    filter, search, categories, tags,
    onFilterChange: setFilter,
    onSearchChange: setSearch,
    onReset: resetFilter,
    onCreateTodo: openCreate,
  }

  return (
    <>
      <div className="flex gap-8 h-full">
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-center gap-3 shrink-0">
            <button
              onClick={goToPrevDay}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-base font-semibold w-44 text-center">
              {formatDateLabel(selectedDate)}
            </span>
            <button
              onClick={goToNextDay}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <TodoActionsProvider onToggle={handleToggle} onEdit={openEdit} onDelete={handleDelete}>
            <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
              <div className="flex-1 grid grid-rows-2 gap-6 min-h-0 overflow-hidden">
                <Column title="할 일" id="ACTIVE" todos={activeTodos} scrollable draggingFromId={draggingFromId} />
                <Column title="완료됨" id="COMPLETED" todos={completedTodos} scrollable draggingFromId={draggingFromId} />
              </div>
            </DragDropContext>
          </TodoActionsProvider>
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
        onClose={closeDialog}
        todo={editingTodo}
        defaultDueDate={selectedDate.format("YYYY-MM-DD")}
      />
    </>
  )
}
