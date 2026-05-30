"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { Todo } from "@/types"
import { PRIORITY_META } from "@/constants/priority"

interface CalendarTodoCardProps {
  todo: Todo
  onEdit: (todo: Todo) => void
  onToggle: (todo: Todo) => void
}

export function CalendarTodoCard({ todo, onEdit, onToggle }: CalendarTodoCardProps) {
  return (
    <div
      onClick={() => onEdit(todo)}
      className="bg-card px-4 py-3 rounded-xl shadow-sm border border-border/50 flex items-center gap-3 cursor-pointer transition-[box-shadow,opacity] duration-200 hover:ring-2 hover:ring-primary"
    >
      <div
        onPointerDown={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
        className="shrink-0"
      >
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo)}
          className="w-5 h-5 rounded-[4px]"
        />
      </div>
      <span className={`flex-1 font-medium leading-tight truncate ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
        {todo.title}
      </span>
      <Badge variant="outline" className="text-xs bg-background/50 rounded-full font-semibold shrink-0">
        <Clock className="w-3 h-3 mr-1" />
        {PRIORITY_META[todo.priority].label}
      </Badge>
    </div>
  )
}
