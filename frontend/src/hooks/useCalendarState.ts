import { useState } from "react"
import dayjs from "dayjs"
import type { Dayjs } from "dayjs"
import { Todo } from "@/types"

interface CalendarState {
  currentDate: Dayjs
  selectedDate: Dayjs | null
  dialogOpen: boolean
  editingTodo: Todo | null
  setCurrentDate: React.Dispatch<React.SetStateAction<Dayjs>>
  setSelectedDate: React.Dispatch<React.SetStateAction<Dayjs | null>>
  openCreate: () => void
  openEdit: (todo: Todo) => void
  closeDialog: () => void
}

export function useCalendarState(): CalendarState {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs())
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  const openCreate = () => { setEditingTodo(null); setDialogOpen(true) }
  const openEdit = (todo: Todo) => { setEditingTodo(todo); setDialogOpen(true) }
  const closeDialog = () => setDialogOpen(false)

  return {
    currentDate, setCurrentDate,
    selectedDate, setSelectedDate,
    dialogOpen, editingTodo,
    openCreate, openEdit, closeDialog,
  }
}
