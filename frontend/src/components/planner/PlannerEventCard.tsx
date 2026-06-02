"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScheduledTodo } from "@/hooks/usePlannerTodos"
import { Todo } from "@/types"
import { timeToOffsetPx, durationMinutes, formatTime, HOUR_HEIGHT_PX } from "@/lib/planner"
import { PRIORITY_META } from "@/constants/priority"

interface PlannerEventCardProps {
  todo: ScheduledTodo
  onEdit: (todo: ScheduledTodo) => void
  onToggle: (todo: Todo) => void
}

export function PlannerEventCard({ todo, onEdit, onToggle }: PlannerEventCardProps) {
  const topPx = timeToOffsetPx(todo.startTime)
  const heightPx = Math.max((durationMinutes(todo.startTime, todo.endTime) / 60) * HOUR_HEIGHT_PX, 30)
  const categoryColor = todo.category?.color ?? "var(--primary)"

  return (
    <div
      className="absolute right-2 rounded-lg border-l-4 bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden z-10 cursor-pointer"
      style={{ top: topPx, height: heightPx, left: "3.75rem", borderLeftColor: categoryColor }}
      onClick={() => onEdit(todo)}
    >
      <div className="px-3 h-full flex items-center gap-3">
        {/* 완료 체크박스 */}
        <div
          onPointerDown={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onToggle(todo) }}
          className="shrink-0 flex items-center"
        >
          <Checkbox checked={todo.completed} className="w-5 h-5 rounded-[4px]" />
        </div>

        {/* 제목 */}
        <span className={`flex-1 font-medium leading-tight truncate ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
          {todo.title}
        </span>

        {/* 시간 범위 */}
        <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
          {formatTime(todo.startTime)}–{formatTime(todo.endTime)}
        </span>

        {/* 태그 · 카테고리 · 우선순위 */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {todo.tags?.length > 0 && (
            <div className="hidden sm:flex items-center gap-1">
              {todo.tags.map(tag => (
                <span key={tag.id} className="text-[10px] font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border/50">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
          {todo.category && (
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: todo.category.color }} />
              {todo.category.name}
            </div>
          )}
          <Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_META[todo.priority].badgeColor}`}>
            {PRIORITY_META[todo.priority].label}
          </Badge>
        </div>
      </div>
    </div>
  )
}
