"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Moon, Sun, CheckSquare, Menu } from "lucide-react"
import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SidebarNav } from "./Sidebar"

export function Header() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 glass flex items-center justify-between px-4 md:px-6 border-b border-border/50">
      <div className="flex items-center gap-3 md:w-[260px]">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" />}>
            <Menu className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0 glass">
            <SheetHeader className="p-4 border-b border-border/50 text-left">
              <SheetTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary" />
                <span className="leading-none pt-[2px]">Todo</span>
              </SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <SidebarNav onItemClick={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2 hidden lg:flex">
          <CheckSquare className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg tracking-tight leading-none pt-[2px]">Todo</span>
        </div>
      </div>



      <div className="flex items-center gap-2 md:gap-4 ml-auto">
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


      </div>
    </header>
  )
}
