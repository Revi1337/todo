import { StatsView } from "@/components/dashboard/StatsView"

export default function StatsPage() {
  return (
    <div className="h-[calc(100dvh-8rem)] overflow-y-auto scrollbar-hide pb-20">
      <StatsView />
    </div>
  )
}
