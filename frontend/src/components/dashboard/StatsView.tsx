"use client"

import React from "react"
import { useStats } from "@/hooks/useStats"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Progress } from "@/components/ui/progress"

export function StatsView() {
  const { stats, isLoading } = useStats()

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
        <div className="bg-card/50 p-6 rounded-[24px] border border-border/50 shadow-sm flex flex-col justify-center backdrop-blur-sm">
          <h3 className="text-lg font-bold text-muted-foreground mb-6">전체 달성률</h3>
          <div className="flex items-end gap-2 mb-6">
            <span className="text-6xl font-black tracking-tighter text-primary">{stats.completionRate}</span>
            <span className="text-2xl font-bold text-muted-foreground mb-2">%</span>
          </div>
          <Progress value={stats.completionRate} className="h-4 rounded-full bg-muted/50" />
        </div>

        {/* Category Stats */}
        <div className="bg-card/50 p-6 rounded-[24px] border border-border/50 shadow-sm md:col-span-1 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-muted-foreground mb-4">카테고리별 현황</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={10}
                >
                  {stats.categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
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
        <div className="bg-card/50 p-6 rounded-[24px] border border-border/50 shadow-sm backdrop-blur-sm">
          <h3 className="text-lg font-bold text-muted-foreground mb-6">이번 주 완료 추이</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyTrend}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={13} fontWeight={600} tickMargin={12} stroke="currentColor" opacity={0.6} />
                <Tooltip 
                  cursor={{ fill: 'var(--color-primary)', opacity: 0.05 }}
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="completed" fill="#6366f1" radius={[6, 6, 6, 6]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-card/50 p-6 rounded-[24px] border border-border/50 shadow-sm flex-1 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-muted-foreground mb-6">이번 달 완료 추이</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.monthlyTrend}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} fontWeight={600} tickMargin={12} minTickGap={10} stroke="currentColor" opacity={0.6} />
              <YAxis axisLine={false} tickLine={false} fontSize={12} fontWeight={600} stroke="currentColor" opacity={0.6} />
              <Tooltip 
                cursor={{ fill: 'var(--color-primary)', opacity: 0.05 }}
                contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="completed" fill="#3b82f6" opacity={0.9} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
