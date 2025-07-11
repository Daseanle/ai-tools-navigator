import type { Metadata } from 'next'
import './globals.css'
import '@/lib/polyfills' // Import polyfills first
import { ErrorBoundary } from '@/components/error-boundary'
import { FavoritesProvider } from '@/components/providers/favorites-provider'
import PWAInstaller from '@/components/pwa-installer'
import { BehaviorTracker } from '@/components/behavior-tracker'

export const metadata: Metadata = {
  title: 'AI Navigator Pro - 智能AI工具导航平台',
  description: '发现、评测、精通最新AI工具，提升工作效率的智能导航平台',
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: ['AI工具', '人工智能', 'AI导航', '工具推荐', '效率工具'],
  authors: [{ name: 'AI Navigator Team' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1e40af' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI Navigator',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AI Navigator" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#1e40af" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body>
        <FavoritesProvider>
          <ErrorBoundary>
            {children}
            <PWAInstaller />
            <BehaviorTracker />
          </ErrorBoundary>
        </FavoritesProvider>
      </body>
    </html>
  )
}
