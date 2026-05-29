"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function AuthGuard() {
  const router = useRouter()

  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        fetch("/api/auth/me")
          .then((r) => r.json())
          .then((data) => {
            if (data?.data !== true) router.replace("/login")
          })
          .catch(() => router.replace("/login"))
      }
    }
    const handleUnauthorized = () => router.replace("/login")

    window.addEventListener("pageshow", handlePageShow)
    window.addEventListener("unauthorized", handleUnauthorized)
    return () => {
      window.removeEventListener("pageshow", handlePageShow)
      window.removeEventListener("unauthorized", handleUnauthorized)
    }
  }, [router])

  return null
}
