"use client"

import { useStats } from "@/hooks/useStats"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { CompletionRateCard } from "./stats/CompletionRateCard"
import { CategoryStatsCard } from "./stats/CategoryStatsCard"
import { WeeklyTrendChart } from "./stats/WeeklyTrendChart"
import { MonthlyTrendChart } from "./stats/MonthlyTrendChart"

export function StatsView() {
  const { stats, isLoading } = useStats()

  if (isLoading || !stats) return <LoadingSpinner />

  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">통계 대시보드</h2>
        <p className="text-muted-foreground">당신의 생산성 현황을 한눈에 확인하세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CompletionRateCard rate={stats.completionRate} />
        <CategoryStatsCard categoryStats={stats.categoryStats} />
        <WeeklyTrendChart weeklyTrend={stats.weeklyTrend} />
      </div>

      <MonthlyTrendChart monthlyTrend={stats.monthlyTrend} />
    </div>
  )
}
