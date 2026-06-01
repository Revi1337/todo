"use client"

import Link from "next/link"
import { CheckSquare } from "lucide-react"
import { useEasterEgg } from "@/hooks/useEasterEgg"
import { LatencyPopup } from "./LatencyPopup"

export function LogoEasterEgg() {
  const { latency, visible, handleClick } = useEasterEgg('/api/health')

  return (
    <div className="relative">
      <Link href="/" className="hidden lg:flex items-center gap-2" onClick={handleClick}>
        <CheckSquare className="w-6 h-6 text-primary" />
        <span className="font-bold text-lg tracking-tight leading-none pt-[2px]">Todo</span>
      </Link>
      {visible && latency && <LatencyPopup latency={latency} />}
    </div>
  )
}
