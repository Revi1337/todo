"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Todo } from "@/types"
import { ScheduledTodo } from "@/hooks/usePlannerTodos"

interface PlannerScheduleModalProps {
  todo: (Todo | ScheduledTodo) | null
  scheduledTodo?: ScheduledTodo
  onClose: () => void
  onCreate: (todoId: number, startTime: string, endTime: string) => Promise<void>
  onUpdate: (scheduleId: number, startTime: string, endTime: string) => Promise<void>
  onUnschedule: (scheduleId: number) => Promise<void>
}

function toInputTime(timeStr: string): string {
  return timeStr.slice(0, 5)
}

function toScheduleTime(inputTime: string): string {
  return `${inputTime}:00`
}

export function PlannerScheduleModal({
  todo,
  scheduledTodo,
  onClose,
  onCreate,
  onUpdate,
  onUnschedule,
}: PlannerScheduleModalProps) {
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (scheduledTodo) {
      setStartTime(toInputTime(scheduledTodo.startTime))
      setEndTime(toInputTime(scheduledTodo.endTime))
    } else {
      setStartTime("")
      setEndTime("")
    }
  }, [todo, scheduledTodo])

  const isScheduled = !!scheduledTodo

  const handleSave = async () => {
    if (!todo || !startTime || !endTime) return
    setLoading(true)
    try {
      if (isScheduled) {
        await onUpdate(scheduledTodo!.scheduleId, toScheduleTime(startTime), toScheduleTime(endTime))
      } else {
        await onCreate(todo.id, toScheduleTime(startTime), toScheduleTime(endTime))
      }
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleUnschedule = async () => {
    if (!scheduledTodo) return
    setLoading(true)
    try {
      await onUnschedule(scheduledTodo.scheduleId)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={!!todo} onOpenChange={open => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>일정 설정</DialogTitle>
          {todo && (
            <div className="pt-1 space-y-2">
              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">제목</p>
                <p className="text-sm truncate">{todo.title}</p>
              </div>
              {todo.description && (
                <div className="space-y-0.5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">설명</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{todo.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">시작 시간</label>
            <input
              type="time"
              step="600"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">종료 시간</label>
            <input
              type="time"
              step="600"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          {isScheduled && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleUnschedule}
              disabled={loading}
              className="mr-auto"
            >
              일정 취소
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            닫기
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={loading || !startTime || !endTime}
          >
            {isScheduled ? "저장" : "등록"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
