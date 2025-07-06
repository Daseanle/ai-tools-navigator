import type { Metadata } from 'next'
import './globals.css'
import { ErrorBoundary } from '@/components/error-boundary'
import { FavoritesProvider } from '@/components/providers/favorites-provider'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <FavoritesProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </FavoritesProvider>
      </body>
    </html>
  )
}
