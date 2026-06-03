"use client"

import { useRef, useEffect, useCallback } from "react"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import type { EventDropArg } from "@fullcalendar/core"
import type { EventDragStopArg, EventDragStartArg, EventResizeDoneArg, EventReceiveArg } from "@fullcalendar/interaction"
import type { EventContentArg } from "@fullcalendar/core"
import type { Dayjs } from "dayjs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { ScheduledTodo } from "@/hooks/usePlannerTodos"
import { Todo } from "@/types"
import { PRIORITY_META } from "@/constants/priority"

interface PlannerCalendarProps {
  selectedDate: Dayjs
  scheduledTodos: ScheduledTodo[]
  unscheduledTodos: Todo[]
  isLoading: boolean
  poolRef: React.RefObject<HTMLDivElement | null>
  onEventDrop: (scheduleId: number, startTime: string, endTime: string) => Promise<void>
  onEventResize: (scheduleId: number, startTime: string, endTime: string) => Promise<void>
  onEventReceive: (todoId: number, startTime: string, endTime: string) => Promise<void>
  onUnschedule: (scheduleId: number) => Promise<void>
  onEdit: (todo: ScheduledTodo) => void
  onToggle: (todo: Todo) => void
  togglingIds: Set<number>
  className?: string
}

function toDateTimeStr(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}`
}

function toTimeStr(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:00`
}

