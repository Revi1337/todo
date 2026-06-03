"use client"

import { motion } from "framer-motion"
import { GripVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Todo } from "@/types"
import { PRIORITY_META } from "@/constants/priority"

interface PlannerPoolCardProps {
  todo: Todo
  onEdit: (todo: Todo) => void
}

export function PlannerPoolCard({ todo, onEdit }: PlannerPoolCardProps) {
  const eventData = JSON.stringify({
    title: todo.title,
    duration: "00:30",
    extendedProps: { todoId: todo.id },
  })

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as Element
    if (!target.closest("[data-drag-handle]")) {
      e.stopPropagation()
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -16, scale: 0.97 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="fc-pool-item group bg-card text-card-foreground px-3 py-3 rounded-xl shadow-sm border border-border/80 flex items-center gap-3 mb-2 hover:ring-2 hover:ring-primary transition-[box-shadow]"
      data-event={eventData}
      onPointerDown={handlePointerDown}
      onClick={() => onEdit(todo)}
    >
      <div
        data-drag-handle
        className="shrink-0 cursor-grab text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
        onClick={e => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <span className={`flex-1 font-medium leading-tight truncate ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
        {todo.title}
      </span>

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
    </motion.div>
  )
}
