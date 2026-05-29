import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'

export interface StatsData {
  completionRate: number
  categoryStats: { name: string; value: number; color: string }[]
  weeklyTrend: { day: string; completed: number }[]
  monthlyTrend: { date: string; completed: number }[]
}

export function useStats() {
  const { data, error, isLoading } = useSWR<StatsData>('/api/stats', fetcher)

  return { 
    stats: data, 
    isLoading, 
    isError: error 
  }
}
