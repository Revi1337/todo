import { LatencyInfo } from "@/hooks/useEasterEgg"

export function LatencyPopup({ latency }: { latency: LatencyInfo }) {
  return (
    <div className="absolute top-8 left-0 z-50 bg-popover border border-border rounded-lg p-3 shadow-lg text-xs font-mono whitespace-nowrap">
      <p className="text-muted-foreground mb-1">🌐 Latency</p>
      <p>Browser → Vercel: <span className="text-primary">{latency.browserVercel}ms</span></p>
      <p>Vercel → GCP &nbsp;&nbsp;&nbsp;: <span className="text-primary">{latency.vercelGcp}ms</span></p>
      <p>GCP → Supabase &nbsp;: <span className="text-primary">{latency.gcpSupabase}ms</span></p>
    </div>
  )
}
