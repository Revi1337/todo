"use client"

import { Draggable } from "@hello-pangea/dnd"
import { GripVertical } from "lucide-react"
import { Todo } from "@/types"

interface PlannerPoolCardProps {
  todo: Todo
  index: number
  onEdit: (todo: Todo) => void
}

export function PlannerPoolCard({ todo, index, onEdit }: PlannerPoolCardProps) {
  return (
    <Draggable draggableId={todo.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(todo)}
          className={`bg-card border rounded-xl px-3 py-2.5 flex items-center gap-2.5 transition-all cursor-grab active:cursor-grabbing select-none
            ${snapshot.isDragging
              ? "shadow-xl ring-2 ring-primary/60 opacity-90 border-primary/30"
              : "border-border/80 hover:ring-1 hover:ring-primary/40 hover:border-primary/30"
            }
            ${todo.completed ? "opacity-60" : ""}
          `}
        >
          {todo.category && (
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: todo.category.color }}
            />
          )}
          <span className={`flex-1 text-xs font-medium truncate ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
            {todo.title}
          </span>
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
        </div>
      )}
    </Draggable>
  )
}
