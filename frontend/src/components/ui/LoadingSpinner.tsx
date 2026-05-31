import { Loader2 } from "lucide-react"

export function LoadingSpinner() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <span className="text-sm font-medium">데이터를 불러오는 중입니다...</span>
    </div>
  )
}
