"use client"

import { CheckCircle2, Circle } from "lucide-react"
import { ScheduledTodo } from "@/hooks/usePlannerTodos"
import { Todo } from "@/types"
import { timeToOffsetPx, durationMinutes, formatTime, HOUR_HEIGHT_PX } from "@/lib/planner"

interface PlannerEventCardProps {
  todo: ScheduledTodo
  onEdit: (todo: ScheduledTodo) => void
  onToggle: (todo: Todo) => void
}

export function PlannerEventCard({ todo, onEdit, onToggle }: PlannerEventCardProps) {
  const topPx = timeToOffsetPx(todo.startTime)
  const durationPx = Math.max(durationMinutes(todo.startTime, todo.endTime), 30)
  // 높이는 분 수와 px/시간 비율로 계산 (60분 = HOUR_HEIGHT_PX)
  const heightPx = Math.max((durationPx / 60) * HOUR_HEIGHT_PX, 30)
  const categoryColor = todo.category?.color ?? "var(--primary)"

  return (
    <div
      className="absolute right-2 rounded-lg border-l-4 bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden z-10 cursor-pointer group"
      style={{
        top: topPx,
        height: heightPx,
        left: "3.75rem",
        borderLeftColor: categoryColor,
      }}
      onClick={() => onEdit(todo)}
    >
      <div className="px-2.5 py-1.5 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between gap-1">
          <p className={`text-xs font-semibold leading-tight line-clamp-2 flex-1 ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
            {todo.title}
          </p>
          <button
            className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={e => { e.stopPropagation(); onToggle(todo) }}
          >
            {todo.completed
              ? <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              : <Circle className="w-3.5 h-3.5 text-muted-foreground" />
            }
          </button>
        </div>
        {heightPx >= 44 && (
          <p className="text-[10px] text-muted-foreground">
            {formatTime(todo.startTime)} – {formatTime(todo.endTime)}
          </p>
        )}
      </div>
    </div>
  )
}
