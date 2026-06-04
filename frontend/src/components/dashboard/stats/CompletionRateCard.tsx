"use client"

import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress"

interface Props {
  rate: number
}

export function CompletionRateCard({ rate }: Props) {
  return (
    <div className="bg-card/50 p-6 rounded-card border border-border/50 shadow-sm flex flex-col justify-center backdrop-blur-sm">
      <h3 className="text-lg font-bold text-muted-foreground mb-6">전체 달성률</h3>
      <div className="flex items-end gap-2 mb-6">
        <span className="text-6xl font-black tracking-tighter text-primary">{rate}</span>
        <span className="text-2xl font-bold text-muted-foreground mb-2">%</span>
      </div>
      <Progress value={rate} className="w-full">
        <ProgressTrack className="h-4 rounded-full bg-muted/50">
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  )
}
