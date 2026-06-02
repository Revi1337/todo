"use client"

import { Droppable } from "@hello-pangea/dnd"
import { CalendarClock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { Todo } from "@/types"
import { PlannerPoolCard } from "./PlannerPoolCard"

interface PlannerPoolProps {
  unscheduledTodos: Todo[]
  totalCount: number
  isLoading: boolean
  onEdit: (todo: Todo) => void
  onCreateTodo: () => void
  className?: string
}

export function PlannerPool({ unscheduledTodos, totalCount, isLoading, onEdit, onCreateTodo, className = "flex-[4]" }: PlannerPoolProps) {
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

      {/* 드롭 영역 */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <Droppable droppableId="POOL">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 overflow-y-auto scrollbar-hide px-3 pt-1.5 pb-3 flex flex-col gap-2 min-h-[60px] rounded-b-card transition-all
                ${snapshot.isDraggingOver ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : ""}
              `}
            >
              {unscheduledTodos.length === 0 && !snapshot.isDraggingOver ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground/50 py-10">
                  <CalendarClock className="w-8 h-8" />
                  <p className="text-xs font-medium leading-relaxed">
                    새로운 태스크를 이곳에<br />드래그하거나 만드세요
                  </p>
                </div>
              ) : (
                unscheduledTodos.map((todo, index) => (
                  <PlannerPoolCard key={todo.id} todo={todo} index={index} onEdit={onEdit} />
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
    </div>
  )
}
