"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import type { Dayjs } from "dayjs"
import type { DragStart, DropResult } from "@hello-pangea/dnd"
import { toast } from "sonner"
import { HOURS, HOUR_HEIGHT_PX, offsetPxToTime, absoluteMinutesToTimeString, parseTimeToMinutes } from "@/lib/planner"
import { buildQuery } from "@/lib/queryBuilder"
import { useTodos } from "./useTodos"
import { useTodoSchedules } from "./useTodoSchedules"
import { useTodoMutations } from "./useTodoMutations"
import { Todo, TodoSchedule } from "@/types"

export type ScheduledTodo = Todo & {
  startTime: string   // "HH:mm:ss"
  endTime: string     // "HH:mm:ss"
  scheduleId: number
}

interface UsePlannerTodosOptions {
  selectedDate: Dayjs
}

export function usePlannerTodos({ selectedDate }: UsePlannerTodosOptions) {
  const dateStr = selectedDate.format("YYYY-MM-DD")
  const queryParams = useMemo(() => buildQuery({ dueDate: dateStr }), [dateStr])

  const { todos, rawTodos, isLoading: todosLoading, refetch: refetchTodos } = useTodos(queryParams)
  const {
    schedules,
    setSchedules,
    isLoading: schedulesLoading,
    refetch: refetchSchedules,
    createSchedule,
    deleteSchedule,
  } = useTodoSchedules(selectedDate)

  const { toggleTodo, deleteTodo } = useTodoMutations()

  const isLoading = todosLoading || schedulesLoading

  const refetch = useCallback(async () => {
    await Promise.all([refetchTodos(), refetchSchedules()])
  }, [refetchTodos, refetchSchedules])

  // todos와 schedules를 todoId로 조인
  const scheduledTodos = useMemo<ScheduledTodo[]>(() => {
    return schedules.flatMap(s => {
      const todo = todos.find(t => t.id === s.todoId)
      return todo ? [{ ...todo, startTime: s.startTime, endTime: s.endTime, scheduleId: s.id }] : []
    })
  }, [todos, schedules])

  const unscheduledTodos = useMemo<Todo[]>(
    () => todos.filter(t => !schedules.some(s => s.todoId === t.id)),
    [todos, schedules]
  )

  // 포인터 Y 좌표 추적 — @hello-pangea/dnd는 onDragEnd에서 좌표를 제공하지 않음
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

  const onDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination) return

    const todoId = Number(result.draggableId)
    const dst = result.destination.droppableId

    if (dst === "POOL") {
      // 그리드 → 풀: 스케줄 삭제
      const schedule = schedules.find(s => s.todoId === todoId)
      if (!schedule) return

      const snapshot = schedules
      setSchedules(prev => prev.filter(s => s.todoId !== todoId))
      try {
        await deleteSchedule(schedule.id)
      } catch {
        setSchedules(snapshot)
        toast.error("일정을 삭제하지 못했습니다.")
      }
      return
    }

    if (dst === "TIMEGRID") {
      // 풀 → 그리드: 포인터 Y로 시작 시각 계산 후 스케줄 생성
      const gridTop = gridRef.current?.getBoundingClientRect().top ?? 0
      const scrollTop = scrollRef.current?.scrollTop ?? 0
      const offsetPx = pointerYRef.current - gridTop + scrollTop
      const startTime = offsetPxToTime(offsetPx)
      const endTime = absoluteMinutesToTimeString(parseTimeToMinutes(startTime) + 60)

      // 낙관적 업데이트: 임시 id 사용
      const tempSchedule: TodoSchedule = {
        id: -Date.now(),
        todoId,
        startTime,
        endTime,
        scheduleDate: dateStr,
      }
      const snapshot = schedules
      setSchedules(prev => {
        const filtered = prev.filter(s => s.todoId !== todoId)
        return [...filtered, tempSchedule]
      })

      try {
        const created = await createSchedule({ todoId, startTime, endTime, scheduleDate: dateStr })
        // 임시 항목을 실제 응답으로 교체
        setSchedules(prev => prev.map(s => s.id === tempSchedule.id ? created : s))
      } catch {
        setSchedules(snapshot)
        toast.error("일정을 저장하지 못했습니다.")
      }
    }
  }, [schedules, setSchedules, createSchedule, deleteSchedule, dateStr])

  const handleToggle = useCallback(async (todo: Todo) => {
    try {
      await toggleTodo(todo.id, !todo.completed)
      await refetchTodos()
    } catch {
      // useTodoMutations 내부에서 toast 처리
    }
  }, [toggleTodo, refetchTodos])

  const handleDelete = useCallback(async (id: number) => {
    const schedule = schedules.find(s => s.todoId === id)
    try {
      if (schedule) await deleteSchedule(schedule.id)
      await deleteTodo(id)
      await refetch()
    } catch {
      // useTodoMutations 내부에서 toast 처리
    }
  }, [schedules, deleteSchedule, deleteTodo, refetch])

  return {
    todos,
    scheduledTodos,
    unscheduledTodos,
    isLoading,
    refetch,
    handleToggle,
    handleDelete,
    pointerYRef,
    gridRef,
    scrollRef,
    onDragStart,
    onDragEnd,
    hours: HOURS,
    hourHeightPx: HOUR_HEIGHT_PX,
  }
}
