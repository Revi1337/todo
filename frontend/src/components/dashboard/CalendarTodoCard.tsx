"use client"

import { Todo } from "@/types"
import { BaseTodoCard } from "./BaseTodoCard"

interface CalendarTodoCardProps {
  todo: Todo
  index: number
  onEdit: (todo: Todo) => void
  onToggle: (todo: Todo) => void
  isToggling?: boolean
}

export function CalendarTodoCard({ todo, index, onEdit, onToggle, isToggling }: CalendarTodoCardProps) {
  return (
    <BaseTodoCard
      todo={todo}
      index={index}
      onEdit={onEdit}
      onToggle={onToggle}
      isToggling={isToggling}
      compact
    />
  )
}
