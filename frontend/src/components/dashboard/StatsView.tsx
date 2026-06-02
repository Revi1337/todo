"use client"

import { useStats } from "@/hooks"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { CompletionRateCard } from "./stats/CompletionRateCard"
import { CategoryStatsCard } from "./stats/CategoryStatsCard"
import { WeeklyTrendChart } from "./stats/WeeklyTrendChart"
import { MonthlyTrendChart } from "./stats/MonthlyTrendChart"

export function StatsView() {
  const { stats, isLoading } = useStats()

  return (
    <div className="flex flex-col gap-6 min-h-full pb-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">통계 대시보드</h2>
        <p className="text-muted-foreground">당신의 생산성 현황을 한눈에 확인하세요.</p>
      </div>

      {isLoading || !stats ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-card rounded-[24px] border border-border/50 shadow-sm">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CompletionRateCard rate={stats.completionRate} />
            <CategoryStatsCard categoryStats={stats.categoryStats} />
            <WeeklyTrendChart weeklyTrend={stats.weeklyTrend} />
          </div>

          <MonthlyTrendChart monthlyTrend={stats.monthlyTrend} />
        </>
      )}
    </div>
  )
}
