"use client"

import React, { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useTodos } from "@/hooks/useTodos"
import { useCategories } from "@/hooks/useCategories"
import { useTags } from "@/hooks/useTags"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Clock, Ban, Trash2 } from "lucide-react"
import dayjs from "dayjs"
import { Todo, Priority, TodoFilter } from "@/types"
import { TodoFormDialog } from "./TodoFormDialog"

const priorityColors = {
  HIGH: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/40",
  MEDIUM: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/40",
  LOW: "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 border-slate-500/40"
}

export function Board() {
  const [filter, setFilter] = useState<TodoFilter>({})
  const [search, setSearch] = useState("")

  const queryParams = buildQuery({ ...filter, search: search || undefined })
  const { todos: swrTodos, toggleTodo, deleteTodo, isLoading } = useTodos(queryParams)
  const { categories } = useCategories()
  const { tags } = useTags()

  const [localTodos, setLocalTodos] = useState<Todo[]>([])
  const [draggingFromId, setDraggingFromId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  React.useEffect(() => {
    if (swrTodos) setLocalTodos(swrTodos)
  }, [swrTodos])

  const activeTodos = localTodos.filter(t => !t.completed)
  const completedTodos = localTodos
    .filter(t => t.completed)
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())

  const onDragStart = (start: any) => setDraggingFromId(start.source.droppableId)

  const onDragEnd = (result: any) => {
    setDraggingFromId(null)
    if (!result.destination) return
    const { source, destination } = result
    if (source.droppableId !== destination.droppableId) return

    setLocalTodos(prev => {
      const todos = [...prev]
      const isCompleted = source.droppableId === "COMPLETED"
      const col = todos.filter(t => t.completed === isCompleted)
      const other = todos.filter(t => t.completed !== isCompleted)
      const [moved] = col.splice(source.index, 1)
      col.splice(destination.index, 0, moved)
      return isCompleted ? [...other, ...col] : [...col, ...other]
    })
  }

  const handleToggle = async (id: number) => {
    const todo = localTodos.find(t => t.id === id)
    if (!todo) return
    const next = !todo.completed
    setLocalTodos(prev => prev.map(t =>
      t.id === id ? { ...t, completed: next, completedAt: next ? new Date().toISOString() : null } : t
    ))
    try {
      await toggleTodo(id, next)
    } catch {
      setLocalTodos(prev => prev.map(t =>
        t.id === id ? { ...t, completed: todo.completed, completedAt: todo.completedAt } : t
      ))
    }
  }

  const handleDelete = async (id: number) => {
    setLocalTodos(prev => prev.filter(t => t.id !== id))
    try {
      await deleteTodo(id)
    } catch {
      setLocalTodos(swrTodos)
    }
  }

  const openCreate = () => { setEditingTodo(null); setDialogOpen(true) }
  const openEdit = (todo: Todo) => { setEditingTodo(todo); setDialogOpen(true) }

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted || isLoading) return <div className="p-8 flex justify-center text-muted-foreground">로딩 중...</div>

  return (
    <>
      <div className="flex gap-8 h-full">
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex-1 grid grid-rows-2 gap-6 h-full min-h-0 overflow-hidden">
            <Column title="할 일" id="ACTIVE" todos={activeTodos}
              onToggle={handleToggle} onEdit={openEdit} onDelete={handleDelete} scrollable
              draggingFromId={draggingFromId} />
            <Column title="완료됨" id="COMPLETED" todos={completedTodos}
              onToggle={handleToggle} onEdit={openEdit} onDelete={handleDelete} scrollable
              draggingFromId={draggingFromId} />
          </div>
        </DragDropContext>

        {/* 필터 사이드바 */}
        <div className="w-64 shrink-0 hidden xl:flex flex-col gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight">대시보드</h2>
              <button
                onClick={() => { setFilter({}); setSearch(""); }}
                className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors px-2 py-1"
              >
                필터 초기화
              </button>
            </div>
            <Button onClick={openCreate} className="w-full justify-start gap-2 rounded-full" size="lg">
              <Plus className="w-5 h-5" /> 새 작업 추가
            </Button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="작업 검색..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-background/50 border-border/50 rounded-lg"
              />
            </div>

            {/* 완료 여부 필터 */}
            <FilterSection title="상태">
              {[
                { label: "모든 작업", value: undefined },
                { label: "진행 중", value: false },
                { label: "완료됨", value: true },
              ].map(opt => (
                <Button key={String(opt.value)} variant={filter.completed === opt.value ? "default" : "ghost"}
                  size="sm" className="justify-start rounded-lg w-full"
                  onClick={() => setFilter(f => ({ ...f, completed: opt.value }))}>
                  {opt.label}
                </Button>
              ))}
            </FilterSection>

            {/* 우선순위 필터 */}
            <FilterSection title="우선순위">
              {([undefined, "HIGH", "MEDIUM", "LOW"] as (Priority | undefined)[]).map(p => (
                <Button key={String(p)} variant={filter.priority === p ? "default" : "ghost"}
                  size="sm" className="justify-start rounded-lg w-full"
                  onClick={() => setFilter(f => ({ ...f, priority: p }))}>
                  {p === undefined ? "전체" : p === "HIGH" ? "긴급" : p === "MEDIUM" ? "보통" : "낮음"}
                </Button>
              ))}
            </FilterSection>

            {/* 카테고리 필터 */}
            {categories.length > 0 && (
              <FilterSection title="카테고리">
                <Button variant={!filter.category ? "default" : "ghost"} size="sm"
                  className="justify-start rounded-lg w-full"
                  onClick={() => setFilter(f => ({ ...f, category: undefined }))}>전체</Button>
                {categories.map(c => (
                  <Button key={c.id} variant={filter.category === c.id ? "default" : "ghost"} size="sm"
                    className="justify-start rounded-lg w-full gap-2"
                    onClick={() => setFilter(f => ({ ...f, category: c.id }))}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </Button>
                ))}
              </FilterSection>
            )}

            {/* 태그 필터 */}
            {tags.length > 0 && (
              <FilterSection title="태그">
                {tags.map(t => (
                  <Button key={t.id} variant={filter.tag === t.id ? "default" : "ghost"} size="sm"
                    className="justify-start rounded-lg w-full"
                    onClick={() => setFilter(f => ({ ...f, tag: f.tag === t.id ? undefined : t.id }))}>
                    {t.name}
                  </Button>
                ))}
              </FilterSection>
            )}
          </div>
        </div>
      </div>

      <TodoFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} todo={editingTodo} />
    </>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-muted-foreground px-1 uppercase tracking-wider">{title}</h3>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

