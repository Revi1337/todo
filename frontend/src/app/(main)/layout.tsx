import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/Sidebar"
import { AuthGuard } from "@/components/layout/AuthGuard"
import { FilterSheetProvider } from "@/contexts"
import { ScrollToTop } from "@/components/layout/ScrollToTop"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <FilterSheetProvider>
        <div className="flex min-h-screen">
          <Header />
          <Sidebar />
          <main className="flex-1 lg:pl-[260px] pt-16">
            <ScrollToTop />
            <div className="max-w-[1400px] mx-auto p-4 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </FilterSheetProvider>
    </AuthGuard>
  )
}
