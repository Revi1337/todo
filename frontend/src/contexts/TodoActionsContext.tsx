"use client"

import { createContext, useContext } from "react"
import { Todo } from "@/types"

interface TodoActionsContextValue {
  onToggle: (todo: Todo) => void
  onEdit: (todo: Todo) => void
  togglingIds: Set<number>
}

const TodoActionsContext = createContext<TodoActionsContextValue | null>(null)

export function TodoActionsProvider({
  children,
  onToggle,
  onEdit,
  togglingIds,
}: TodoActionsContextValue & { children: React.ReactNode }) {
  return (
    <TodoActionsContext.Provider value={{ onToggle, onEdit, togglingIds }}>
      {children}
    </TodoActionsContext.Provider>
  )
}

export function useTodoActions() {
  const ctx = useContext(TodoActionsContext)
  if (!ctx) throw new Error("useTodoActions must be used within TodoActionsProvider")
  return ctx
}
