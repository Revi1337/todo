"use client"

import { useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { Draggable } from "@fullcalendar/interaction"
import { CalendarClock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { Todo } from "@/types"
import { PlannerPoolCard } from "./PlannerPoolCard"

interface PlannerPoolProps {
  todos: Todo[]
  scheduledMap: Map<number, { startTime: string; endTime: string }>
  totalCount: number
  isLoading: boolean
  poolRef: React.RefObject<HTMLDivElement | null>
  onEdit: (todo: Todo) => void
  onCreateTodo: () => void
  disableDnd?: boolean
  className?: string
}

export function PlannerPool({
  todos,
  scheduledMap,
  totalCount,
  isLoading,
  poolRef,
  onEdit,
  onCreateTodo,
  disableDnd = false,
  className = "flex-[4]",
}: PlannerPoolProps) {
  useEffect(() => {
    if (disableDnd) return
    const el = poolRef.current
    if (!el) return
    const draggable = new Draggable(el, { itemSelector: ".fc-pool-item" })
    return () => draggable.destroy()
  }, [poolRef, disableDnd])

  return (
    <div
      ref={poolRef}
      className={`group/pool ${className} bg-muted/20 rounded-card border border-border/50 flex flex-col min-h-0 overflow-hidden`}
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
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-3 pb-3 pt-1">
          {todos.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground/40">
              <CalendarClock className="w-4 h-4 mr-1.5" />
              <span className="text-xs">할 일이 없습니다</span>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {todos.map(todo => (
                <PlannerPoolCard
                  key={todo.id}
                  todo={todo}
                  scheduledTime={scheduledMap.get(todo.id)}
                  onEdit={onEdit}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  )
}
