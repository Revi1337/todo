"use client"

import { Droppable } from "@hello-pangea/dnd"
import { HOURS, HOUR_HEIGHT_PX } from "@/lib/planner"
import { ScheduledTodo } from "@/hooks/usePlannerTodos"
import { Todo } from "@/types"
import { PlannerEventCard } from "./PlannerEventCard"

interface PlannerTimeGridProps {
  scheduledTodos: ScheduledTodo[]
  isLoading: boolean
  gridRef: React.MutableRefObject<HTMLDivElement | null>
  scrollRef: React.MutableRefObject<HTMLDivElement | null>
  onEdit: (todo: ScheduledTodo) => void
  onToggle: (todo: Todo) => void
}

export function PlannerTimeGrid({
  scheduledTodos,
  isLoading,
  gridRef,
  scrollRef,
  onEdit,
  onToggle,
}: PlannerTimeGridProps) {
  const totalHeight = HOURS.length * HOUR_HEIGHT_PX

  return (
    <div className="flex-[7] bg-card rounded-card border border-border/50 flex flex-col min-h-0 h-full overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-3 shrink-0 border-b border-border/30">
        <h3 className="text-sm font-bold tracking-tight">오늘의 일정</h3>
      </div>

      {/* 스크롤 컨테이너 — scrollRef 바인딩 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
        <Droppable droppableId="TIMEGRID">
          {(provided, snapshot) => (
            /*
             * provided.innerRef와 gridRef를 동일 요소에 바인딩.
             * - provided.innerRef: DnD가 이 요소의 bounding rect로 hover 감지
             * - gridRef: onDragEnd에서 getBoundingClientRect().top 계산에 사용
             * placeholder는 고정 높이 그리드이므로 display:none으로 레이아웃 영향 제거
             */
            <div
              ref={(el) => {
                provided.innerRef(el)
                gridRef.current = el
              }}
              {...provided.droppableProps}
              className={`relative transition-colors ${snapshot.isDraggingOver ? "bg-primary/[0.02]" : ""}`}
              style={{ height: totalHeight }}
            >
              {/* 시간 줄 (배경) */}
              {HOURS.map((hour, i) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 flex border-b border-border/20"
                  style={{ top: i * HOUR_HEIGHT_PX, height: HOUR_HEIGHT_PX }}
                >
                  <span className="w-14 shrink-0 text-[10px] text-muted-foreground/60 px-2 pt-1 select-none tabular-nums">
                    {String(hour).padStart(2, "0")}:00
                  </span>
                  <div className="flex-1 border-l border-border/20" />
                </div>
              ))}

              {/* 이벤트 카드 (절대위치, 시간 줄 위 레이어) */}
              {!isLoading && scheduledTodos.map(todo => (
                <PlannerEventCard
                  key={todo.id}
                  todo={todo}
                  onEdit={onEdit}
                  onToggle={onToggle}
                />
              ))}

              {/* placeholder — 고정 높이 그리드이므로 레이아웃 영향 제거 */}
              <div style={{ display: "none" }}>{provided.placeholder}</div>
            </div>
          )}
        </Droppable>
      </div>
    </div>
  )
}
