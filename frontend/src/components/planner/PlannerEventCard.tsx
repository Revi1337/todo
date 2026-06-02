"use client"

import { Draggable } from "@hello-pangea/dnd"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScheduledTodo } from "@/hooks/usePlannerTodos"
import { Todo } from "@/types"
import { timeToOffsetPx, durationMinutes, formatTime, HOUR_HEIGHT_PX } from "@/lib/planner"
import { PRIORITY_META } from "@/constants/priority"

interface PlannerEventCardProps {
  todo: ScheduledTodo
  index: number
  onEdit: (todo: ScheduledTodo) => void
  onToggle: (todo: Todo) => void
}

export function PlannerEventCard({ todo, index, onEdit, onToggle }: PlannerEventCardProps) {
  const topPx = timeToOffsetPx(todo.startTime)
  const heightPx = Math.max((durationMinutes(todo.startTime, todo.endTime) / 60) * HOUR_HEIGHT_PX, 30)
  const categoryColor = todo.category?.color ?? "var(--primary)"

  return (
    <Draggable draggableId={`sched-${todo.scheduleId}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            cursor: "default",
            height: heightPx,
            borderLeftColor: categoryColor,
            // drop 애니메이션 즉시 완료: isDropAnimating 중 DnD의 position:fixed + transform이
            // absolute 카드의 위치와 충돌해 카드가 흘러가는 현상을 방지
            ...(snapshot.isDropAnimating && { transitionDuration: "0.001s" }),
            // 정적 상태: absolute 위치 적용 + DnD 변위 transform 무효화
            // (DnD가 다른 카드에 translate 변위를 자동 적용하는데, absolute 카드에선 시각적으로 움직임)
            ...(!snapshot.isDragging && !snapshot.isDropAnimating && {
              position: "absolute" as const,
              top: topPx,
              left: "3.75rem",
              right: "0.5rem",
              zIndex: 1,
              transform: "none",
            }),
          }}
          className={`rounded-lg border-l-4 bg-card overflow-hidden transition-shadow
            ${snapshot.isDragging ? "shadow-xl ring-2 ring-primary/60 z-[9999]" : "shadow-sm hover:shadow-md"}`}
          onClick={() => { if (!snapshot.isDragging && !snapshot.isDropAnimating) onEdit(todo) }}
        >
          <div className="px-3 h-full flex items-center gap-3">
            <div
              onPointerDown={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onToggle(todo) }}
              className="shrink-0 flex items-center"
            >
              <Checkbox checked={todo.completed} className="w-5 h-5 rounded-[4px]" />
            </div>

            <span className={`flex-1 font-medium leading-tight truncate ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
              {todo.title}
            </span>

            <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
              {formatTime(todo.startTime)}–{formatTime(todo.endTime)}
            </span>

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
      )}
    </Draggable>
  )
}
