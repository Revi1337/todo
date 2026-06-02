"use client"

import { useMemo } from "react"
import type { Dayjs } from "dayjs"
import { DragDropContext, Droppable } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Ban, Plus } from "lucide-react"
import { Todo } from "@/types"
import { CalendarTodoCard } from "./CalendarTodoCard"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

interface CalendarDetailProps {
  selectedDate: Dayjs | null
  selectedTodos: Todo[]
  isLoading: boolean
  togglingIds: Set<number>
  draggingFromId: string | null
  onCreateTodo: () => void
  onEdit: (todo: Todo) => void
  onToggle: (todo: Todo) => void
  onDragStart: (start: import("@hello-pangea/dnd").DragStart) => void
  onDragEnd: (result: import("@hello-pangea/dnd").DropResult) => void
}

export function CalendarDetail({
  selectedDate,
  selectedTodos,
  isLoading,
  togglingIds,
  draggingFromId,
  onCreateTodo,
  onEdit,
  onToggle,
  onDragStart,
  onDragEnd,
}: CalendarDetailProps) {
  const pendingTodos = useMemo(() => selectedTodos.filter(t => !t.completed), [selectedTodos])
  const completedTodos = useMemo(() => selectedTodos.filter(t => t.completed), [selectedTodos])

  return (
    <div className="w-full xl:flex-[1] bg-muted/20 rounded-card p-6 shadow-sm border border-border/50 xl:h-full flex flex-col xl:min-h-0">
      <div className="flex items-start justify-between mb-6 shrink-0">
        <div>
          <h3 className="text-lg font-bold mb-1 tracking-tight">
            {selectedDate ? selectedDate.format("MM월 DD일 일정") : "날짜를 선택하세요"}
          </h3>
          <p className={`text-sm text-muted-foreground font-medium ${isLoading ? 'invisible' : ''}`}>총 {selectedTodos.length}개의 일정</p>
        </div>
        {selectedTodos.length > 0 && (
          <span className="px-2 h-6 flex items-center justify-center bg-muted/80 text-muted-foreground text-xs font-bold rounded-full gap-0.5 border border-border/50 shrink-0 mt-1">
            <span className="text-primary/80">{selectedTodos.length}</span>
            <span className="opacity-40 px-0.5">/</span>
            <span>{selectedTodos.filter(t => t.completed).length}</span>
          </span>
        )}
      </div>

      <Button onClick={onCreateTodo} className="w-full justify-start gap-2 rounded-full mb-6 shrink-0" size="lg">
        <Plus className="w-5 h-5" /> 새 작업 추가
      </Button>

      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex flex-col gap-4 xl:flex-1 xl:min-h-0 xl:overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : selectedTodos.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm font-medium">일정이 없습니다.</div>
          ) : (
            <>
              <div className="flex-1 flex flex-col xl:min-h-0">
                <div className="flex items-center gap-2 mb-3 shrink-0">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">할 일</span>
                  <span className="text-xs font-bold text-primary/70">{pendingTodos.length}</span>
                </div>
                <Droppable droppableId="ACTIVE">
                  {(provided, snapshot) => {
                    const showBlocked = draggingFromId === "COMPLETED" && snapshot.isDraggingOver
                    return (
                      <div className={`relative flex-1 flex flex-col xl:min-h-0 rounded-lg border transition-all duration-200 ${showBlocked ? "border-red-500/40" : "border-transparent"}`}>
                        {showBlocked && (
                          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/60 backdrop-blur-[4px]">
                            <Ban className="w-6 h-6 text-red-400" />
                            <span className="text-xs font-bold text-red-400">체크박스로 처리하세요</span>
                          </div>
                        )}
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex-1 xl:overflow-y-auto scrollbar-hide flex flex-col px-0.5 py-0.5"
                        >
                          {pendingTodos.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground text-sm font-medium">모두 완료했습니다!</div>
                          ) : (
                            pendingTodos.map((todo, index) => (
                              <CalendarTodoCard
                                key={todo.id}
                                todo={todo}
                                index={index}
                                onEdit={onEdit}
                                onToggle={onToggle}
                                isToggling={togglingIds.has(todo.id)}
                              />
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      </div>
                    )
                  }}
                </Droppable>
              </div>

              <div className="flex-1 flex flex-col xl:min-h-0">
                <div className="flex items-center gap-2 mb-3 shrink-0">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">완료됨</span>
                  <span className="text-xs font-bold text-primary/70">{completedTodos.length}</span>
                </div>
                <Droppable droppableId="COMPLETED">
                  {(provided, snapshot) => {
                    const showBlocked = draggingFromId === "ACTIVE" && snapshot.isDraggingOver
                    return (
                      <div className={`relative flex-1 flex flex-col xl:min-h-0 rounded-lg border transition-all duration-200 ${showBlocked ? "border-red-500/40" : "border-transparent"}`}>
                        {showBlocked && (
                          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/60 backdrop-blur-[4px]">
                            <Ban className="w-6 h-6 text-red-400" />
                            <span className="text-xs font-bold text-red-400">체크박스로 처리하세요</span>
                          </div>
                        )}
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex-1 xl:overflow-y-auto scrollbar-hide flex flex-col px-0.5 py-0.5"
                        >
                          {completedTodos.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground text-sm font-medium">완료된 일정이 없습니다.</div>
                          ) : (
                            completedTodos.map((todo, index) => (
                              <CalendarTodoCard
                                key={todo.id}
                                todo={todo}
                                index={index}
                                onEdit={onEdit}
                                onToggle={onToggle}
                                isToggling={togglingIds.has(todo.id)}
                              />
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      </div>
                    )
                  }}
                </Droppable>
              </div>
            </>
          )}
        </div>
      </DragDropContext>
    </div>
  )
}
