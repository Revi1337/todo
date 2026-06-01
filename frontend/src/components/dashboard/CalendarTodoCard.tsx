"use client"

import { Todo } from "@/types"
import { BaseTodoCard } from "./BaseTodoCard"

interface CalendarTodoCardProps {
  todo: Todo
  index: number
  onEdit: (todo: Todo) => void
  onToggle: (todo: Todo) => void
  onDelete: (id: number) => void
  isToggling?: boolean
}

export function CalendarTodoCard({ todo, index, onEdit, onToggle, onDelete, isToggling }: CalendarTodoCardProps) {
  return (
    <BaseTodoCard
      todo={todo}
      index={index}
      onEdit={onEdit}
      onToggle={onToggle}
      onDelete={onDelete}
      isToggling={isToggling}
      compact
    />
  )
}
