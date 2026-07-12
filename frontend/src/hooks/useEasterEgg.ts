"use client"

import { useState, useRef, useCallback } from "react"

export interface LatencyInfo {
  browserVercel: number
  vercelGcp: number
  gcpSupabase: number
}

export function useEasterEgg(apiPath: string) {
  const [latency, setLatency] = useState<LatencyInfo | null>(null)
  const [visible, setVisible] = useState(false)
  const clickCount = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleClick = useCallback(async () => {
    if (clickCount.current === 0) {
      timer.current = setTimeout(() => { clickCount.current = 0 }, 2000)
    }
    if (++clickCount.current < 5) return
    clearTimeout(timer.current!)
    clickCount.current = 0

    // Vercel Edge 캐시 테스트를 위해 public 폴더에 실제로 존재하는 초경량 파일(385 Byte)을 호출
    const targetStaticFile = '/window.svg'
    await fetch(targetStaticFile, { cache: 'no-store' })
    const entry = performance.getEntriesByName(
      location.origin + targetStaticFile
    ).at(-1) as PerformanceResourceTiming | undefined
    const browserVercel = entry ? Math.round(entry.responseStart - entry.requestStart) : 0

    // apiPath를 직접 호출 (Vercel Edge Function을 거치지 않고 rewrites()로 GCP까지 프록시)
    const start = performance.now()
    const res = await fetch(apiPath, { cache: 'no-store' })
    const totalFetchTime = Math.round(performance.now() - start)

    const gcpSupabase = parseFloat(res.headers.get('X-Db-Timing') ?? '0') || 0
    const vercelGcp = Math.max(0, totalFetchTime - gcpSupabase)

    setLatency({ browserVercel, vercelGcp, gcpSupabase })
    setVisible(true)
    setTimeout(() => setVisible(false), 4000)
  }, [apiPath])

  return { latency, visible, handleClick }
}
