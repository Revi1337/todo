import type { Priority } from "@/types"

export const PRIORITY_META: Record<Priority, { label: string; badgeColor: string; buttonColor: string }> = {
  HIGH: {
    label: "긴급",
    badgeColor: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/40",
    buttonColor: "text-red-500 bg-red-500/10 border-red-500/40 data-[active=true]:bg-red-500 data-[active=true]:text-white",
  },
  MEDIUM: {
    label: "보통",
    badgeColor: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/40",
    buttonColor: "text-yellow-500 bg-yellow-500/10 border-yellow-500/40 data-[active=true]:bg-yellow-500 data-[active=true]:text-white",
  },
  LOW: {
    label: "낮음",
    badgeColor: "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 border-slate-500/40",
    buttonColor: "text-slate-500 bg-slate-500/10 border-slate-500/40 data-[active=true]:bg-slate-500 data-[active=true]:text-white",
  },
}
