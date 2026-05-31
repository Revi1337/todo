"use client"

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { DAY_MAP } from "@/constants/date"
import { StatsData } from "@/hooks/useStats"

type ChartTooltipProps = {
  active?: boolean
  payload?: ReadonlyArray<{ value?: number | string; payload: Record<string, string> }>
}

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

function WeeklyTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const raw = payload[0].payload.day
  const day = DAY_MAP[raw] ?? raw
  return <div style={tooltipStyle}>{day}요일: {payload[0].value} 완료</div>
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
            <Bar dataKey="completed" fill="#6366f1" radius={[6, 6, 6, 6]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
