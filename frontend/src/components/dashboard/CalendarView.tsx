"use client"

import { useState, useEffect, useCallback } from "react"
import dayjs from "dayjs"
import { DragDropContext, Droppable } from "@hello-pangea/dnd"
import { useTodos } from "@/hooks/useTodos"
import { useDragDrop } from "@/hooks/useDragDrop"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Todo, Priority } from "@/types"
import { PRIORITY_META } from "@/constants/priority"
import { TodoFormDialog } from "./TodoFormDialog"
import { CalendarTodoCard } from "./CalendarTodoCard"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"]

function buildCalendarDays(date: dayjs.Dayjs): (number | null)[] {
  const days: (number | null)[] = []
  for (let i = 0; i < date.startOf("month").day(); i++) days.push(null)
  for (let i = 1; i <= date.daysInMonth(); i++) days.push(i)
  while (days.length < 42) days.push(null)
  return days
}

interface PriorityRowProps {
  priority: Priority
  total: number
  completed: number
}

function PriorityRow({ priority, total, completed }: PriorityRowProps) {
  if (total === 0) return null
  const { dotColor } = PRIORITY_META[priority]
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-[2px] shrink-0 ${dotColor}`} />
      <span className="text-[11px] font-semibold text-foreground">{total}</span>
      <span className="text-[11px] text-muted-foreground/40">/</span>
      <span className="text-[11px] text-muted-foreground">{completed}</span>
    </div>
  )
}

interface CalendarCellProps {
  dateNum: number
  isToday: boolean
  isSelected: boolean
  dayTodos: Todo[]
  onClick: () => void
}

function CalendarCell({ dateNum, isToday, isSelected, dayTodos, onClick }: CalendarCellProps) {
  const priorityRows = (["HIGH", "MEDIUM", "LOW"] as Priority[]).map(p => ({
    priority: p,
    total: dayTodos.filter(t => t.priority === p).length,
    completed: dayTodos.filter(t => t.priority === p && t.completed).length,
  }))

  return (
    <div
      onClick={onClick}
      className={`h-full p-2 border-r border-b border-border/40 transition-colors cursor-pointer flex flex-col gap-1 ${
        isSelected ? "bg-primary/8" : "hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <span className={`text-xs font-bold w-[22px] h-[22px] flex items-center justify-center rounded-full ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
          {dateNum}
        </span>
        {dayTodos.length > 0 && (
          <span className="px-1.5 h-5 flex items-center justify-center bg-muted/80 text-muted-foreground text-[10px] font-bold rounded-full gap-0.5">
            <span className="text-primary/80">{dayTodos.length}</span>
            <span className="opacity-40">/</span>
            <span>{dayTodos.filter(t => t.completed).length}</span>
          </span>
        )}
      </div>
      {dayTodos.length > 0 && (
        <div className="flex flex-col gap-1 mt-1 px-1">
          {priorityRows.map(({ priority, total, completed }) => (
            <PriorityRow key={priority} priority={priority} total={total} completed={completed} />
          ))}
        </div>
      )}
    </div>
  )
}


