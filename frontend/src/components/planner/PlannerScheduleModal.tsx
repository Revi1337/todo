"use client"

import { useState, useEffect } from "react"
import { Loader2, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Todo, ScheduledTodo } from "@/types"

interface PlannerScheduleModalProps {
  open: boolean
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
  open,
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
  const [loadingText, setLoadingText] = useState("")

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
    setLoadingText(isScheduled ? "일정을 변경하고 있습니다..." : "일정을 등록하고 있습니다...")
    setLoading(true)
    try {
      if (isScheduled) {
        await onUpdate(scheduledTodo!.scheduleId, toScheduleTime(startTime), toScheduleTime(endTime))
      } else {
        await onCreate(todo.id, toScheduleTime(startTime), toScheduleTime(endTime))
      }
      onClose()
    } catch {
      // 에러 toast는 훅 내부에서 처리, 모달 유지
    } finally {
      setLoading(false)
    }
  }

  const handleUnschedule = async () => {
    if (!scheduledTodo) return
    setLoadingText("일정을 삭제하고 있습니다...")
    setLoading(true)
    try {
      await onUnschedule(scheduledTodo.scheduleId)
      onClose()
    } catch {
      // 에러 toast는 훅 내부에서 처리, 모달 유지
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v && !loading) onClose() }}>
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
            <div className="relative flex items-center">
              <Clock className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="time"
                step="600"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                disabled={loading}
                className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">종료 시간</label>
            <div className="relative flex items-center">
              <Clock className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="time"
                step="600"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                disabled={loading}
                className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground w-full justify-center py-1">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{loadingText}</span>
            </div>
          ) : (
            <>
              {isScheduled && (
                <Button variant="outline" size="sm" onClick={handleUnschedule}>
                  일정 취소
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onClose}>
                닫기
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!startTime || !endTime}
              >
                {isScheduled ? "저장" : "등록"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
