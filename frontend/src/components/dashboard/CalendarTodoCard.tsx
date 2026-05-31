"use client"

import { Draggable } from "@hello-pangea/dnd"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Clock, Trash2 } from "lucide-react"
import { Todo } from "@/types"
import { PRIORITY_META } from "@/constants/priority"

interface CalendarTodoCardProps {
  todo: Todo
  index: number
  onEdit: (todo: Todo) => void
  onToggle: (todo: Todo) => void
  onDelete: (id: number) => void
}

export function CalendarTodoCard({ todo, index, onEdit, onToggle, onDelete }: CalendarTodoCardProps) {
  return (
    <Draggable draggableId={todo.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style, cursor: 'default' }}
          onClick={() => onEdit(todo)}
          className={`group bg-card px-4 py-3 rounded-xl shadow-sm border border-border/50 flex items-center gap-3 mb-3 transition-[box-shadow,opacity] duration-200 ${snapshot.isDragging ? "ring-2 ring-primary shadow-xl opacity-95" : "hover:ring-2 hover:ring-primary"}`}
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
          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={e => { e.stopPropagation(); onDelete(todo.id) }}
              className="p-1 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  )
}
