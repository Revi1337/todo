"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckSquare, Moon, Sun } from "lucide-react"
import { useAuth } from "@/hooks"
import { useTheme } from "next-themes"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const { login, loading, error } = useAuth()
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 로그인 페이지에서 뒤로가기 차단: 히스토리에 현재 엔트리를 밀어넣고
  // popstate(뒤로가기/앞으로가기) 발생 시 다시 밀어넣어 이 페이지에 머물게 함
  useEffect(() => {
    window.history.pushState(null, '', '/login')
    const onPopState = () => window.history.pushState(null, '', '/login')
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(password)
  }

  return (
    <>
      {mounted && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="fixed top-6 right-6 rounded-full z-50 bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-muted"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>
      )}
      <div className="flex items-center justify-center h-[calc(100vh-8rem)] bg-transparent">
        <div className="w-full max-w-md p-8 bg-card/80 backdrop-blur-md rounded-[24px] shadow-2xl border border-border/50 hover:shadow-primary/5 transition-all">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <CheckSquare className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Todo 로그인</h1>
            <p className="text-sm text-muted-foreground mt-2">당신만의 할 일을 정리하고, 하루를 완성하세요.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-3">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-background/50 h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full h-11 text-base font-semibold rounded-xl">
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
