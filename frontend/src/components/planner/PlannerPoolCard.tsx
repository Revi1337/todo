"use client"

import { motion } from "framer-motion"
import { Todo } from "@/types"
import { TodoMetaBadges } from "@/components/dashboard/BaseTodoCard"

interface PlannerPoolCardProps {
  todo: Todo
  isScheduled?: boolean
  onEdit: (todo: Todo) => void
}

export function PlannerPoolCard({ todo, isScheduled = false, onEdit }: PlannerPoolCardProps) {
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
      <span className={`flex-1 font-medium leading-tight truncate ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
        {todo.title}
      </span>

      <TodoMetaBadges todo={todo} />
    </motion.div>
  )
}
