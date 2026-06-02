import { useState, useCallback } from "react"
import dayjs, { Dayjs } from "dayjs"
import { Todo, TodoFilter } from "@/types"

interface BoardState {
  selectedDate: Dayjs
  filter: TodoFilter
  setFilter: (filter: TodoFilter) => void
  search: string
  setSearch: (search: string) => void
  dialogOpen: boolean
  editingTodo: Todo | null
  goToPrevDay: () => void
  goToNextDay: () => void
  openCreate: () => void
  openEdit: (todo: Todo) => void
  closeDialog: () => void
  resetFilter: () => void
}

export function useBoardState(): BoardState {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => dayjs())
  const [filter, setFilter] = useState<TodoFilter>({})
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  const goToPrevDay = useCallback(() => setSelectedDate(d => d.subtract(1, "day")), [])
  const goToNextDay = useCallback(() => setSelectedDate(d => d.add(1, "day")), [])

  const openCreate = useCallback(() => { setEditingTodo(null); setDialogOpen(true) }, [])
  const openEdit = useCallback((todo: Todo) => { setEditingTodo(todo); setDialogOpen(true) }, [])
  const closeDialog = useCallback(() => setDialogOpen(false), [])

  const resetFilter = useCallback(() => { setFilter({}); setSearch("") }, [])

  return {
    selectedDate,
    filter, setFilter,
    search, setSearch,
    dialogOpen,
    editingTodo,
    goToPrevDay, goToNextDay,
    openCreate, openEdit, closeDialog,
    resetFilter,
  }
}