function buildQuery(filter: TodoFilter & { search?: string }): string {
  const p = new URLSearchParams()
  if (filter.category !== undefined) p.set("category", String(filter.category))
  if (filter.tag !== undefined) p.set("tag", String(filter.tag))
  if (filter.priority !== undefined) p.set("priority", filter.priority)
  if (filter.completed !== undefined) p.set("completed", String(filter.completed))
  if (filter.search) p.set("search", filter.search)
  const qs = p.toString()
  return qs ? `?${qs}` : ""
}

interface ColumnProps {
  title: string
  id: string
  todos: Todo[]
  onToggle: (id: number) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: number) => void
  scrollable?: boolean
  draggingFromId?: string | null
}

function Column({ title, id, todos, onToggle, onEdit, onDelete, scrollable, draggingFromId }: ColumnProps) {
  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => {
        const showBlocked = id === "COMPLETED" && draggingFromId === "ACTIVE" && snapshot.isDraggingOver
        return (
          <div className={`relative flex flex-col gap-4 bg-muted/40 rounded-[24px] p-5 border h-full min-h-0 overflow-hidden transition-all duration-200 ${showBlocked ? "border-red-500/40" : "border-border/60"}`}>
            {showBlocked && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-[24px] bg-background/60 backdrop-blur-[4px]">
                <Ban className="w-8 h-8 text-red-400" />
                <span className="text-sm font-bold text-red-400">체크박스로 처리하세요</span>
              </div>
            )}
            <div className="flex items-center justify-between px-1 shrink-0">
              <h3 className="font-semibold">{title}</h3>
              <Badge variant="secondary" className="rounded-full bg-background/80">{todos.length}</Badge>
            </div>

            <div className={`flex-1 min-h-0 p-1 -m-1 ${scrollable ? "overflow-y-auto scrollbar-hide" : "overflow-visible"}`}>
              <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col min-h-full pr-2">
                {todos.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/60 min-h-[150px] gap-2">
                    <span className="text-sm font-medium">
                      {id === "ACTIVE" ? "등록된 할 일이 없습니다!" : "아직 완료된 할 일이 없네요."}
                    </span>
                    {id === "ACTIVE" && <span className="text-xs">새로운 할 일을 추가해보세요.</span>}
                  </div>
                )}
                {todos.map((todo, index) => (
                  <Draggable key={todo.id} draggableId={todo.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                        onClick={() => onEdit(todo)}
                        className={`cursor-pointer group bg-card text-card-foreground p-3 rounded-xl shadow-sm border border-border/80 flex flex-col mb-2 last:mb-0 transition-[box-shadow,opacity] duration-200 ${snapshot.isDragging ? "ring-2 ring-primary shadow-xl opacity-95" : "hover:ring-2 hover:ring-primary"}`}>
                        <div className="flex items-center gap-3 w-full">
                          <div
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            className="shrink-0 flex items-center"
                          >
                            <Checkbox checked={todo.completed} onCheckedChange={() => onToggle(todo.id)}
                              className="w-5 h-5 rounded-[4px]" />
                          </div>

                          <div className="flex flex-row items-center gap-3 min-w-0 flex-1">
                            <span className={`font-medium leading-tight truncate ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                              {todo.title}
                            </span>
                          </div>

                          {/* 우측 메타 정보 및 삭제 버튼 */}
                          <div className="flex items-center gap-2 shrink-0 ml-auto">
                            {todo.category && (
                              <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: todo.category.color }} />
                                {todo.category.name}
                              </div>
                            )}
                            {todo.dueDate && (
                              <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[10px] text-muted-foreground bg-background/50 border-border/50 gap-1 flex items-center">
                                <Clock className="w-3 h-3" />
                                {dayjs(todo.dueDate).format("MM.DD")}
                              </Badge>
                            )}
                            <Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityColors[todo.priority]}`}>
                              {todo.priority === "HIGH" ? "긴급" : todo.priority === "MEDIUM" ? "보통" : "낮음"}
                            </Badge>
                            
                            {/* 삭제 */}
                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                              <button onClick={e => { e.stopPropagation(); onDelete(todo.id) }}
                                className="p-1 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            </div>
          </div>
        )
      }}
    </Droppable>
  )
}
