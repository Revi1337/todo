"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import type { Dayjs } from "dayjs"
import type { DragStart, DropResult } from "@hello-pangea/dnd"
import { HOURS, HOUR_HEIGHT_PX, offsetPxToTime, absoluteMinutesToTimeString, parseTimeToMinutes } from "@/lib/planner"
import { Todo } from "@/types"

// Phase 21 mock: 추후 API 연동 시 TodoSchedule 타입으로 교체
export interface MockSchedule {
  todoId: number
  startTime: string  // "HH:mm:ss"
  endTime: string    // "HH:mm:ss"
}

export type ScheduledTodo = Todo & { startTime: string; endTime: string }

// ── Mock 데이터 ──────────────────────────────────────────────────────────────

const MOCK_TODOS: Todo[] = [
  {
    id: 1,
    title: "집중 업무 (Focus Work)",
    description: null,
    completed: false,
    priority: "HIGH",
    dueDate: null,
    completedAt: null,
    category: { id: 1, name: "Product Development", color: "#3b82f6", createdAt: "" },
    tags: [],
    createdAt: "",
    updatedAt: "",
    position: 0,
  },
  {
    id: 2,
    title: "이메일 정리 (Email Catch-up)",
    description: null,
    completed: false,
    priority: "MEDIUM",
    dueDate: null,
    completedAt: null,
    category: { id: 2, name: "Admin", color: "#b45309", createdAt: "" },
    tags: [],
    createdAt: "",
    updatedAt: "",
    position: 1,
  },
  {
    id: 3,
    title: "팀 싱크 (Team Sync)",
    description: null,
    completed: false,
    priority: "MEDIUM",
    dueDate: null,
    completedAt: null,
    category: { id: 3, name: "Meeting", color: "#16a34a", createdAt: "" },
    tags: [],
    createdAt: "",
    updatedAt: "",
    position: 2,
  },
  {
    id: 4,
    title: "아침 식사 (Breakfast)",
    description: "Daily Routine",
    completed: false,
    priority: "LOW",
    dueDate: null,
    completedAt: null,
    category: { id: 4, name: "Daily Routine", color: "#15803d", createdAt: "" },
    tags: [],
    createdAt: "",
    updatedAt: "",
    position: 3,
  },
]

const MOCK_SCHEDULES: MockSchedule[] = [
  { todoId: 4, startTime: "08:00:00", endTime: "09:00:00" },
]

// ── Hook ─────────────────────────────────────────────────────────────────────

interface UsePlannerTodosOptions {
  selectedDate: Dayjs
}

export function usePlannerTodos({ selectedDate: _selectedDate }: UsePlannerTodosOptions) {
  const [todos] = useState<Todo[]>(MOCK_TODOS)
  const [schedules, setSchedules] = useState<MockSchedule[]>(MOCK_SCHEDULES)

  const scheduledTodos = useMemo<ScheduledTodo[]>(() => {
    return schedules.flatMap(s => {
      const todo = todos.find(t => t.id === s.todoId)
      return todo ? [{ ...todo, startTime: s.startTime, endTime: s.endTime }] : []
    })
  }, [todos, schedules])

  const unscheduledTodos = useMemo<Todo[]>(
    () => todos.filter(t => !schedules.some(s => s.todoId === t.id)),
    [todos, schedules]
  )

  // 포인터 Y 좌표 추적 (DragDropContext는 onDragEnd에서 좌표를 제공하지 않음)
  const pointerYRef = useRef(0)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      pointerYRef.current = "touches" in e ? e.touches[0].clientY : e.clientY
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("touchmove", onMove, { passive: true })
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("touchmove", onMove)
    }
  }, [])

  const onDragStart = useCallback((_start: DragStart) => {}, [])

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return

    const todoId = Number(result.draggableId)
    const src = result.source.droppableId
    const dst = result.destination.droppableId

    if (dst === "POOL") {
      // 그리드 → 풀: 스케줄 제거
      setSchedules(prev => prev.filter(s => s.todoId !== todoId))
      return
    }

    if (dst === "TIMEGRID") {
      // 풀 → 그리드: 포인터 Y로 시작 시각 계산
      const gridTop = gridRef.current?.getBoundingClientRect().top ?? 0
      const scrollTop = scrollRef.current?.scrollTop ?? 0
      const offsetPx = pointerYRef.current - gridTop + scrollTop
      const startTime = offsetPxToTime(offsetPx)
      const startMinutes = parseTimeToMinutes(startTime)
      const endTime = absoluteMinutesToTimeString(startMinutes + 60)

      setSchedules(prev => {
        const filtered = prev.filter(s => s.todoId !== todoId)
        return [...filtered, { todoId, startTime, endTime }]
      })
    }
  }, [])

  // 완료 토글 (mock)
  const handleToggle = useCallback((_todo: Todo) => {}, [])

  // 삭제 (mock)
  const handleDelete = useCallback((_id: number) => {}, [])

  return {
    todos,
    scheduledTodos,
    unscheduledTodos,
    isLoading: false,
    refetch: () => {},
    handleToggle,
    handleDelete,
    pointerYRef,
    gridRef,
    scrollRef,
    onDragStart,
    onDragEnd,
    // HOURS 범위 상수 노출
    hours: HOURS,
    hourHeightPx: HOUR_HEIGHT_PX,
  }
}
