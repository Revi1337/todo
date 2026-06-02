"use client"

import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts"
import { type StatsData } from "@/hooks"

interface Props {
  categoryStats: StatsData["categoryStats"]
}

export function CategoryStatsCard({ categoryStats }: Props) {
  return (
    <div className="bg-card/50 p-6 rounded-card border border-border/50 shadow-sm md:col-span-1 backdrop-blur-sm">
      <h3 className="text-lg font-bold text-muted-foreground mb-4">카테고리별 현황</h3>
      <div className="h-[200px] w-full [&_svg]:outline-none">
        <ResponsiveContainer width="99%" height="100%">
          <PieChart>
            <Pie
              data={categoryStats.map(c => ({ ...c, fill: c.color }))}
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
        {categoryStats.map(cat => (
          <div key={cat.name} className="flex items-center gap-2 text-sm font-semibold">
            <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
            {cat.name}
          </div>
        ))}
      </div>
    </div>
  )
}