export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  const { todos, rawTodos, toggleTodo, deleteTodo, reorderTodos, mutate, isLoading } = useTodos()
  const [localTodos, setLocalTodos] = useState(todos)

  useEffect(() => {
    if (rawTodos !== undefined) setLocalTodos(rawTodos)
  }, [rawTodos])

  const clearCache = useCallback(() => mutate(undefined, { revalidate: false }), [mutate])

  const { onDragStart, onDragEnd } = useDragDrop({ localTodos, setLocalTodos, reorderTodos, clearCache })

  const handleToggle = useCallback(async (todo: Todo) => {
    const snapshot = localTodos
    const next = !todo.completed
    setLocalTodos(prev => prev.map(t =>
      t.id === todo.id ? { ...t, completed: next, completedAt: next ? new Date().toISOString() : null } : t
    ))
    try {
      await toggleTodo(todo.id, next)
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

  const calendarDays = buildCalendarDays(currentDate)
  const selectedTodos = selectedDate
    ? localTodos.filter(t => dayjs(t.dueDate).isSame(selectedDate, "day"))
    : []
  const pendingTodos = selectedTodos.filter(t => !t.completed)
  const completedTodos = selectedTodos.filter(t => t.completed)

  const openCreate = () => { setEditingTodo(null); setDialogOpen(true) }
  const openEdit = (todo: Todo) => { setEditingTodo(todo); setDialogOpen(true) }

  if (isLoading) return <LoadingSpinner />

  return (
    <>
      <div className="flex flex-col xl:flex-row gap-8 xl:h-full xl:items-start">
        {/* 캘린더 */}
        <div className="bg-card rounded-card p-6 shadow-sm border border-border/50 xl:flex-[2] xl:h-full flex flex-col xl:min-h-0 xl:overflow-hidden">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h2 className="text-2xl font-bold tracking-tight">{currentDate.format("YYYY년 MM월")}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(d => d.subtract(1, "month"))} className="rounded-full">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(d => d.add(1, "month"))} className="rounded-full">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 min-h-[360px] xl:flex-1 xl:min-h-0 border-t border-l border-border/40 rounded-lg overflow-hidden grid-rows-[auto_repeat(6,minmax(0,1fr))]">
            {WEEK_DAYS.map(d => (
              <div key={d} className="text-center text-sm font-semibold text-muted-foreground py-3 border-r border-b border-border/40">{d}</div>
            ))}
            {calendarDays.map((dateNum, i) => {
              if (dateNum === null) return <div key={i} className="h-full border-r border-b border-border/40" />
              const date = currentDate.date(dateNum)
              return (
                <CalendarCell
                  key={i}
                  dateNum={dateNum}
                  isToday={date.isSame(dayjs(), "day")}
                  isSelected={!!selectedDate?.isSame(date, "day")}
                  dayTodos={localTodos.filter(t => dayjs(t.dueDate).isSame(date, "day"))}
                  onClick={() => setSelectedDate(date)}
                />
              )
            })}
          </div>
        </div>

        {/* 날짜 상세 패널 */}
        <div className="w-full xl:flex-[1] bg-muted/20 rounded-card p-6 shadow-sm border border-border/50 xl:h-full flex flex-col xl:min-h-0">
          <div className="flex items-start justify-between mb-6 shrink-0">
            <div>
              <h3 className="text-lg font-bold mb-1 tracking-tight">
                {selectedDate ? selectedDate.format("MM월 DD일 일정") : "날짜를 선택하세요"}
              </h3>
              <p className="text-sm text-muted-foreground font-medium">총 {selectedTodos.length}개의 일정</p>
            </div>
            {selectedTodos.length > 0 && (
              <span className="px-2 h-6 flex items-center justify-center bg-muted/80 text-muted-foreground text-xs font-bold rounded-full gap-0.5 border border-border/50 shrink-0 mt-1">
                <span className="text-primary/80">{selectedTodos.length}</span>
                <span className="opacity-40 px-0.5">/</span>
                <span>{selectedTodos.filter(t => t.completed).length}</span>
              </span>
            )}
          </div>

          <Button onClick={openCreate} className="w-full justify-start gap-2 rounded-full mb-6 shrink-0" size="lg">
            <Plus className="w-5 h-5" /> 새 작업 추가
          </Button>

          <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="flex-1 flex flex-col gap-4 xl:min-h-0 xl:overflow-hidden">
              {selectedTodos.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm font-medium">일정이 없습니다.</div>
              ) : (
                <>
                  <div className="flex-1 flex flex-col xl:min-h-0">
                    <div className="flex items-center gap-2 mb-3 shrink-0">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">할 일</span>
                      <span className="text-xs font-bold text-primary/70">{pendingTodos.length}</span>
                    </div>
                    <Droppable droppableId="ACTIVE">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex-1 xl:overflow-y-auto scrollbar-hide flex flex-col px-0.5 py-0.5"
                        >
                          {pendingTodos.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground text-sm font-medium">모두 완료했습니다!</div>
                          ) : (
                            pendingTodos.map((todo, index) => (
                              <CalendarTodoCard
                                key={todo.id}
                                todo={todo}
                                index={index}
                                onEdit={openEdit}
                                onToggle={handleToggle}
                                onDelete={handleDelete}
                              />
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>

                  <div className="flex-1 flex flex-col xl:min-h-0">
                    <div className="flex items-center gap-2 mb-3 shrink-0">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">완료됨</span>
                      <span className="text-xs font-bold text-primary/70">{completedTodos.length}</span>
                    </div>
                    <Droppable droppableId="COMPLETED">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex-1 xl:overflow-y-auto scrollbar-hide flex flex-col px-0.5 py-0.5"
                        >
                          {completedTodos.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground text-sm font-medium">완료된 일정이 없습니다.</div>
                          ) : (
                            completedTodos.map((todo, index) => (
                              <CalendarTodoCard
                                key={todo.id}
                                todo={todo}
                                index={index}
                                onEdit={openEdit}
                                onToggle={handleToggle}
                                onDelete={handleDelete}
                              />
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </>
              )}
            </div>
          </DragDropContext>
        </div>
      </div>

      <TodoFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        todo={editingTodo}
        defaultDueDate={selectedDate ? selectedDate.format("YYYY-MM-DD") : undefined}
      />
    </>
  )
}
