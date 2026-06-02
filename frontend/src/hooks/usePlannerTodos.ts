"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import type { Dayjs } from "dayjs"
import type { DragStart, DropResult } from "@hello-pangea/dnd"
import { toast } from "sonner"
import { HOURS, HOUR_HEIGHT_PX, offsetPxToTime, timeToOffsetPx, absoluteMinutesToTimeString, parseTimeToMinutes } from "@/lib/planner"
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

  const { toggleTodo, deleteTodo, reorderTodos } = useTodoMutations()

  // 낙관적 업데이트를 위한 로컬 투두 상태
  const [localTodos, setLocalTodos] = useLocalTodoSync(rawTodos)

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

  // 포인터 Y 좌표 추적
  const pointerYRef = useRef(0)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  // 이벤트 카드 드래그 시 카드 상단에서 마우스까지의 거리 (grab offset)
  const grabOffsetRef = useRef(0)

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

  // 드래그 출발 droppableId 추적 (차단 오버레이용)
  const [draggingFromId, setDraggingFromId] = useState<string | null>(null)
  // TIMEGRID 위 hover 중인 hour 인덱스 (점선 표시용)
  const [hoverHourIndex, setHoverHourIndex] = useState<number | null>(null)

  const onDragStart = useCallback((start: DragStart) => {
    setDraggingFromId(start.source.droppableId)

    // 이벤트 카드 드래그 시 카드 상단 기준 grab offset 계산
    // (마우스가 카드 중간을 잡으면 drop 위치가 그만큼 아래로 밀리는 현상 보정)
    if (start.source.droppableId === "TIMEGRID" && start.draggableId.startsWith("sched-")) {
      const scheduleId = Number(start.draggableId.slice(6))
      const schedule = schedules.find(s => s.id === scheduleId)
      if (schedule) {
        const cardTopPx = timeToOffsetPx(schedule.startTime)
        const gridTop = gridRef.current?.getBoundingClientRect().top ?? 0
        grabOffsetRef.current = pointerYRef.current - gridTop - cardTopPx
      }
    } else {
      grabOffsetRef.current = 0
    }
  }, [schedules])

  // 드래그 중 TIMEGRID 위 hover hour 계산
  useEffect(() => {
    if (!draggingFromId) { setHoverHourIndex(null); return }

    const onMove = () => {
      if (!gridRef.current) return
      const gridTop = gridRef.current.getBoundingClientRect().top
      const offsetPx = pointerYRef.current - gridTop
      if (offsetPx < 0 || offsetPx > HOURS.length * HOUR_HEIGHT_PX) {
        setHoverHourIndex(null)
        return
      }
      setHoverHourIndex(Math.floor(offsetPx / HOUR_HEIGHT_PX))
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("touchmove", onMove)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("touchmove", onMove)
      setHoverHourIndex(null)
    }
  }, [draggingFromId])

  const onDragEnd = useCallback(async (result: DropResult) => {
    setDraggingFromId(null)
    if (!result.destination) return

    const isEventCard = result.draggableId.startsWith("sched-")
    const scheduleId = isEventCard ? Number(result.draggableId.slice(6)) : null
    const todoId = isEventCard ? null : Number(result.draggableId)
    const src = result.source.droppableId
    const dst = result.destination.droppableId

    // ── 이벤트 카드 → 그리드: 시간 재배치 ─────────────────────
    if (isEventCard && src === "TIMEGRID" && dst === "TIMEGRID") {
      const gridTop = gridRef.current?.getBoundingClientRect().top ?? 0
      const offsetPx = pointerYRef.current - gridTop - grabOffsetRef.current
      const startTime = offsetPxToTime(offsetPx)
      const endTime = absoluteMinutesToTimeString(parseTimeToMinutes(startTime) + 60)

      const snapshot = schedules
      setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, startTime, endTime } : s))
      try {
        await updateSchedule(scheduleId!, { startTime, endTime })
      } catch {
        setSchedules(snapshot)
        toast.error("일정 시간을 변경하지 못했습니다.")
      }
      return
    }

    // ── 이벤트 카드 → 풀: 스케줄 해제 ───────────────────────
    if (isEventCard && src === "TIMEGRID" && (dst === "POOL_ACTIVE" || dst === "POOL_COMPLETED")) {
      const snapshot = schedules
      setSchedules(prev => prev.filter(s => s.id !== scheduleId))
      try {
        await deleteSchedule(scheduleId!)
      } catch {
        setSchedules(snapshot)
        toast.error("일정을 해제하지 못했습니다.")
      }
      return
    }

    // ── 풀 내 리오더 ──────────────────────────────────────────
    if (!isEventCard && src === dst && (src === "POOL_ACTIVE" || src === "POOL_COMPLETED")) {
      if (result.source.index === result.destination.index) return

      const isCompleted = src === "POOL_COMPLETED"
      const col = isCompleted ? unscheduledCompleted : unscheduledActive
      const newCol = [...col]
      const [moved] = newCol.splice(result.source.index, 1)
      newCol.splice(result.destination.index, 0, moved)

      const reorderItems = newCol.map((t, i) => ({ id: t.id, position: i }))

      // 낙관적 업데이트
      const snapshot = localTodos
      const other = isCompleted ? unscheduledActive : unscheduledCompleted
      const newUnscheduled = isCompleted ? [...other, ...newCol] : [...newCol, ...other]
      const newLocalTodos = [
        ...localTodos.filter(t => scheduledIds.has(t.id)),
        ...newUnscheduled,
      ]
      setLocalTodos(newLocalTodos)
      reorderTodos(reorderItems).catch(() => setLocalTodos(snapshot))
      return
    }

    // ── 크로스 풀 드롭 차단 ────────────────────────────────────
    if (
      (src === "POOL_ACTIVE" && dst === "POOL_COMPLETED") ||
      (src === "POOL_COMPLETED" && dst === "POOL_ACTIVE")
    ) return

    // ── 풀 → 그리드: 스케줄 생성 ─────────────────────────────
    if (!isEventCard && (src === "POOL_ACTIVE" || src === "POOL_COMPLETED") && dst === "TIMEGRID") {
      const gridTop = gridRef.current?.getBoundingClientRect().top ?? 0
      const offsetPx = pointerYRef.current - gridTop
      const startTime = offsetPxToTime(offsetPx)
      const endTime = absoluteMinutesToTimeString(parseTimeToMinutes(startTime) + 60)

      const tempSchedule: TodoSchedule = {
        id: -Date.now(),
        todoId: todoId!,
        startTime,
        endTime,
        scheduleDate: dateStr,
      }
      const snapshot = schedules
      setSchedules(prev => [...prev.filter(s => s.todoId !== todoId), tempSchedule])

      try {
        const created = await createSchedule({ todoId: todoId!, startTime, endTime, scheduleDate: dateStr })
        setSchedules(prev => prev.map(s => s.id === tempSchedule.id ? created : s))
      } catch {
        setSchedules(snapshot)
        toast.error("일정을 저장하지 못했습니다.")
      }
      return
    }
  }, [
    schedules, setSchedules, localTodos, setLocalTodos,
    unscheduledActive, unscheduledCompleted, scheduledIds,
    createSchedule, updateSchedule, deleteSchedule, reorderTodos, dateStr,
  ])

  const handleToggle = useCallback(async (todo: Todo) => {
    try {
      await toggleTodo(todo.id, !todo.completed)
      await refetchTodos()
    } catch { /* useTodoMutations 내부 toast 처리 */ }
  }, [toggleTodo, refetchTodos])

  const handleDelete = useCallback(async (id: number) => {
    const schedule = schedules.find(s => s.todoId === id)
    try {
      if (schedule) await deleteSchedule(schedule.id)
      await deleteTodo(id)
      await refetch()
    } catch { /* useTodoMutations 내부 toast 처리 */ }
  }, [schedules, deleteSchedule, deleteTodo, refetch])

  return {
    todos: localTodos,
    scheduledTodos,
    unscheduledActive,
    unscheduledCompleted,
    isLoading,
    refetch,
    draggingFromId,
    hoverHourIndex,
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
