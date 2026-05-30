"use client"

import { useMemo } from "react"
import dayjs from "dayjs"
import { useStats } from "@/hooks/useStats"
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Progress } from "@/components/ui/progress"
import { DAY_MAP } from "@/constants/date"

const tooltipStyle = {
  borderRadius: '16px',
  border: '1px solid rgba(128,128,128,0.2)',
  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.15)',
  background: 'var(--color-card)',
  color: 'var(--color-card-foreground)',
  padding: '8px 14px',
  fontSize: '13px',
  fontWeight: 600,
}

type ChartTooltipProps = { active?: boolean; payload?: ReadonlyArray<{ value?: number | string; payload: Record<string, string> }> }


function WeeklyTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const raw = payload[0].payload.day
  const day = DAY_MAP[raw] ?? raw
  return <div style={tooltipStyle}>{day}요일: {payload[0].value} 완료</div>
}

function MonthlyTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const d = dayjs(payload[0].payload.date)
  return <div style={tooltipStyle}>{d.month() + 1}-{String(d.date()).padStart(2, '0')}: {payload[0].value} 완료</div>
}

export function StatsView() {
  const { stats, isLoading } = useStats()

  const fullMonthlyTrend = useMemo(() => {
    if (!stats?.monthlyTrend) return []
    const start = dayjs().startOf('month')
    const daysInMonth = dayjs().daysInMonth()
    const map = new Map(stats.monthlyTrend.map(t => [t.date, t]))

    return Array.from({ length: daysInMonth }, (_, i) => {
      const dateStr = start.add(i, 'day').format('YYYY-MM-DD')
      return map.get(dateStr) || { date: dateStr, completed: 0 }
    })
  }, [stats?.monthlyTrend])

  if (isLoading || !stats) {
    return <div className="p-8 flex justify-center text-muted-foreground">로딩 중...</div>
  }

  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">통계 대시보드</h2>
        <p className="text-muted-foreground">당신의 생산성 현황을 한눈에 확인하세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Completion Rate */}
        <div className="bg-card/50 p-6 rounded-card border border-border/50 shadow-sm flex flex-col justify-center backdrop-blur-sm">
          <h3 className="text-lg font-bold text-muted-foreground mb-6">전체 달성률</h3>
          <div className="flex items-end gap-2 mb-6">
            <span className="text-6xl font-black tracking-tighter text-primary">{stats.completionRate}</span>
            <span className="text-2xl font-bold text-muted-foreground mb-2">%</span>
          </div>
          <Progress value={stats.completionRate} className="h-4 rounded-full bg-muted/50" />
        </div>

        {/* Category Stats */}
        <div className="bg-card/50 p-6 rounded-card border border-border/50 shadow-sm md:col-span-1 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-muted-foreground mb-4">카테고리별 현황</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="99%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryStats.map(c => ({ ...c, fill: c.color }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={10}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-5 mt-4">
            {stats.categoryStats.map(cat => (
              <div key={cat.name} className="flex items-center gap-2 text-sm font-semibold">
                <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                {cat.name}
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-card/50 p-6 rounded-card border border-border/50 shadow-sm backdrop-blur-sm">
          <h3 className="text-lg font-bold text-muted-foreground mb-6">이번 주 완료 추이</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={stats.weeklyTrend}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={13} fontWeight={600} tickMargin={12} stroke="currentColor" opacity={0.6} tickFormatter={(v: string) => DAY_MAP[v] ?? v} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Tooltip cursor={{ fill: 'var(--color-primary)', opacity: 0.05 }} content={WeeklyTooltip as any} />
                <Bar dataKey="completed" fill="#6366f1" radius={[6, 6, 6, 6]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-card/50 p-6 rounded-card border border-border/50 shadow-sm flex-1 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-muted-foreground mb-6">이번 달 완료 추이</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="99%" height="100%">
            <BarChart data={fullMonthlyTrend}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                fontSize={12}
                fontWeight={600}
                tickMargin={12}
                stroke="currentColor"
                opacity={0.6}
                ticks={fullMonthlyTrend.map(d => d.date).filter(date => {
                  const day = parseInt(date.slice(8), 10);
                  return day === 1 || day % 5 === 0;
                })}
                tickFormatter={(v: string) => `${parseInt(v.slice(8), 10)}일`}
                interval="preserveStartEnd"
              />
              <YAxis axisLine={false} tickLine={false} fontSize={12} fontWeight={600} stroke="currentColor" opacity={0.6} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Tooltip cursor={{ fill: 'var(--color-primary)', opacity: 0.05 }} content={MonthlyTooltip as any} />
              <Bar dataKey="completed" fill="#3b82f6" opacity={0.9} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
