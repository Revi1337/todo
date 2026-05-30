"use client"

import { createContext, useContext } from "react"
import { Todo } from "@/types"

interface TodoActionsContextValue {
  onToggle: (id: number) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: number) => void
}

const TodoActionsContext = createContext<TodoActionsContextValue | null>(null)

export function TodoActionsProvider({
  children,
  onToggle,
  onEdit,
  onDelete,
}: TodoActionsContextValue & { children: React.ReactNode }) {
  return (
    <TodoActionsContext.Provider value={{ onToggle, onEdit, onDelete }}>
      {children}
    </TodoActionsContext.Provider>
  )
}

export function useTodoActions() {
  const ctx = useContext(TodoActionsContext)
  if (!ctx) throw new Error("useTodoActions must be used within TodoActionsProvider")
  return ctx
}
