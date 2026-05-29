"use client"

import { useState } from "react"
import dayjs from "dayjs"
import { useTodos } from "@/hooks/useTodos"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react"
import { Todo } from "@/types"
import { TodoFormDialog } from "./TodoFormDialog"

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  const { todos, toggleTodo, isLoading } = useTodos()

  const startDay = currentDate.startOf("month").day()
  const daysInMonth = currentDate.daysInMonth()

  const calendarDays: (number | null)[] = []
  for (let i = 0; i < startDay; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

  const selectedTodos = selectedDate
    ? todos.filter(t => dayjs(t.dueDate).isSame(selectedDate, "day"))
    : []

  const handleToggle = async (todo: Todo) => {
    try {
      await toggleTodo(todo.id, !todo.completed)
    } catch {
      // 에러는 fetcher가 처리 (401 → 로그인 리다이렉트)
    }
  }

  const openCreate = () => { setEditingTodo(null); setDialogOpen(true) }
  const openEdit = (todo: Todo) => { setEditingTodo(todo); setDialogOpen(true) }

  if (isLoading) return <div className="p-8 flex justify-center text-muted-foreground">로딩 중...</div>

  return (
    <>
      <div className="flex gap-8 h-full items-start">
        {/* 캘린더 */}
        <div className="flex-1 bg-card rounded-[24px] p-6 shadow-sm border border-border/50 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">{currentDate.format("YYYY년 MM월")}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(d => d.subtract(1, "month"))} className="rounded-full">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(d => d.add(1, "month"))} className="rounded-full">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4 flex-1">
            {["일", "월", "화", "수", "목", "금", "토"].map(d => (
              <div key={d} className="text-center font-semibold text-muted-foreground mb-2">{d}</div>
            ))}
            {calendarDays.map((dateNum, i) => {
              if (!dateNum) return <div key={i} className="min-h-[100px]" />
              const date = currentDate.date(dateNum)
              const isToday = date.isSame(dayjs(), "day")
              const isSelected = selectedDate?.isSame(date, "day")
              const dayTodos = todos.filter(t => dayjs(t.dueDate).isSame(date, "day"))
              return (
                <div key={i} onClick={() => setSelectedDate(date)}
                  className={`min-h-[100px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 ${isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border/30 hover:border-primary/50"}`}>
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? "bg-primary text-primary-foreground" : ""}`}>
                    {dateNum}
                  </span>
                  <div className="flex flex-col gap-1 mt-1">
                    {dayTodos.slice(0, 3).map(todo => (
                      <div key={todo.id} className="text-[11px] px-1.5 py-0.5 bg-muted rounded truncate flex items-center gap-1 font-medium">
                        <span className={`w-1.5 h-1.5 rounded-full ${todo.completed ? "bg-emerald-500" : "bg-primary"}`} />
                        <span className={todo.completed ? "line-through text-muted-foreground" : ""}>{todo.title}</span>
                      </div>
                    ))}
                    {dayTodos.length > 3 && (
                      <span className="text-[10px] text-muted-foreground px-1.5">+{dayTodos.length - 3}개 더</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 날짜 상세 패널 */}
        <div className="w-80 shrink-0 bg-muted/20 rounded-[24px] p-6 shadow-sm border border-border/50 h-full overflow-y-auto scrollbar-hide">
          <h3 className="text-lg font-bold mb-1 tracking-tight">
            {selectedDate ? selectedDate.format("MM월 DD일 일정") : "날짜를 선택하세요"}
          </h3>
          <p className="text-sm text-muted-foreground mb-6 font-medium">총 {selectedTodos.length}개의 일정</p>

          <Button onClick={openCreate} className="w-full justify-start gap-2 rounded-full mb-6" size="lg">
            <Plus className="w-5 h-5" /> 새 작업 추가
          </Button>

          <div className="flex flex-col gap-3">
            {selectedTodos.map(todo => (
              <div key={todo.id} onClick={() => openEdit(todo)}
                className="bg-card p-4 rounded-2xl shadow-sm border border-border/50 flex flex-col gap-2 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <Checkbox checked={todo.completed}
                    onCheckedChange={() => handleToggle(todo)}
                    onClick={e => e.stopPropagation()}
                    className="mt-1 w-5 h-5 rounded-[4px]" />
                  <span className={`font-medium leading-tight ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                    {todo.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 pl-8">
                  <Badge variant="outline" className="text-xs bg-background/50 rounded-full font-semibold">
                    <Clock className="w-3 h-3 mr-1" />
                    {todo.priority === "HIGH" ? "긴급" : todo.priority === "MEDIUM" ? "보통" : "낮음"}
                  </Badge>
                </div>
              </div>
            ))}
            {selectedTodos.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm font-medium">일정이 없습니다.</div>
            )}
          </div>
        </div>
      </div>

      <TodoFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        todo={editingTodo}
        defaultDueDate={selectedDate ? selectedDate.format("YYYY-MM-DD") : undefined}
      />
    </>
  )
}
