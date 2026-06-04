"use client"

import { useMemo } from "react"
import dayjs from "dayjs"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { CHART_COLORS } from "@/constants/colors"
import { ChartTooltipProps, CHART_TOOLTIP_STYLE } from "@/lib/chartStyles"
import { type StatsData } from "@/hooks"

function MonthlyTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const d = dayjs(payload[0].payload.date)
  return <div style={CHART_TOOLTIP_STYLE}>{d.month() + 1}-{String(d.date()).padStart(2, '0')}: {payload[0].value} 완료</div>
}

interface Props {
  monthlyTrend: StatsData["monthlyTrend"]
}

export function MonthlyTrendChart({ monthlyTrend }: Props) {
  const fullMonthlyTrend = useMemo(() => {
    const start = dayjs().startOf('month')
    const daysInMonth = dayjs().daysInMonth()
    const map = new Map(monthlyTrend.map(t => [t.date, t]))
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dateStr = start.add(i, 'day').format('YYYY-MM-DD')
      return map.get(dateStr) || { date: dateStr, completed: 0 }
    })
  }, [monthlyTrend])

  return (
    <div className="bg-card/50 p-6 rounded-card border border-border/50 shadow-sm flex-1 backdrop-blur-sm">
      <h3 className="text-lg font-bold text-muted-foreground mb-6">이번 달 완료 추이</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="99%" height="100%" className="focus:outline-none">
          <BarChart data={fullMonthlyTrend} style={{ outline: 'none' }}>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              fontSize={12}
              fontWeight={600}
              tickMargin={12}
              stroke="currentColor"
              opacity={0.6}
              interval={0}
              tickFormatter={(v: string) => {
                const day = parseInt(v.slice(8), 10)
                return (day === 1 || day % 5 === 0) ? `${day}일` : ""
              }}
            />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Tooltip isAnimationActive={false} cursor={{ fill: 'var(--color-primary)', opacity: 0.05 }} content={MonthlyTooltip as any} />
            <Bar dataKey="completed" fill={CHART_COLORS.monthly} opacity={0.9} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
