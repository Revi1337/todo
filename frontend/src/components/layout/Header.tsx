"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Moon, Sun, Search, CheckSquare } from "lucide-react"
import { useEffect, useState } from "react"

export function Header() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 glass flex items-center justify-between px-6 border-b border-border/50">
      <div className="flex items-center gap-3 w-[260px]">
        <CheckSquare className="w-6 h-6 text-primary" />
        <span className="font-bold text-lg tracking-tight">Vibe Todo</span>
      </div>
      
      <div className="flex-1 max-w-xl mx-auto px-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="검색어를 입력하세요..." 
            className="w-full pl-10 bg-background/50 border-border/50 focus-visible:ring-primary backdrop-blur-md"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
        )}
        
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
