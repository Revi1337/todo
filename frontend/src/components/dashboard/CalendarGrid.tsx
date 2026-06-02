"use client"

import dayjs from "dayjs"
import type { Dayjs } from "dayjs"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Todo, Priority } from "@/types"
import { PRIORITY_META } from "@/constants/priority"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"]

export function buildCalendarDays(date: Dayjs): (number | null)[] {
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
        <span className={`text-xs font-bold w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] flex items-center justify-center rounded-full ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
          {dateNum}
        </span>
        {dayTodos.length > 0 && (
          <span className="hidden sm:flex px-1.5 h-5 items-center justify-center bg-muted/80 text-muted-foreground text-[10px] font-bold rounded-full gap-0.5">
            <span className="text-primary/80">{dayTodos.length}</span>
            <span className="opacity-40">/</span>
            <span>{dayTodos.filter(t => t.completed).length}</span>
          </span>
        )}
      </div>
      {dayTodos.length > 0 && (
        <div className="hidden sm:flex flex-col gap-1 mt-1 px-1">
          {priorityRows.map(({ priority, total, completed }) => (
            <PriorityRow key={priority} priority={priority} total={total} completed={completed} />
          ))}
        </div>
      )}
      {dayTodos.length > 0 && (
        <div className="flex sm:hidden flex-wrap gap-[3px] mt-0.5 px-0.5">
          {priorityRows.filter(r => r.total > 0).map(({ priority }) => (
            <span
              key={priority}
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_META[priority].dotColor}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CalendarGridProps {
  currentDate: Dayjs
  selectedDate: Dayjs | null
  localTodos: Todo[]
  isLoading: boolean
  onSelectDate: (date: Dayjs) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

export function CalendarGrid({
  currentDate,
  selectedDate,
  localTodos,
  isLoading,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: CalendarGridProps) {
  const calendarDays = buildCalendarDays(currentDate)

  return (
    <div className="bg-card rounded-card p-6 shadow-sm border border-border/50 xl:flex-[2] xl:h-full flex flex-col xl:min-h-0 xl:overflow-hidden">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="text-2xl font-bold tracking-tight">{currentDate.format("YYYY년 MM월")}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={onPrevMonth} className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={onNextMonth} className="rounded-full">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="relative grid grid-cols-7 min-h-[360px] xl:flex-1 xl:min-h-0 border-t border-l border-border/40 rounded-lg overflow-hidden grid-rows-[auto_repeat(6,minmax(0,1fr))]">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[2px] rounded-lg">
            <LoadingSpinner />
          </div>
        )}
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
              onClick={() => onSelectDate(date)}
            />
          )
        })}
      </div>
    </div>
  )
}
