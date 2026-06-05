"use client"

import { motion } from "framer-motion"
import { Clock } from "lucide-react"
import { Todo } from "@/types"
import { TodoMetaBadges } from "@/components/dashboard/BaseTodoCard"

interface PlannerPoolCardProps {
  todo: Todo
  scheduledTime?: { startTime: string; endTime: string }
  onEdit: (todo: Todo) => void
}

function fmtTime(t: string) {
  return t.slice(0, 5)
}

export function PlannerPoolCard({ todo, scheduledTime, onEdit }: PlannerPoolCardProps) {
  const isScheduled = !!scheduledTime
  const eventData = JSON.stringify({
    title: todo.title,
    duration: "00:30",
    extendedProps: { todoId: todo.id },
  })

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -16, scale: 0.97 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`fc-pool-item group bg-card text-card-foreground px-3 py-3 rounded-xl shadow-sm flex items-center gap-3 mb-2 cursor-grab ${
        isScheduled
          ? "border-2 border-primary/50"
          : "border border-border/80"
      }`}
      data-event={eventData}
      onClick={() => onEdit(todo)}
    >
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className={`font-medium leading-tight truncate ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
          {todo.title}
        </span>
        {scheduledTime && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary/80 leading-none">
            <Clock className="w-2.5 h-2.5 shrink-0" />
            {fmtTime(scheduledTime.startTime)} ~ {fmtTime(scheduledTime.endTime)}
          </span>
        )}
      </div>

      <TodoMetaBadges todo={todo} />
    </motion.div>
  )
}