export function PlannerCalendar({
  selectedDate,
  scheduledTodos,
  unscheduledTodos,
  isLoading,
  poolRef,
  onEventDrop,
  onEventResize,
  onEventReceive,
  onUnschedule,
  onEdit,
  onToggle,
  togglingIds,
  className = "flex-[6]",
}: PlannerCalendarProps) {
  const dateStr = selectedDate.format("YYYY-MM-DD")
  const calendarRef = useRef<FullCalendar>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const mouseYRef = useRef(0)

  useEffect(() => {
    calendarRef.current?.getApi().gotoDate(dateStr)
  }, [dateStr])

  // dragScroll={false}로 FC auto-scroll 비활성화 후 직접 구현
  // - isDraggingRef: eventDragStart는 최소 드래그 거리 이후 발동 → pointerdown 기준으로 추적
  // - 스크롤 타겟: FC 소스의 scrollerElRef.current = .fc-scroller-liquid-absolute (scrollTop 직접 설정)
  // - scrollHeight>clientHeight는 FC 소스에서 "unreliable" 명시 → selector로 직접 타겟
  useEffect(() => {
    let rafId: number
    const onMouseMove = (e: MouseEvent) => { mouseYRef.current = e.clientY }

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element
      if (target.closest('.fc-event')) isDraggingRef.current = true
    }
    const onPointerUp = () => { isDraggingRef.current = false }

    const tick = () => {
      if (isDraggingRef.current && wrapRef.current) {
        const scroller = wrapRef.current.querySelector<HTMLElement>(".fc-scroller-liquid-absolute")
        if (scroller) {
          const rect = scroller.getBoundingClientRect()
          const y = mouseYRef.current - rect.top
          const threshold = 80
          const speed = 20  // px/frame — 일반 스크롤과 유사한 속도
          if (y >= 0 && y < threshold) {
            scroller.scrollTop -= speed
          } else if (y > rect.height - threshold && y <= rect.height) {
            scroller.scrollTop += speed
          }
        }
      }
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true })
    window.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("pointerup", onPointerUp)
    rafId = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointerup", onPointerUp)
      cancelAnimationFrame(rafId)
    }
  }, [])

  // FC event ID = todoId (변하지 않음) — scheduleId는 낙관적 업데이트 시 임시값 → 실제값으로
  // 바뀌는데, ID가 바뀌면 FullCalendar가 다른 이벤트로 인식해 DOM을 교체하고 애니메이션이 두 번 재생됨.
  // todoId를 ID로 쓰면 scheduleId가 바뀌어도 FullCalendar는 동일 이벤트로 인식(위치만 업데이트).
  const fcEvents = scheduledTodos.map(todo => ({
    id: String(todo.id),
    title: todo.title,
    start: toDateTimeStr(dateStr, todo.startTime),
    end: toDateTimeStr(dateStr, todo.endTime),
    extendedProps: { todo, scheduleId: todo.scheduleId },
  }))

  const handleEventDrop = useCallback(async (info: EventDropArg) => {
    const scheduleId = info.event.extendedProps.scheduleId as number
    const start = info.event.start
    const end = info.event.end
    if (!start || !end) { info.revert(); return }
    const startTime = toTimeStr(start)
    const endTime = toTimeStr(end)
    try {
      await onEventDrop(scheduleId, startTime, endTime)
    } catch {
      info.revert()
    }
  }, [onEventDrop])

  const handleEventResize = useCallback(async (info: EventResizeDoneArg) => {
    const scheduleId = info.event.extendedProps.scheduleId as number
    const start = info.event.start
    const end = info.event.end
    if (!start || !end) { info.revert(); return }
    const startTime = toTimeStr(start)
    const endTime = toTimeStr(end)
    try {
      await onEventResize(scheduleId, startTime, endTime)
    } catch {
      info.revert()
    }
  }, [onEventResize])

  const handleEventReceive = useCallback(async (info: EventReceiveArg) => {
    const todoId = Number(info.event.extendedProps.todoId)
    const startTime = toTimeStr(info.event.start!)
    const endDt = info.event.end ?? new Date(info.event.start!.getTime() + 30 * 60 * 1000)
    const endTime = toTimeStr(endDt)
    // FC가 임시로 추가한 이벤트 제거 — 실제 이벤트는 schedules state가 주도
    info.event.remove()
    try {
      await onEventReceive(todoId, startTime, endTime)
    } catch {
      // 에러는 훅 내부에서 처리
    }
  }, [onEventReceive])

  const handleEventDragStart = useCallback((info: EventDragStartArg) => {
    isDraggingRef.current = true
    info.el.style.opacity = '0'
  }, [])

  const handleEventDragStop = useCallback((info: EventDragStopArg) => {
    isDraggingRef.current = false
    requestAnimationFrame(() => requestAnimationFrame(() => {
      info.el.style.opacity = ''
    }))
    if (!poolRef.current) return
    const { clientX, clientY } = info.jsEvent
    const rect = poolRef.current.getBoundingClientRect()
    if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
      info.event.remove()
      onUnschedule(info.event.extendedProps.scheduleId as number)
    }
  }, [poolRef, onUnschedule])

  const renderEventContent = useCallback((arg: EventContentArg) => {
    const todo: ScheduledTodo = arg.event.extendedProps.todo

    if (!todo) {
      // eventReceive 임시 이벤트 (isMirror=false) — 즉시 투명 처리하여 flicker 방지
      // 실제 이벤트는 state 업데이트 후 fcEvents를 통해 렌더링됨
      if (!arg.isMirror) return <div style={{ display: "none" }} />

      // 드래그 미리보기 (isMirror=true) — 풀 카드와 동일하게 렌더링
      const todoId = arg.event.extendedProps.todoId as number | undefined
      const sourceTodo = todoId != null ? unscheduledTodos.find(t => t.id === todoId) : undefined
      const categoryColor = sourceTodo?.category?.color ?? "hsl(var(--primary))"
      return (
        <div
          className="h-full w-full flex items-center gap-2 px-3 overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm opacity-90"
          style={{ borderLeftColor: categoryColor, borderLeftWidth: 3 }}
        >
          <span className="flex-1 font-medium text-xs leading-tight truncate">
            {arg.event.title}
          </span>
          {sourceTodo && (
            <Badge
              variant="outline"
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_META[sourceTodo.priority].badgeColor}`}
            >
              {PRIORITY_META[sourceTodo.priority].label}
            </Badge>
          )}
        </div>
      )
    }
    const categoryColor = todo.category?.color ?? "hsl(var(--primary))"
    return (
      <div
        className="h-full w-full flex items-center gap-2 px-2 overflow-hidden cursor-default rounded-md border-l-[3px] bg-background dark:bg-secondary shadow-sm"
        style={{
          borderLeftColor: categoryColor,
          borderTop: `0.5px solid color-mix(in srgb, ${categoryColor} 25%, transparent)`,
          borderRight: `0.5px solid color-mix(in srgb, ${categoryColor} 25%, transparent)`,
          borderBottom: `0.5px solid color-mix(in srgb, ${categoryColor} 25%, transparent)`,
        }}
        onClick={e => { e.stopPropagation(); onEdit(todo) }}
      >
        <div
          onPointerDown={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onToggle(todo) }}
          className="shrink-0"
        >
          <Checkbox checked={todo.completed} disabled={togglingIds.has(todo.id)} className="w-4 h-4 rounded-[4px]" />
        </div>
        <span className={`flex-1 text-xs font-medium leading-tight truncate ${todo.completed ? "line-through opacity-50" : ""}`}>
          {todo.title}
        </span>
        <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
          {todo.startTime.slice(0, 5)}–{todo.endTime.slice(0, 5)}
        </span>
        {todo.tags?.length > 0 && (
          <div className="hidden sm:flex items-center gap-1">
            {todo.tags.map(tag => (
              <span key={tag.id} className="text-[10px] font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border/50">
                #{tag.name}
              </span>
            ))}
          </div>
        )}
        {todo.category && (
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: todo.category.color }} />
            {todo.category.name}
          </div>
        )}
        <Badge
          variant="outline"
          className={`shrink-0 rounded-full px-1.5 py-0 text-[9px] font-semibold ${PRIORITY_META[todo.priority].badgeColor}`}
        >
          {PRIORITY_META[todo.priority].label}
        </Badge>
      </div>
    )
  }, [onEdit, onToggle, togglingIds])

  return (
    <div className={`${className} bg-card rounded-card border border-border/50 flex flex-col min-h-0 h-full overflow-hidden`}>
      <div className="px-4 pt-4 pb-3 shrink-0 border-b border-border/30">
        <h3 className="text-sm font-bold tracking-tight">오늘의 일정</h3>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div ref={wrapRef} className="flex-1 min-h-0 fc-planner-wrap">
          <FullCalendar
            ref={calendarRef}
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridDay"
            initialDate={dateStr}
            headerToolbar={false}
            allDaySlot={false}
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            slotDuration="00:10:00"
            snapDuration="00:10:00"
            editable
            droppable
            dragScroll={false}
            eventDragMinDistance={1}
            eventResizableFromStart
            dragRevertDuration={0}
            events={fcEvents}
            eventDragStart={handleEventDragStart}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            eventReceive={handleEventReceive}
            eventDragStop={handleEventDragStop}
            eventContent={renderEventContent}
            height="100%"
            slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          />
        </div>
      )}
    </div>
  )
}
