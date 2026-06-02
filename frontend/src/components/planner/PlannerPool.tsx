"use client"

import { Droppable } from "@hello-pangea/dnd"
import { Ban, CalendarClock, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { Todo } from "@/types"
import { PlannerPoolCard } from "./PlannerPoolCard"

interface PlannerPoolSectionProps {
  id: "POOL_ACTIVE" | "POOL_COMPLETED"
  title: string
  todos: Todo[]
  draggingFromId: string | null
  onEdit: (todo: Todo) => void
}

function PlannerPoolSection({ id, title, todos, draggingFromId, onEdit }: PlannerPoolSectionProps) {
  const oppositeId = id === "POOL_ACTIVE" ? "POOL_COMPLETED" : "POOL_ACTIVE"

  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => {
        const showBlocked = draggingFromId === oppositeId && snapshot.isDraggingOver
        return (
          <div className={`relative flex-1 min-h-0 flex flex-col rounded-xl border transition-all duration-200 overflow-hidden ${showBlocked ? "border-red-500/40" : "border-border/50"}`}>
            {/* 차단 오버레이 */}
            {showBlocked && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl bg-background/60 backdrop-blur-[4px]">
                <Ban className="w-6 h-6 text-red-400" />
                <span className="text-xs font-bold text-red-400">체크박스로 처리하세요</span>
              </div>
            )}

            {/* 섹션 헤더 */}
            <div className="flex items-center gap-2 px-3 pt-3 pb-2 shrink-0">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
              <Badge variant="secondary" className="rounded-full text-[10px] h-4 px-1.5 bg-background/80">
                {todos.length}
              </Badge>
            </div>

            {/* 드롭 영역 — flex-1로 남은 높이 채우고 내용 넘치면 스크롤 */}
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 overflow-y-auto scrollbar-hide flex flex-col px-2 pt-1.5 pb-2 min-h-[52px] transition-colors ${snapshot.isDraggingOver && !showBlocked && draggingFromId !== id ? "bg-primary/5" : ""}`}
            >
              {todos.length === 0 && !snapshot.isDraggingOver ? (
                <div className="flex items-center justify-center py-3 text-muted-foreground/40">
                  <CalendarClock className="w-4 h-4 mr-1.5" />
                  <span className="text-xs">{id === "POOL_ACTIVE" ? "할 일이 없습니다" : "완료된 항목 없음"}</span>
                </div>
              ) : (
                todos.map((todo, index) => (
                  <PlannerPoolCard key={todo.id} todo={todo} index={index} onEdit={onEdit} />
                ))
              )}
              {provided.placeholder}
            </div>
          </div>
        )
      }}
    </Droppable>
  )
}

interface PlannerPoolProps {
  activeTodos: Todo[]
  completedTodos: Todo[]
  totalCount: number
  isLoading: boolean
  draggingFromId: string | null
  onEdit: (todo: Todo) => void
  onCreateTodo: () => void
  className?: string
}

export function PlannerPool({
  activeTodos,
  completedTodos,
  totalCount,
  isLoading,
  draggingFromId,
  onEdit,
  onCreateTodo,
  className = "flex-[4]",
}: PlannerPoolProps) {
  return (
    <div className={`${className} bg-muted/20 rounded-card border border-border/50 flex flex-col min-h-0 h-full overflow-hidden`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold tracking-tight">태스크 풀</h3>
          {totalCount > 0 && (
            <span className="px-2 h-5 flex items-center bg-primary/10 text-primary text-[10px] font-bold rounded-full border border-primary/20">
              {totalCount} TASKS
            </span>
          )}
        </div>
        <Button size="icon" variant="ghost" className="w-7 h-7 rounded-full" onClick={onCreateTodo}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-hidden px-3 pb-3 flex flex-col gap-3">
          <PlannerPoolSection
            id="POOL_ACTIVE"
            title="할 일"
            todos={activeTodos}
            draggingFromId={draggingFromId}
            onEdit={onEdit}
          />
          <PlannerPoolSection
            id="POOL_COMPLETED"
            title="완료됨"
            todos={completedTodos}
            draggingFromId={draggingFromId}
            onEdit={onEdit}
          />
        </div>
      )}
    </div>
  )
}
