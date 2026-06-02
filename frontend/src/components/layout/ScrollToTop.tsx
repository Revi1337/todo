"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // 브라우저(특히 iOS Safari)의 자동 스크롤 복원을 차단
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual"
    }
  }, [])

  useEffect(() => {
    // Radix UI의 Sheet/Dialog가 닫히면서 이전 스크롤 위치를 복원하는 동작이 끝난 후
    // 스크롤을 맨 위로 올리기 위해 약간의 지연(setTimeout)을 줍니다.
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    }, 10)

    return () => clearTimeout(timeoutId)
  }, [pathname])

  return null
}
