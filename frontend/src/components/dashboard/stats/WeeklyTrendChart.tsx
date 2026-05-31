"use client"

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { DAY_MAP } from "@/constants/date"
import { CHART_COLORS } from "@/constants/colors"
import { ChartTooltipProps, CHART_TOOLTIP_STYLE } from "@/lib/chartStyles"
import { StatsData } from "@/hooks/useStats"

function WeeklyTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const raw = payload[0].payload.day
  const day = DAY_MAP[raw] ?? raw
  return <div style={CHART_TOOLTIP_STYLE}>{day}요일: {payload[0].value} 완료</div>
}

interface Props {
  weeklyTrend: StatsData["weeklyTrend"]
}

export function WeeklyTrendChart({ weeklyTrend }: Props) {
  return (
    <div className="bg-card/50 p-6 rounded-card border border-border/50 shadow-sm backdrop-blur-sm">
      <h3 className="text-lg font-bold text-muted-foreground mb-6">이번 주 완료 추이</h3>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="99%" height="100%">
          <BarChart data={weeklyTrend}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={13} fontWeight={600} tickMargin={12} stroke="currentColor" opacity={0.6} tickFormatter={(v: string) => DAY_MAP[v] ?? v} />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Tooltip isAnimationActive={false} cursor={{ fill: 'var(--color-primary)', opacity: 0.05 }} content={WeeklyTooltip as any} />
            <Bar dataKey="completed" fill={CHART_COLORS.weekly} radius={[6, 6, 6, 6]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
