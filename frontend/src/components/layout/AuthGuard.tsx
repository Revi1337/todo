"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  // 미들웨어가 서버에서 이미 검증했으므로 초기엔 인증된 것으로 가정 (정상 로드 시 깜빡임 방지)
  const [authed, setAuthed] = useState(true)

  useEffect(() => {
    const goLogin = () => {
      setAuthed(false)
      router.replace("/login")
    }

    const verify = () =>
      fetch("/api/auth/me", { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          if (data?.data === true) setAuthed(true)
          else goLogin()
        })
        .catch(goLogin)

    // 마운트(하드 로드/일반 재네비게이션) 시 검증
    verify()
    // bfcache 복원은 마운트가 일어나지 않으므로 pageshow로 별도 검증
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) verify()
    }
    window.addEventListener("pageshow", handlePageShow)
    window.addEventListener("unauthorized", goLogin)
    return () => {
      window.removeEventListener("pageshow", handlePageShow)
      window.removeEventListener("unauthorized", goLogin)
    }
  }, [router])

  if (!authed) return null
  return <>{children}</>
}
