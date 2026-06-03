"use client"

import { useCallback, useMemo } from "react"
import type { Dayjs } from "dayjs"
import { toast } from "sonner"
import { buildQuery } from "@/lib/queryBuilder"
import { useTodos } from "./useTodos"
import { useTodoSchedules } from "./useTodoSchedules"
import { useTodoMutations } from "./useTodoMutations"
import { useLocalTodoSync } from "./useLocalTodoSync"
import { Todo, TodoSchedule } from "@/types"

export type ScheduledTodo = Todo & {
  startTime: string
  endTime: string
  scheduleId: number
}

interface UsePlannerTodosOptions {
  selectedDate: Dayjs
}

export function usePlannerTodos({ selectedDate }: UsePlannerTodosOptions) {
  const dateStr = selectedDate.format("YYYY-MM-DD")
  const queryParams = useMemo(() => buildQuery({ dueDate: dateStr }), [dateStr])

  const { rawTodos, isLoading: todosLoading, refetch: refetchTodos } = useTodos(queryParams)
  const {
    schedules,
    setSchedules,
    isLoading: schedulesLoading,
    refetch: refetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  } = useTodoSchedules(selectedDate)

  const { toggleTodo, deleteTodo } = useTodoMutations()
  const [localTodos] = useLocalTodoSync(rawTodos)

  const isLoading = todosLoading || schedulesLoading

  const refetch = useCallback(async () => {
    await Promise.all([refetchTodos(), refetchSchedules()])
  }, [refetchTodos, refetchSchedules])

  const scheduledIds = useMemo(() => new Set(schedules.map(s => s.todoId)), [schedules])

  const scheduledTodos = useMemo<ScheduledTodo[]>(() => {
    return schedules.flatMap(s => {
      const todo = localTodos.find(t => t.id === s.todoId)
      return todo ? [{ ...todo, startTime: s.startTime, endTime: s.endTime, scheduleId: s.id }] : []
    })
  }, [localTodos, schedules])

  const unscheduledTodos = useMemo<Todo[]>(
    () => localTodos.filter(t => !scheduledIds.has(t.id)),
    [localTodos, scheduledIds]
  )

  const unscheduledActive = useMemo(
    () => unscheduledTodos.filter(t => !t.completed),
    [unscheduledTodos]
  )
  const unscheduledCompleted = useMemo(
    () => unscheduledTodos.filter(t => t.completed),
    [unscheduledTodos]
  )

  // ── 이벤트 시간 재배치 (그리드 내 드래그) ───────────────────
  const handleEventDrop = useCallback(async (scheduleId: number, startTime: string, endTime: string) => {
    const snapshot = schedules
    setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, startTime, endTime } : s))
    try {
      await updateSchedule(scheduleId, { startTime, endTime })
    } catch {
      setSchedules(snapshot)
      toast.error("일정 시간을 변경하지 못했습니다.")
      throw new Error("revert")
    }
  }, [schedules, setSchedules, updateSchedule])

  // ── 이벤트 기간 조정 (리사이즈) ─────────────────────────────
  const handleEventResize = useCallback(async (scheduleId: number, startTime: string, endTime: string) => {
    const snapshot = schedules
    setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, startTime, endTime } : s))
    try {
      await updateSchedule(scheduleId, { startTime, endTime })
    } catch {
      setSchedules(snapshot)
      toast.error("일정 기간을 변경하지 못했습니다.")
      throw new Error("revert")
    }
  }, [schedules, setSchedules, updateSchedule])

  // ── 풀 → 그리드: 스케줄 생성 ─────────────────────────────
  const handleEventReceive = useCallback(async (todoId: number, startTime: string, endTime: string) => {
    const tempSchedule: TodoSchedule = {
      id: -Date.now(),
      todoId,
      startTime,
      endTime,
      scheduleDate: dateStr,
    }
    const snapshot = schedules
    setSchedules(prev => [...prev.filter(s => s.todoId !== todoId), tempSchedule])
    try {
      const created = await createSchedule({ todoId, startTime, endTime, scheduleDate: dateStr })
      setSchedules(prev => prev.map(s => s.id === tempSchedule.id ? created : s))
    } catch {
      setSchedules(snapshot)
      toast.error("일정을 저장하지 못했습니다.")
    }
  }, [schedules, setSchedules, createSchedule, dateStr])

  // ── 그리드 → 풀: 스케줄 해제 ────────────────────────────
  const handleUnschedule = useCallback(async (scheduleId: number) => {
    const snapshot = schedules
    setSchedules(prev => prev.filter(s => s.id !== scheduleId))
    try {
      await deleteSchedule(scheduleId)
    } catch {
      setSchedules(snapshot)
      toast.error("일정을 해제하지 못했습니다.")
    }
  }, [schedules, setSchedules, deleteSchedule])

  const handleToggle = useCallback(async (todo: Todo) => {
    try {
      await toggleTodo(todo.id, !todo.completed)
      await refetchTodos()
    } catch { }
  }, [toggleTodo, refetchTodos])

  const handleDelete = useCallback(async (id: number) => {
    const schedule = schedules.find(s => s.todoId === id)
    try {
      if (schedule) await deleteSchedule(schedule.id)
      await deleteTodo(id)
      await refetch()
    } catch { }
  }, [schedules, deleteSchedule, deleteTodo, refetch])

  return {
    todos: localTodos,
    scheduledTodos,
    unscheduledActive,
    unscheduledCompleted,
    isLoading,
    refetch,
    handleEventDrop,
    handleEventResize,
    handleEventReceive,
    handleUnschedule,
    handleToggle,
    handleDelete,
  }
}
