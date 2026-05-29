"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckSquare } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Mock login attempt")
    router.push("/")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 bg-card rounded-[24px] shadow-lg border border-border/50">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <CheckSquare className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Vibe Todo 로그인</h1>
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
              required
            />
          </div>
          
          <Button type="submit" className="w-full h-11 text-base font-semibold rounded-xl">
            로그인
          </Button>
        </form>
      </div>
    </div>
  )
}
