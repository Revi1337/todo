"use client"

import { useRef, useState } from "react"
import dayjs from "dayjs"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePlannerState } from "@/hooks/usePlannerState"
import { usePlannerTodos } from "@/hooks/usePlannerTodos"
import { PlannerCalendar } from "./PlannerCalendar"
import { PlannerPool } from "./PlannerPool"
import { PlannerScheduleModal } from "./PlannerScheduleModal"
import { TodoFormDialog } from "@/components/dashboard/TodoFormDialog"
import { ScheduledTodo } from "@/hooks/usePlannerTodos"
import { Todo } from "@/types"

const KOREAN_DAYS = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]

function getDayPrefix(date: dayjs.Dayjs): string {
  const diff = date.startOf("day").diff(dayjs().startOf("day"), "day")
  if (diff === -1) return "어제"
  if (diff === 0) return "오늘"
  if (diff === 1) return "내일"
  return ""
}

function formatMainDate(date: dayjs.Dayjs): string {
  return date.format("YYYY년 M월 D일 ") + KOREAN_DAYS[date.day()]
}

export function PlannerView() {
  const {
    selectedDate,
    dialogOpen,
    editingTodo,
    goToPrevDay,
    goToNextDay,
    goToToday,
    openCreate,
    closeDialog,
  } = usePlannerState()

  const {
    todos,
    scheduledTodos,
    scheduledIds,
    unscheduledActive,
    unscheduledCompleted,
    isLoading,
    refetch,
    handleEventDrop,
    handleEventResize,
    handleEventReceive,
    handleScheduleCreate,
    handleScheduleUpdate,
    handleUnschedule,
    togglingIds,
    handleToggle,
    handleDelete,
  } = usePlannerTodos({ selectedDate })

  const poolRef = useRef<HTMLDivElement | null>(null)

  const [scheduleModalTodo, setScheduleModalTodo] = useState<(Todo | ScheduledTodo) | null>(null)
  const scheduleModalScheduled = scheduleModalTodo
    ? scheduledTodos.find(st => st.id === scheduleModalTodo.id)
    : undefined

  const handleEdit = (todo: Todo | ScheduledTodo) => setScheduleModalTodo(todo)
  const closeScheduleModal = () => setScheduleModalTodo(null)

  const dayPrefix = getDayPrefix(selectedDate)

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex gap-4 shrink-0">
        <div className="flex-[6]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">
              {formatMainDate(selectedDate)}
              {dayPrefix && <span className="text-base font-medium text-muted-foreground ml-2">({dayPrefix})</span>}
            </h2>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={goToToday} className="text-xs h-7 px-2.5 rounded-full">
                오늘
              </Button>
              <Button variant="outline" size="icon" className="w-7 h-7 rounded-full" onClick={goToPrevDay}>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="w-7 h-7 rounded-full" onClick={goToNextDay}>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-[4]" />
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <PlannerCalendar
          selectedDate={selectedDate}
          scheduledTodos={scheduledTodos}
          unscheduledTodos={[...unscheduledActive, ...unscheduledCompleted]}
          isLoading={isLoading}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onEventReceive={handleEventReceive}
          onEdit={handleEdit}
          onToggle={handleToggle}
          togglingIds={togglingIds}
          className="flex-[6]"
        />
        <PlannerPool
          todos={todos}
          scheduledIds={scheduledIds}
          totalCount={todos.length}
          isLoading={isLoading}
          poolRef={poolRef}
          onEdit={handleEdit}
          onCreateTodo={openCreate}
          className="flex-[4]"
        />
      </div>

      <PlannerScheduleModal
        todo={scheduleModalTodo}
        scheduledTodo={scheduleModalScheduled}
        onClose={closeScheduleModal}
        onCreate={handleScheduleCreate}
        onUpdate={handleScheduleUpdate}
        onUnschedule={handleUnschedule}
      />

      <TodoFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSaved={refetch}
        onDelete={id => handleDelete(id)}
        todo={editingTodo}
        defaultDueDate={selectedDate.format("YYYY-MM-DD")}
      />
    </div>
  )
}
