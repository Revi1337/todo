import { useState, useCallback } from "react"
import dayjs, { Dayjs } from "dayjs"
import { Todo } from "@/types"

interface PlannerState {
  selectedDate: Dayjs
  dialogOpen: boolean
  editingTodo: Todo | null
  goToPrevDay: () => void
  goToNextDay: () => void
  goToToday: () => void
  openCreate: () => void
  openEdit: (todo: Todo) => void
  closeDialog: () => void
}

export function usePlannerState(): PlannerState {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => dayjs())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  const goToPrevDay = useCallback(() => setSelectedDate(d => d.subtract(1, "day")), [])
  const goToNextDay = useCallback(() => setSelectedDate(d => d.add(1, "day")), [])
  const goToToday = useCallback(() => setSelectedDate(dayjs()), [])

  const openCreate = useCallback(() => { setEditingTodo(null); setDialogOpen(true) }, [])
  const openEdit = useCallback((todo: Todo) => { setEditingTodo(todo); setDialogOpen(true) }, [])
  const closeDialog = useCallback(() => setDialogOpen(false), [])

  return {
    selectedDate,
    dialogOpen,
    editingTodo,
    goToPrevDay,
    goToNextDay,
    goToToday,
    openCreate,
    openEdit,
    closeDialog,
  }
}
