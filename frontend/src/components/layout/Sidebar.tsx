"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { title: "대시보드", href: "/", icon: LayoutDashboard },
  { title: "캘린더", href: "/calendar", icon: Calendar },
  { title: "통계", href: "/stats", icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[260px] h-screen fixed top-0 left-0 pt-20 pb-6 px-4 flex flex-col glass z-40 border-r border-border/50">
      <nav className="flex flex-col gap-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
