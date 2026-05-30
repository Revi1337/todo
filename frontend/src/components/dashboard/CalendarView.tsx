"use client"

import { useState } from "react"
import dayjs from "dayjs"
import { useTodos } from "@/hooks/useTodos"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react"
import { Todo } from "@/types"
import { TodoFormDialog } from "./TodoFormDialog"

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"]

const PRIORITY_CONFIG = {
  HIGH:   { color: "bg-red-500",   label: "긴급" },
  MEDIUM: { color: "bg-amber-500", label: "보통" },
  LOW:    { color: "bg-slate-400", label: "낮음" },
} as const

type Priority = keyof typeof PRIORITY_CONFIG

function buildCalendarDays(date: dayjs.Dayjs): (number | null)[] {
  const days: (number | null)[] = []
  for (let i = 0; i < date.startOf("month").day(); i++) days.push(null)
  for (let i = 1; i <= date.daysInMonth(); i++) days.push(i)
  return days
}

interface PriorityRowProps {
  priority: Priority
  total: number
  completed: number
}

function PriorityRow({ priority, total, completed }: PriorityRowProps) {
  if (total === 0) return null
  const { color } = PRIORITY_CONFIG[priority]
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className={`w-2.5 h-2.5 rounded-[2px] ${color}`} />
        <span className="text-[11px] font-medium text-muted-foreground">{total}</span>
      </div>
      {completed > 0 && (
        <div className="relative flex items-center gap-1.5 opacity-50 after:absolute after:top-1/2 after:left-[-2px] after:right-[-2px] after:h-[1px] after:bg-foreground/70 after:-translate-y-1/2">
          <span className={`w-2.5 h-2.5 rounded-[2px] ${color}`} />
          <span className="text-[11px] font-bold text-foreground">{completed}</span>
        </div>
      )}
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
      className={`min-h-[100px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 ${
        isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border/30 hover:border-primary/50"
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <span className={`text-xs font-semibold w-[22px] h-[22px] flex items-center justify-center rounded-full ${isToday ? "bg-primary text-primary-foreground" : ""}`}>
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

interface TodoCardProps {
  todo: Todo
  onEdit: (todo: Todo) => void
  onToggle: (todo: Todo) => void
}

function TodoCard({ todo, onEdit, onToggle }: TodoCardProps) {
  return (
    <div
      onClick={() => onEdit(todo)}
      className="bg-card p-4 rounded-2xl shadow-sm border border-border/50 flex flex-col gap-2 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div
          onPointerDown={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
        >
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => onToggle(todo)}
            className="mt-1 w-5 h-5 rounded-[4px]"
          />
        </div>
        <span className={`font-medium leading-tight ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
          {todo.title}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1 pl-8">
        <Badge variant="outline" className="text-xs bg-background/50 rounded-full font-semibold">
          <Clock className="w-3 h-3 mr-1" />
          {PRIORITY_CONFIG[todo.priority as Priority].label}
        </Badge>
      </div>
    </div>
  )
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  const { todos, toggleTodo, isLoading } = useTodos()

  const calendarDays = buildCalendarDays(currentDate)
  const selectedTodos = selectedDate
    ? todos.filter(t => dayjs(t.dueDate).isSame(selectedDate, "day"))
    : []

  const openCreate = () => { setEditingTodo(null); setDialogOpen(true) }
  const openEdit = (todo: Todo) => { setEditingTodo(todo); setDialogOpen(true) }

  if (isLoading) return <div className="p-8 flex justify-center text-muted-foreground">로딩 중...</div>

  return (
    <>
      <div className="flex gap-8 h-full items-start">
        {/* 캘린더 */}
        <div className="flex-1 bg-card rounded-[24px] p-6 shadow-sm border border-border/50 h-full flex flex-col min-h-0 overflow-hidden">
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

          <div className="grid grid-cols-7 gap-4 flex-1 overflow-y-auto p-1 scrollbar-hide min-h-0">
            {WEEK_DAYS.map(d => (
              <div key={d} className="text-center font-semibold text-muted-foreground mb-2">{d}</div>
            ))}
            {calendarDays.map((dateNum, i) => {
              if (dateNum === null) return <div key={i} className="min-h-[100px]" />
              const date = currentDate.date(dateNum)
              return (
                <CalendarCell
                  key={i}
                  dateNum={dateNum}
                  isToday={date.isSame(dayjs(), "day")}
                  isSelected={!!selectedDate?.isSame(date, "day")}
                  dayTodos={todos.filter(t => dayjs(t.dueDate).isSame(date, "day"))}
                  onClick={() => setSelectedDate(date)}
                />
              )
            })}
          </div>
        </div>

        {/* 날짜 상세 패널 */}
        <div className="w-80 shrink-0 bg-muted/20 rounded-[24px] p-6 shadow-sm border border-border/50 h-full overflow-y-auto scrollbar-hide">
          <div className="flex items-start justify-between mb-6">
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

          <Button onClick={openCreate} className="w-full justify-start gap-2 rounded-full mb-6" size="lg">
            <Plus className="w-5 h-5" /> 새 작업 추가
          </Button>

          <div className="flex flex-col gap-3">
            {selectedTodos.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm font-medium">일정이 없습니다.</div>
            ) : (
              selectedTodos.map(todo => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onEdit={openEdit}
                  onToggle={todo => toggleTodo(todo.id, !todo.completed)}
                />
              ))
            )}
          </div>
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
