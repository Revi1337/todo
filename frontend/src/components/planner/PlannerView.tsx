"use client"

import { useRef } from "react"
import dayjs from "dayjs"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePlannerState } from "@/hooks/usePlannerState"
import { usePlannerTodos } from "@/hooks/usePlannerTodos"
import { PlannerCalendar } from "./PlannerCalendar"
import { PlannerPool } from "./PlannerPool"
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
    openEdit,
    closeDialog,
  } = usePlannerState()

  const {
    todos,
    scheduledTodos,
    unscheduledActive,
    unscheduledCompleted,
    isLoading,
    refetch,
    handleEventDrop,
    handleEventResize,
    handleEventReceive,
    handleUnschedule,
    togglingIds,
    handleToggle,
    handleDelete,
  } = usePlannerTodos({ selectedDate })

  // 풀 컨테이너 ref — FullCalendar Draggable 초기화 + 드래그 투 언스케줄 감지에 공유
  const poolRef = useRef<HTMLDivElement | null>(null)

  const handleEdit = (todo: Todo | ScheduledTodo) => openEdit(todo)
  const dayPrefix = getDayPrefix(selectedDate)

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex gap-4 shrink-0">
        <div className="flex-[6]">
          {dayPrefix && (
            <p className="text-xs text-muted-foreground font-medium mb-0.5">{dayPrefix}</p>
          )}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">{formatMainDate(selectedDate)}</h2>
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
          poolRef={poolRef}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onEventReceive={handleEventReceive}
          onUnschedule={handleUnschedule}
          onEdit={handleEdit}
          onToggle={handleToggle}
          togglingIds={togglingIds}
          className="flex-[6]"
        />
        <PlannerPool
          activeTodos={unscheduledActive}
          completedTodos={unscheduledCompleted}
          totalCount={todos.length}
          isLoading={isLoading}
          poolRef={poolRef}
          onEdit={handleEdit}
          onCreateTodo={openCreate}
          className="flex-[4]"
        />
      </div>

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
