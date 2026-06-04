"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, BarChart3, CalendarClock, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEasterEgg } from "@/hooks"
import { LatencyPopup } from "./LatencyPopup"

const navItems = [
  { title: "대시보드", href: "/", icon: LayoutDashboard, apiPath: "/api/todos" },
  { title: "캘린더", href: "/calendar", icon: Calendar, apiPath: "/api/todos" },
  { title: "플래너", href: "/planner", icon: CalendarClock, apiPath: "/api/todos" },
  { title: "통계", href: "/stats", icon: BarChart3, apiPath: "/api/stats" },
]

function NavItem({
  title, href, icon: Icon, apiPath, onItemClick, isActive,
}: {
  title: string
  href: string
  icon: LucideIcon
  apiPath: string
  onItemClick?: () => void
  isActive: boolean
}) {
  const { latency, visible, handleClick } = useEasterEgg(apiPath)

  return (
    <div className="relative">
      <Link
        href={href}
        onClick={() => { handleClick(); onItemClick?.() }}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className="w-5 h-5" />
        {title}
      </Link>
      {visible && latency && <LatencyPopup latency={latency} />}
    </div>
  )
}

export function SidebarNav({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-2 h-full">
      <div className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={pathname === item.href}
            onItemClick={onItemClick}
          />
        ))}
      </div>
    </nav>
  )
}

export function Sidebar() {
  return (
    <aside className="w-[260px] h-screen fixed top-0 left-0 pt-20 pb-6 px-4 hidden lg:flex flex-col bg-background/70 backdrop-blur-lg z-40 border-r border-border/50 shadow-sm">
      <div className="mt-4 flex-1 min-h-0">
        <SidebarNav />
      </div>
    </aside>
  )
}
