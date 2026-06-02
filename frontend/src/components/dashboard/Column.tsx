"use client"

import { Droppable } from "@hello-pangea/dnd"
import { Badge } from "@/components/ui/badge"
import { Ban } from "lucide-react"
import { Todo } from "@/types"
import { TodoCard } from "./TodoCard"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

interface ColumnProps {
  title: string
  id: string
  todos: Todo[]
  scrollable?: boolean
  draggingFromId?: string | null
  isLoading?: boolean
}

export function Column({ title, id, todos, scrollable, draggingFromId, isLoading }: ColumnProps) {
  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => {
        const showBlocked = (
          (id === "COMPLETED" && draggingFromId === "ACTIVE") ||
          (id === "ACTIVE" && draggingFromId === "COMPLETED")
        ) && snapshot.isDraggingOver
        return (
          <div className={`relative flex flex-col gap-4 bg-muted/40 rounded-card p-5 border h-full min-h-0 overflow-hidden transition-all duration-200 ${showBlocked ? "border-red-500/40" : "border-border/60"}`}>
            {showBlocked && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-card bg-background/60 backdrop-blur-[4px]">
                <Ban className="w-8 h-8 text-red-400" />
                <span className="text-sm font-bold text-red-400">체크박스로 처리하세요</span>
              </div>
            )}
            <div className="flex items-center justify-between px-1 shrink-0">
              <h3 className="font-semibold">{title}</h3>
              {!isLoading && <Badge variant="secondary" className="rounded-full bg-background/80">{todos.length}</Badge>}
            </div>

            <div className={`flex-1 min-h-0 p-1 -m-1 ${scrollable ? "overflow-y-auto scrollbar-hide" : "overflow-visible"}`}>
              <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col min-h-full pr-2">
                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center min-h-[150px]">
                    <LoadingSpinner />
                  </div>
                ) : todos.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/60 min-h-[150px] gap-2">
                    <span className="text-sm font-medium">
                      {id === "ACTIVE" ? "등록된 할 일이 없습니다!" : "아직 완료된 할 일이 없네요."}
                    </span>
                    {id === "ACTIVE" && <span className="text-xs">새로운 할 일을 추가해보세요.</span>}
                  </div>
                ) : (
                  todos.map((todo, index) => (
                    <TodoCard key={todo.id} todo={todo} index={index} />
                  ))
                )}
                {provided.placeholder}
              </div>
            </div>
          </div>
        )
      }}
    </Droppable>
  )
}
