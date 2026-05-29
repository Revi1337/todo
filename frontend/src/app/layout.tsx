import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Todo Dashboard",
  description: "A highly refined, premium personal dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen mesh-bg text-foreground selection:bg-primary/30`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen">
            <Header />
            <Sidebar />
            <main className="flex-1 pl-[260px] pt-16">
              <div className="max-w-[1400px] mx-auto p-6 md:p-8">
                {children}
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
