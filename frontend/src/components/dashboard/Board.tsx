"use client"

import React, { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useTodos } from "@/hooks/useTodos"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Calendar as CalendarIcon, Clock } from "lucide-react"
import dayjs from "dayjs"
import { Todo } from "@/types"

const priorityColors = {
  HIGH: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20",
  MEDIUM: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20",
  LOW: "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 border-slate-500/20"
}

export function Board() {
  const { todos: swrTodos, toggleTodo, updateTodo, isLoading } = useTodos()
  const [localTodos, setLocalTodos] = useState<Todo[]>([])
  const [search, setSearch] = useState("")

  React.useEffect(() => {
    if (swrTodos) setLocalTodos(swrTodos)
  }, [swrTodos])

  const activeTodos = localTodos.filter(t => !t.completed && t.title.toLowerCase().includes(search.toLowerCase()))
  const completedTodos = localTodos.filter(t => t.completed && t.title.toLowerCase().includes(search.toLowerCase()))

  const onDragEnd = async (result: any) => {
    if (!result.destination) return
    const { source, destination, draggableId } = result

    if (source.droppableId !== destination.droppableId) {
      const isCompleted = destination.droppableId === "COMPLETED"
      
      // Optimistic update
      setLocalTodos(prev => prev.map(t => {
        if (t.id.toString() === draggableId) {
          return { ...t, completed: isCompleted, completedAt: isCompleted ? new Date().toISOString() : null }
        }
        return t
      }))

      // API Call
      await toggleTodo(Number(draggableId), isCompleted)
    }
  }

  const handleToggleTodo = async (id: number) => {
    const todo = localTodos.find(t => t.id === id)
    if (!todo) return
    const nextCompleted = !todo.completed
    
    // Optimistic update
    setLocalTodos(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, completed: nextCompleted, completedAt: nextCompleted ? new Date().toISOString() : null }
      }
      return t
    }))

    // API Call
    await toggleTodo(id, nextCompleted)
  }

  // To prevent hydration mismatch with dnd, we should normally wait for mount, but for this mock we'll just render
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted || isLoading) return <div className="p-8 flex justify-center text-muted-foreground">로딩 중...</div>

  return (
    <div className="flex gap-8 h-full">
      {/* Sidebar Filter */}
      <div className="w-64 shrink-0 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">대시보드</h2>
          <Button className="w-full justify-start gap-2 rounded-full" size="lg">
            <Plus className="w-5 h-5" /> 새 작업 추가
          </Button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="작업 검색..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background/50 border-border/50 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground px-1 uppercase tracking-wider">필터</h3>
            <div className="flex flex-col gap-1">
              <Button variant="ghost" className="justify-start rounded-lg">모든 작업</Button>
              <Button variant="ghost" className="justify-start rounded-lg">진행 중</Button>
              <Button variant="ghost" className="justify-start rounded-lg">완료됨</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 grid grid-cols-2 gap-6 items-start h-full">
          <Column title="할 일" id="ACTIVE" todos={activeTodos} toggleTodo={handleToggleTodo} />
          <Column title="완료됨" id="COMPLETED" todos={completedTodos} toggleTodo={handleToggleTodo} />
        </div>
      </DragDropContext>
    </div>
  )
}

function Column({ title, id, todos, toggleTodo }: { title: string, id: string, todos: Todo[], toggleTodo: (id: number) => void }) {
  return (
    <div className="flex flex-col gap-4 bg-muted/20 rounded-[24px] p-5 border border-border/40 min-h-[600px]">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="secondary" className="rounded-full bg-background/80">{todos.length}</Badge>
      </div>

      <Droppable droppableId={id}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex flex-col gap-3 flex-1"
          >
            {todos.map((todo, index) => (
              <Draggable key={todo.id} draggableId={todo.id.toString()} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`bg-card text-card-foreground p-5 rounded-2xl shadow-sm border border-border/50 flex flex-col gap-3 transition-all duration-200 ${snapshot.isDragging ? "ring-2 ring-primary shadow-xl rotate-2" : "hover:-translate-y-1 hover:shadow-md"}`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={todo.completed} 
                        onCheckedChange={() => toggleTodo(todo.id)}
                        className="mt-1 w-5 h-5 rounded-[4px]"
                      />
                      <div className="flex-1 flex flex-col gap-1.5">
                        <span className={`font-medium leading-tight ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>{todo.title}</span>
                        {todo.description && (
                          <span className="text-sm text-muted-foreground line-clamp-2">{todo.description}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityColors[todo.priority]}`}>
                        {todo.priority === "HIGH" ? "긴급" : todo.priority === "MEDIUM" ? "보통" : "낮음"}
                      </Badge>
                      <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs text-muted-foreground bg-background/50 border-border/50 gap-1">
                        <Clock className="w-3 h-3" />
                        {dayjs(todo.dueDate).format("MM.DD")}
                      </Badge>
                      {todo.category && (
                        <div className="flex items-center gap-1.5 ml-auto text-xs font-medium text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-full">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: todo.category.color }} />
                          {todo.category.name}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
