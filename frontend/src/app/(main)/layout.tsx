import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/Sidebar"
import { AuthGuard } from "@/components/layout/AuthGuard"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AuthGuard />
      <Header />
      <Sidebar />
      <main className="flex-1 lg:pl-[260px] pt-16">
        <div className="max-w-[1400px] mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
