"use client"

import { Draggable } from "@hello-pangea/dnd"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Clock, Trash2 } from "lucide-react"
import dayjs from "dayjs"
import { Todo } from "@/types"
import { PRIORITY_META } from "@/constants/priority"

interface BaseTodoCardProps {
  todo: Todo
  index: number
  onEdit: (todo: Todo) => void
  onToggle: (todo: Todo) => void
  onDelete: (id: number) => void
  compact?: boolean
}

export function BaseTodoCard({ todo, index, onEdit, onToggle, onDelete, compact = false }: BaseTodoCardProps) {
  return (
    <Draggable draggableId={todo.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style, cursor: 'default' }}
          onClick={() => onEdit(todo)}
          className={`group bg-card text-card-foreground px-3 py-3 rounded-xl shadow-sm border border-border/80 flex items-center gap-3 mb-2 transition-[box-shadow,opacity] duration-200 ${snapshot.isDragging ? "ring-2 ring-primary shadow-xl opacity-95" : "hover:ring-2 hover:ring-primary"}`}
        >
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 flex items-center"
          >
            <Checkbox checked={todo.completed} onCheckedChange={() => onToggle(todo)} className="w-5 h-5 rounded-[4px]" />
          </div>

          <span className={`flex-1 font-medium leading-tight truncate ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
            {todo.title}
          </span>

          {compact ? (
            <Badge variant="outline" className="text-xs bg-background/50 rounded-full font-semibold shrink-0">
              <Clock className="w-3 h-3 mr-1" />
              {PRIORITY_META[todo.priority].label}
            </Badge>
          ) : (
            <div className="flex items-center gap-2 shrink-0 ml-auto">
              {todo.tags?.length > 0 && (
                <div className="flex items-center gap-1">
                  {todo.tags.map(tag => (
                    <span key={tag.id} className="text-[10px] font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border/50">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}
              {todo.category && (
                <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: todo.category.color }} />
                  {todo.category.name}
                </div>
              )}
              {todo.dueDate && (
                <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[10px] text-muted-foreground bg-background/50 border-border/50 gap-1 flex items-center">
                  <Clock className="w-3 h-3" />
                  {dayjs(todo.dueDate).format("MM.DD")}
                </Badge>
              )}
              <Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_META[todo.priority].badgeColor}`}>
                {PRIORITY_META[todo.priority].label}
              </Badge>
            </div>
          )}

          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
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
