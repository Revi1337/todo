"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, CheckSquare, Menu, LogOut, SlidersHorizontal } from "lucide-react"
import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SidebarNav } from "./Sidebar"
import { useAuth } from "@/hooks"
import { useFilterSheet } from "@/contexts"
import { usePathname } from "next/navigation"
import { LogoEasterEgg } from "./LogoEasterEgg"

export function Header() {
  const { setTheme, theme } = useTheme()
  const { logout } = useAuth()
  const { setOpen: setFilterOpen } = useFilterSheet()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-background/70 backdrop-blur-lg shadow-sm flex items-center justify-between px-4 md:px-6 border-b border-border/50">
      <div className="flex items-center gap-3 md:w-[260px]">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" />}>
            <Menu className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0 bg-background/70 backdrop-blur-lg shadow-sm flex flex-col border-r border-border/50">
            <SheetHeader className="p-4 border-b border-border/50 text-left shrink-0">
              <SheetTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary" />
                <span className="leading-none pt-[2px]">Todo</span>
              </SheetTitle>
            </SheetHeader>
            <div className="p-4 flex-1 min-h-0 overflow-y-auto">
              <SidebarNav onItemClick={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <LogoEasterEgg />
      </div>



      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        {pathname === "/" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFilterOpen(true)}
            className="xl:hidden rounded-full text-muted-foreground hover:text-foreground"
            title="필터"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          className="rounded-full text-muted-foreground hover:text-foreground"
          title="로그아웃"
        >
          <LogOut className="w-5 h-5" />
        </Button>
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full"
            title="테마 변경"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
        )}


      </div>
    </header>
  )
}
