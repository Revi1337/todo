"use client"

import { Todo } from "@/types"
import { useTodoActions } from "@/contexts"
import { BaseTodoCard } from "./BaseTodoCard"

interface TodoCardProps {
  todo: Todo
  index: number
}

export function TodoCard({ todo, index }: TodoCardProps) {
  const { onToggle, onEdit, togglingIds } = useTodoActions()
  return (
    <BaseTodoCard
      todo={todo}
      index={index}
      onToggle={onToggle}
      onEdit={onEdit}
      isToggling={togglingIds.has(todo.id)}
    />
  )
}
