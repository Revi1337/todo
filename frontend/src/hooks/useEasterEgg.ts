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

    const faviconUrl = '/favicon.ico'
    await fetch(faviconUrl, { cache: 'no-store' })
    const entry = performance.getEntriesByName(
      location.origin + faviconUrl
    ).at(-1) as PerformanceResourceTiming | undefined
    const browserVercel = entry ? Math.round(entry.responseStart - entry.requestStart) : 0

    const res = await fetch(`/api/timing?path=${encodeURIComponent(apiPath)}`)
    const { vercelGcp, gcpSupabase } = await res.json()

    setLatency({ browserVercel, vercelGcp, gcpSupabase })
    setVisible(true)
    setTimeout(() => setVisible(false), 4000)
  }, [apiPath])

  return { latency, visible, handleClick }
}
