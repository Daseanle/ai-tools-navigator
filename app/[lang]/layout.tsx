import "@/app/globals.css"
import type React from "react"
import { Suspense } from "react"
import AppHeader from "@/components/app-header"
import AppFooter from "@/components/app-footer"
import PWAInstaller from "@/components/pwa-installer"
import MobileNavigation from "@/components/mobile-navigation"
import ThemeProvider from "@/components/providers/theme-provider"
import { FavoritesProvider } from "@/components/providers/favorites-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import type { Metadata, Viewport } from "next"

// 使用系统字体
const inter = {
  className: "font-sans",
}

// 分离 metadata 和 viewport
export const metadata: Metadata = {
  title: "AI Navigator Pro - 你的AI工具决策中心",
  description: "探索、评测、精通。为你找到解决问题的最佳AI工具。发现ChatGPT、Midjourney等热门AI工具，提升工作效率。",
  keywords: ["AI工具", "ChatGPT", "Midjourney", "AI导航", "人工智能", "AI应用", "工具推荐"],
  manifest: "/manifest.json",
  openGraph: {
    title: "AI Navigator Pro - 你的AI工具决策中心",
    description: "探索、评测、精通。为你找到解决问题的最佳AI工具。",
    type: "website",
    locale: "zh_CN",
    siteName: "AI Navigator Pro",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Navigator Pro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Navigator Pro - 你的AI工具决策中心",
    description: "探索、评测、精通。为你找到解决问题的最佳AI工具。",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

// 新的 viewport 导出
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1d1f" },
  ],
}

export default function RootLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  return (
    <html lang={lang} className="dark" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AI Navigator" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1d1d1f" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <FavoritesProvider>
              <div className="min-h-screen flex flex-col bg-neutral-950">
                {/* 桌面端导航 */}
                <div className="hidden lg:block">
                  <Suspense fallback={<div className="h-16 bg-neutral-900" />}>
                    <AppHeader />
                  </Suspense>
                </div>

                {/* 移动端导航 */}
                <Suspense fallback={<div className="h-16 bg-neutral-900 lg:hidden" />}>
                  <MobileNavigation />
                </Suspense>

                {/* 主要内容区域 */}
                <main className="flex-1 pt-16 lg:pt-0 pb-16 lg:pb-0">
                  <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>{children}</Suspense>
                </main>

                {/* 桌面端页脚 */}
                <div className="hidden lg:block">
                  <Suspense fallback={<div className="h-32 bg-neutral-900" />}>
                    <AppFooter />
                  </Suspense>
                </div>
              </div>

              {/* PWA 安装提示 */}
              <PWAInstaller />
            </FavoritesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
