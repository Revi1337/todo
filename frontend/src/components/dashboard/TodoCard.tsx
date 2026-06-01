"use client"

import { Todo } from "@/types"
import { useTodoActions } from "@/contexts"
import { BaseTodoCard } from "./BaseTodoCard"

interface TodoCardProps {
  todo: Todo
  index: number
}

export function TodoCard({ todo, index }: TodoCardProps) {
  const { onToggle, onEdit, onDelete, togglingIds } = useTodoActions()
  return (
    <BaseTodoCard
      todo={todo}
      index={index}
      onToggle={onToggle}
      onEdit={onEdit}
      onDelete={onDelete}
      isToggling={togglingIds.has(todo.id)}
    />
  )
}
