"use client"

import { useCalendarState } from "@/hooks/useCalendarState"
import { useCalendarTodos } from "@/hooks/useCalendarTodos"
import { CalendarGrid } from "./CalendarGrid"
import { CalendarDetail } from "./CalendarDetail"
import { TodoFormDialog } from "./TodoFormDialog"

export function CalendarView() {
  const {
    currentDate, setCurrentDate,
    selectedDate, setSelectedDate,
    dialogOpen, editingTodo,
    openCreate, openEdit, closeDialog,
  } = useCalendarState()

  const {
    localTodos,
    isLoading,
    refetch,
    selectedTodos,
    togglingIds,
    handleToggle,
    handleDelete,
    onDragStart,
    onDragEnd,
  } = useCalendarTodos({ currentDate, selectedDate })

  return (
    <>
      <div className="flex flex-col xl:flex-row gap-8 xl:h-full xl:items-start">
        <CalendarGrid
          currentDate={currentDate}
          selectedDate={selectedDate}
          localTodos={localTodos}
          isLoading={isLoading}
          onSelectDate={setSelectedDate}
          onPrevMonth={() => setCurrentDate(d => d.subtract(1, "month"))}
          onNextMonth={() => setCurrentDate(d => d.add(1, "month"))}
        />
        <CalendarDetail
          selectedDate={selectedDate}
          selectedTodos={selectedTodos}
          isLoading={isLoading}
          togglingIds={togglingIds}
          onCreateTodo={openCreate}
          onEdit={openEdit}
          onToggle={handleToggle}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      </div>

      <TodoFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSaved={refetch}
        onDelete={handleDelete}
        todo={editingTodo}
        defaultDueDate={selectedDate ? selectedDate.format("YYYY-MM-DD") : undefined}
      />
    </>
  )
}
