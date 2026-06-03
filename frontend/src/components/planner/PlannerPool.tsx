"use client"

import { useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { Draggable } from "@fullcalendar/interaction"
import { CalendarClock, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { Todo } from "@/types"
import { PlannerPoolCard } from "./PlannerPoolCard"

interface PlannerPoolSectionProps {
  title: string
  todos: Todo[]
  isEmpty: boolean
  onEdit: (todo: Todo) => void
}

function PlannerPoolSection({ title, todos, isEmpty, onEdit }: PlannerPoolSectionProps) {
  return (
    <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-border/50 overflow-hidden">
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 shrink-0">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
        <Badge variant="secondary" className="rounded-full text-[10px] h-4 px-1.5 bg-background/80">
          {todos.length}
        </Badge>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col px-2 pt-1.5 pb-2 min-h-[52px]">
        {todos.length === 0 ? (
          <div className="flex items-center justify-center py-3 text-muted-foreground/40">
            <CalendarClock className="w-4 h-4 mr-1.5" />
            <span className="text-xs">{isEmpty ? "할 일이 없습니다" : "완료된 항목 없음"}</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {todos.map(todo => <PlannerPoolCard key={todo.id} todo={todo} onEdit={onEdit} />)}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

interface PlannerPoolProps {
  activeTodos: Todo[]
  completedTodos: Todo[]
  totalCount: number
  isLoading: boolean
  poolRef: React.RefObject<HTMLDivElement | null>
  onEdit: (todo: Todo) => void
  onCreateTodo: () => void
  className?: string
}

export function PlannerPool({
  activeTodos,
  completedTodos,
  totalCount,
  isLoading,
  poolRef,
  onEdit,
  onCreateTodo,
  className = "flex-[4]",
}: PlannerPoolProps) {
  // FullCalendar external Draggable 초기화 — 풀 카드(.fc-pool-item)를 캘린더로 드래그 가능하게
  useEffect(() => {
    const el = poolRef.current
    if (!el) return
    const draggable = new Draggable(el, { itemSelector: ".fc-pool-item" })
    return () => draggable.destroy()
  }, [poolRef])

  return (
    <div
      ref={poolRef}
      className={`${className} bg-muted/20 rounded-card border border-border/50 flex flex-col min-h-0 h-full overflow-hidden`}
    >
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
          <PlannerPoolSection title="할 일" todos={activeTodos} isEmpty onEdit={onEdit} />
          <PlannerPoolSection title="완료됨" todos={completedTodos} isEmpty={false} onEdit={onEdit} />
        </div>
      )}
    </div>
  )
}
