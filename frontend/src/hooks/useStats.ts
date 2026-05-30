import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { StatsResponse } from '@/types'
import { CATEGORY_COLORS } from '@/constants/colors'

export interface StatsData {
  totalCount: number
  completedCount: number
  completionRate: number
  categoryStats: { name: string; value: number; color: string }[]
  weeklyTrend: { day: string; completed: number }[]
  monthlyTrend: { date: string; completed: number }[]
}

function adapt(raw: StatsResponse): StatsData {
  return {
    totalCount: raw.totalCount,
    completedCount: raw.completedCount,
    completionRate: raw.completionRate,
    categoryStats: raw.byCategory.map((c, i) => ({
      name: c.categoryName,
      value: c.total,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    })),
    weeklyTrend: raw.weeklyTrend.map(d => ({ day: d.day ?? d.date, completed: d.count })),
    monthlyTrend: raw.monthlyTrend.map(d => ({ date: d.date, completed: d.count })),
  }
}

export function useStats() {
  const { data, error, isLoading } = useSWR<StatsResponse>('/api/stats', fetcher)

  return {
    stats: data ? adapt(data) : undefined,
    isLoading,
    isError: error,
  }
}
