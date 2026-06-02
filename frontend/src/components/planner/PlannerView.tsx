"use client"

import dayjs from "dayjs"
import { DragDropContext } from "@hello-pangea/dnd"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePlannerState } from "@/hooks/usePlannerState"
import { usePlannerTodos } from "@/hooks/usePlannerTodos"
import { PlannerTimeGrid } from "./PlannerTimeGrid"
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
    scheduledTodos,
    unscheduledTodos,
    todos,
    isLoading,
    refetch,
    handleToggle,
    handleDelete,
    gridRef,
    scrollRef,
    onDragStart,
    onDragEnd,
  } = usePlannerTodos({ selectedDate })

  const handleEdit = (todo: Todo | ScheduledTodo) => openEdit(todo)

  const dayPrefix = getDayPrefix(selectedDate)

  return (
    <div className="flex flex-col h-full gap-4">
      {/* 날짜 네비게이션 — 하단 패널 비율(flex-[6] / flex-[4])에 맞춰 정렬 */}
      <div className="flex gap-4 shrink-0">
        {/* 시간 그리드 폭(flex-[6])과 동일한 영역에 날짜 + 버튼 배치 */}
        <div className="flex-[6]">
          {dayPrefix && (
            <p className="text-xs text-muted-foreground font-medium mb-0.5">{dayPrefix}</p>
          )}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">{formatMainDate(selectedDate)}</h2>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="text-xs h-7 px-2.5 rounded-full"
              >
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
        {/* 태스크 풀 폭(flex-[4]) 스페이서 */}
        <div className="flex-[4]" />
      </div>

      {/* 메인 콘텐츠 */}
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex gap-4 flex-1 min-h-0">
          <PlannerTimeGrid
            scheduledTodos={scheduledTodos}
            isLoading={isLoading}
            gridRef={gridRef}
            scrollRef={scrollRef}
            onEdit={handleEdit}
            onToggle={handleToggle}
            className="flex-[6]"
          />
          <PlannerPool
            unscheduledTodos={unscheduledTodos}
            totalCount={todos.length}
            isLoading={isLoading}
            onEdit={handleEdit}
            onCreateTodo={openCreate}
            className="flex-[4]"
          />
        </div>
      </DragDropContext>

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
