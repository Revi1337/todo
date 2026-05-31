"use client"

import { useMemo } from "react"
import dayjs from "dayjs"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
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

function MonthlyTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const d = dayjs(payload[0].payload.date)
  return <div style={tooltipStyle}>{d.month() + 1}-{String(d.date()).padStart(2, '0')}: {payload[0].value} 완료</div>
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
                const day = parseInt(date.slice(8), 10)
                return day === 1 || day % 5 === 0
              })}
              tickFormatter={(v: string) => `${parseInt(v.slice(8), 10)}일`}
              interval="preserveStartEnd"
            />
            <YAxis axisLine={false} tickLine={false} fontSize={12} fontWeight={600} stroke="currentColor" opacity={0.6} />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Tooltip isAnimationActive={false} cursor={{ fill: 'var(--color-primary)', opacity: 0.05 }} content={MonthlyTooltip as any} />
            <Bar dataKey="completed" fill="#3b82f6" opacity={0.9} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
