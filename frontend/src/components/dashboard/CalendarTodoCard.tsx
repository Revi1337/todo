"use client"

import { Todo } from "@/types"
import { BaseTodoCard } from "./BaseTodoCard"

interface CalendarTodoCardProps {
  todo: Todo
  index: number
  onEdit: (todo: Todo) => void
  onToggle: (todo: Todo) => void
  onDelete: (id: number) => void
}

export function CalendarTodoCard({ todo, index, onEdit, onToggle, onDelete }: CalendarTodoCardProps) {
  return (
    <BaseTodoCard
      todo={todo}
      index={index}
      onEdit={onEdit}
      onToggle={onToggle}
      onDelete={onDelete}
      compact
    />
  )
}
