// SEO Optimized Layout Component
import { Metadata } from 'next'
import { MetadataGenerator, StructuredDataGenerator, seoConfig } from '@/lib/seo-optimizer'
import Script from 'next/script'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

interface SEOLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  noIndex?: boolean
  canonicalUrl?: string
  structuredData?: any[]
  breadcrumbs?: Array<{name: string, url: string}>
}

export function SEOLayout({
  children,
  title = seoConfig.defaultTitle,
  description = seoConfig.defaultDescription,
  keywords = [],
  image = seoConfig.defaultImage,
  noIndex = false,
  canonicalUrl,
  structuredData = [],
  breadcrumbs = []
}: SEOLayoutProps) {
  // Generate structured data
  const defaultStructuredData = [
    StructuredDataGenerator.generateOrganization(),
    StructuredDataGenerator.generateWebsite()
  ]

  if (breadcrumbs.length > 0) {
    defaultStructuredData.push(
      StructuredDataGenerator.generateBreadcrumbList(breadcrumbs)
    )
  }

  const allStructuredData = [...defaultStructuredData, ...structuredData]

  return (
    <html lang="zh-CN" className={inter.className}>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        
        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        
        {/* Favicon and icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        
        {/* Structured Data */}
        {allStructuredData.map((data, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          />
        ))}
        
        {/* Additional meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      </head>
      
      <body className="min-h-screen bg-white">
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
        >
          跳转到主要内容
        </a>
        
        {/* Main content */}
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_title: document.title,
                  page_location: window.location.href,
                  custom_map: {
                    'custom_parameter': 'value'
                  }
                });
              `}
            </Script>
          </>
        )}
        
        {/* Baidu Analytics (for Chinese market) */}
        {process.env.NEXT_PUBLIC_BAIDU_ANALYTICS_ID && (
          <Script id="baidu-analytics" strategy="afterInteractive">
            {`
              var _hmt = _hmt || [];
              (function() {
                var hm = document.createElement("script");
                hm.src = "https://hm.baidu.com/hm.js?${process.env.NEXT_PUBLIC_BAIDU_ANALYTICS_ID}";
                var s = document.getElementsByTagName("script")[0]; 
                s.parentNode.insertBefore(hm, s);
              })();
            `}
          </Script>
        )}
        
        {/* Microsoft Clarity */}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
            `}
          </Script>
        )}
        
        {/* Service Worker for PWA */}
        <Script id="service-worker" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('SW registered: ', registration);
                  })
                  .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }
          `}
        </Script>
        
        {/* Schema.org structured data for breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="sr-only">
            <ol>
              {breadcrumbs.map((item, index) => (
                <li key={index}>
                  <a href={item.url}>{item.name}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </body>
    </html>
  )
}

// ==================== Page-specific SEO Components ====================

export function HomePageSEO() {
  const metadata = MetadataGenerator.generateHomeMetadata()
  
  const structuredData = [
    StructuredDataGenerator.generateItemList([
      // This would be populated with actual featured tools
    ])
  ]
  
  return {
    metadata,
    structuredData
  }
}

export function ToolPageSEO({ tool }: { tool: any }) {
  const metadata = MetadataGenerator.generateToolMetadata(tool)
  
  const structuredData = [
    StructuredDataGenerator.generateSoftwareApplication(tool)
  ]
  
  const breadcrumbs = [
    { name: '首页', url: '/' },
    { name: '工具', url: '/tools' },
    { name: tool.category?.name || '未分类', url: `/categories/${tool.category?.slug}` },
    { name: tool.name, url: `/tools/${tool.slug}` }
  ]
  
  return {
    metadata,
    structuredData,
    breadcrumbs
  }
}

export function CategoryPageSEO({ category, page = 1 }: { category: any, page?: number }) {
  const metadata = MetadataGenerator.generateCategoryMetadata(category, page)
  
  const breadcrumbs = [
    { name: '首页', url: '/' },
    { name: '分类', url: '/categories' },
    { name: category.name, url: `/categories/${category.slug}` }
  ]
  
  return {
    metadata,
    breadcrumbs
  }
}

export function SearchPageSEO({ query, resultsCount }: { query: string, resultsCount: number }) {
  const metadata = MetadataGenerator.generateSearchMetadata(query, resultsCount)
  
  return {
    metadata
  }
}

// ==================== SEO Hook ====================

export function useSEOTracker() {
  return {
    trackPageView: (url: string, title: string) => {
      if (typeof window !== 'undefined') {
        // Google Analytics
        if (window.gtag) {
          window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
            page_title: title,
            page_location: url
          })
        }
        
        // Baidu Analytics
        if ((window as any)._hmt) {
          (window as any)._hmt.push(['_trackPageview', url])
        }
        
        // Microsoft Clarity
        if ((window as any).clarity) {
          (window as any).clarity('set', 'page', url)
        }
      }
    },
    
    trackEvent: (action: string, category: string, label?: string, value?: number) => {
      if (typeof window !== 'undefined') {
        if (window.gtag) {
          window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
          })
        }
      }
    }
  }
}

export default SEOLayout