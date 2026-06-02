import { useState, useEffect, useCallback } from 'react'
import type { Dayjs } from 'dayjs'
import { fetcher, fetchWithAuth } from '@/lib/fetcher'
import { TodoSchedule, ScheduleRequest, ScheduleUpdateRequest } from '@/types'

export function useTodoSchedules(date: Dayjs) {
  const dateStr = date.format('YYYY-MM-DD')
  const [schedules, setSchedules] = useState<TodoSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [prevDate, setPrevDate] = useState(dateStr)

  if (dateStr !== prevDate) {
    setPrevDate(dateStr)
    setSchedules([])
    setIsLoading(true)
  }

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetcher(`/api/todo-schedules?date=${dateStr}`)
      .then((result: TodoSchedule[]) => { if (!cancelled) setSchedules(result) })
      .catch(() => { if (!cancelled) setSchedules([]) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [dateStr])

  const refetch = useCallback(async () => {
    try {
      const result: TodoSchedule[] = await fetcher(`/api/todo-schedules?date=${dateStr}`)
      setSchedules(result)
    } catch {
      // silently fail — 기존 데이터 유지
    }
  }, [dateStr])

  const createSchedule = useCallback(async (request: ScheduleRequest): Promise<TodoSchedule> => {
    return fetchWithAuth('/api/todo-schedules', {
      method: 'POST',
      body: JSON.stringify(request),
    }) as Promise<TodoSchedule>
  }, [])

  const updateSchedule = useCallback(async (id: number, request: ScheduleUpdateRequest): Promise<TodoSchedule> => {
    return fetchWithAuth(`/api/todo-schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    }) as Promise<TodoSchedule>
  }, [])

  const deleteSchedule = useCallback(async (id: number): Promise<void> => {
    await fetchWithAuth(`/api/todo-schedules/${id}`, { method: 'DELETE' })
  }, [])

  return {
    schedules,
    setSchedules,
    isLoading,
    refetch,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  }
}
