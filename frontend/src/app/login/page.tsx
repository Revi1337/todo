"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckSquare } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const { login, loading, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(password)
  }

  return (
    <div className="flex items-center justify-center h-[calc(100vh-8rem)] bg-transparent">
      <div className="w-full max-w-md p-8 bg-card/80 backdrop-blur-md rounded-[24px] shadow-2xl border border-border/50 hover:shadow-primary/5 transition-all">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <CheckSquare className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Todo 로그인</h1>
          <p className="text-sm text-muted-foreground mt-2">나만의 생산성 갤러리에 오신 것을 환영합니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input 
              id="password"
              type="password"
              placeholder="••••••••"
              className="bg-background/50 h-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          
          <Button type="submit" disabled={loading} className="w-full h-11 text-base font-semibold rounded-xl">
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </div>
    </div>
  )
}
