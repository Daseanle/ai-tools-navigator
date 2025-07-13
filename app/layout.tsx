import type { Metadata } from 'next'
import './globals.css'
import '@/lib/polyfills' // Import polyfills first
import { ErrorBoundary } from '@/components/error-boundary'
import { FavoritesProvider } from '@/components/providers/favorites-provider'
import PWAInstaller from '@/components/pwa-installer'
import { BehaviorTracker } from '@/components/behavior-tracker'

export const metadata: Metadata = {
  title: {
    default: 'AI Tools Navigator - Discover the Best AI Tools',
    template: '%s | AI Tools Navigator'
  },
  description: 'Discover, compare, and find the perfect AI tools for your projects. Our comprehensive directory features the latest artificial intelligence applications, machine learning platforms, and automation tools.',
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: [
    'AI tools', 'artificial intelligence', 'machine learning', 'AI directory', 
    'AI applications', 'automation tools', 'AI software', 'productivity tools',
    'content generation', 'data analysis', 'computer vision', 'NLP tools'
  ],
  authors: [{ name: 'AI Tools Navigator Team' }],
  creator: 'AI Tools Navigator',
  publisher: 'AI Tools Navigator',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
    title: 'AI Tools Navigator',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'AI Tools Navigator',
    title: 'AI Tools Navigator - Discover the Best AI Tools',
    description: 'Comprehensive directory of AI tools and applications. Find the perfect AI solution for your needs.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Tools Navigator - Discover the Best AI Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Tools Navigator - Discover the Best AI Tools',
    description: 'Comprehensive directory of AI tools and applications. Find the perfect AI solution for your needs.',
    images: ['/og-image.jpg'],
    creator: '@aitools_nav',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  ...(process.env.GOOGLE_VERIFICATION_CODE && {
    verification: {
      google: process.env.GOOGLE_VERIFICATION_CODE,
    },
  }),
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL,
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
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "AI Tools Navigator",
              "alternateName": "AI Directory",
              "url": process.env.NEXT_PUBLIC_SITE_URL,
              "description": "Comprehensive directory of AI tools and applications",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL}/tools?search={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "AI Tools Navigator",
                "url": process.env.NEXT_PUBLIC_SITE_URL
              }
            })
          }}
        />
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
