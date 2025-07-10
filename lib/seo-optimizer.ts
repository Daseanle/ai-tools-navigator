// Advanced SEO and Metadata Optimization System
import { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'

// ==================== SEO Configuration ====================

export interface SEOConfig {
  siteName: string
  siteUrl: string
  defaultTitle: string
  defaultDescription: string
  defaultImage: string
  twitterHandle: string
  facebookAppId?: string
  verificationCodes?: {
    google?: string
    bing?: string
    yandex?: string
    baidu?: string
  }
  structuredData?: {
    organization: any
    website: any
  }
}

export const seoConfig: SEOConfig = {
  siteName: 'AI Tools Navigator',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-tools-navigator.com',
  defaultTitle: 'AI Tools Navigator - 发现最佳AI工具和应用',
  defaultDescription: '探索和发现最新、最优秀的AI工具。我们收录了数千个AI应用，帮助您找到最适合的AI解决方案。',
  defaultImage: '/images/og-default.jpg',
  twitterHandle: '@AiToolsNav',
  facebookAppId: process.env.FACEBOOK_APP_ID,
  verificationCodes: {
    google: process.env.GOOGLE_VERIFICATION_CODE,
    bing: process.env.BING_VERIFICATION_CODE,
    yandex: process.env.YANDEX_VERIFICATION_CODE,
    baidu: process.env.BAIDU_VERIFICATION_CODE
  },
  structuredData: {
    organization: {
      '@type': 'Organization',
      name: 'AI Tools Navigator',
      url: 'https://ai-tools-navigator.com',
      logo: 'https://ai-tools-navigator.com/images/logo.png',
      sameAs: [
        'https://twitter.com/AiToolsNav',
        'https://github.com/ai-tools-navigator'
      ]
    },
    website: {
      '@type': 'WebSite',
      name: 'AI Tools Navigator',
      url: 'https://ai-tools-navigator.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://ai-tools-navigator.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }
  }
}

// ==================== Metadata Generator ====================

class MetadataGenerator {
  private static baseUrl = seoConfig.siteUrl

  static generateBasicMetadata(
    title: string,
    description: string,
    options: {
      image?: string
      noIndex?: boolean
      canonicalUrl?: string
      keywords?: string[]
      alternateLanguages?: Record<string, string>
    } = {}
  ): Metadata {
    const {
      image = seoConfig.defaultImage,
      noIndex = false,
      canonicalUrl,
      keywords = [],
      alternateLanguages = {}
    } = options

    const fullTitle = title === seoConfig.defaultTitle 
      ? title 
      : `${title} - ${seoConfig.siteName}`

    const metadata: Metadata = {
      title: fullTitle,
      description,
      keywords: keywords.join(', '),
      robots: noIndex ? 'noindex,nofollow' : 'index,follow',
      canonical: canonicalUrl,
      
      // Open Graph
      openGraph: {
        title: fullTitle,
        description,
        type: 'website',
        siteName: seoConfig.siteName,
        images: [
          {
            url: this.getAbsoluteUrl(image),
            width: 1200,
            height: 630,
            alt: title
          }
        ],
        locale: 'zh_CN',
        alternateLocale: ['en_US', 'ja_JP']
      },

      // Twitter
      twitter: {
        card: 'summary_large_image',
        site: seoConfig.twitterHandle,
        title: fullTitle,
        description,
        images: [this.getAbsoluteUrl(image)]
      },

      // Verification codes
      verification: {
        google: seoConfig.verificationCodes?.google,
        other: {
          'msvalidate.01': seoConfig.verificationCodes?.bing,
          'yandex-verification': seoConfig.verificationCodes?.yandex,
          'baidu-site-verification': seoConfig.verificationCodes?.baidu
        }
      },

      // Alternate languages
      alternates: {
        canonical: canonicalUrl,
        languages: alternateLanguages
      },

      // Additional meta tags
      other: {
        'format-detection': 'telephone=no',
        'theme-color': '#3b82f6',
        'color-scheme': 'light dark'
      }
    }

    return metadata
  }

  static generateToolMetadata(tool: any): Metadata {
    const title = `${tool.name} - AI工具详情`
    const description = tool.description || `${tool.name}是一个优秀的AI工具，${tool.tagline || '帮助提升工作效率'}。查看详细信息、用户评价和使用指南。`
    
    const keywords = [
      tool.name,
      'AI工具',
      '人工智能',
      ...(tool.tags?.map((tag: any) => tag.name) || []),
      tool.category?.name || '',
      tool.pricing_type || ''
    ].filter(Boolean)

    const canonicalUrl = `${this.baseUrl}/tools/${tool.slug}`
    
    return this.generateBasicMetadata(title, description, {
      image: tool.logo_url || tool.featured_image,
      canonicalUrl,
      keywords,
      alternateLanguages: {
        'en': `${this.baseUrl}/en/tools/${tool.slug}`,
        'ja': `${this.baseUrl}/ja/tools/${tool.slug}`
      }
    })
  }

  static generateCategoryMetadata(category: any, page: number = 1): Metadata {
    const title = page > 1 
      ? `${category.name} AI工具 - 第${page}页`
      : `${category.name} AI工具 - 专业分类`
    
    const description = category.description || 
      `探索${category.name}类别下的最佳AI工具。我们精选了优质的${category.name}相关AI应用，帮助您找到最适合的解决方案。`

    const keywords = [
      category.name,
      `${category.name} AI工具`,
      '人工智能',
      'AI应用',
      '工具推荐'
    ]

    const canonicalUrl = page > 1 
      ? `${this.baseUrl}/categories/${category.slug}?page=${page}`
      : `${this.baseUrl}/categories/${category.slug}`

    return this.generateBasicMetadata(title, description, {
      canonicalUrl,
      keywords,
      alternateLanguages: {
        'en': `${this.baseUrl}/en/categories/${category.slug}`,
        'ja': `${this.baseUrl}/ja/categories/${category.slug}`
      }
    })
  }

  static generateSearchMetadata(query: string, resultsCount: number): Metadata {
    const title = `搜索"${query}"的结果 - AI工具搜索`
    const description = `找到${resultsCount}个与"${query}"相关的AI工具。浏览搜索结果，发现最适合您需求的AI解决方案。`
    
    const keywords = [
      query,
      'AI工具搜索',
      '人工智能搜索',
      'AI应用查找'
    ]

    return this.generateBasicMetadata(title, description, {
      keywords,
      noIndex: true // Search results should not be indexed
    })
  }

  static generateHomeMetadata(): Metadata {
    return this.generateBasicMetadata(
      seoConfig.defaultTitle,
      seoConfig.defaultDescription,
      {
        keywords: [
          'AI工具',
          '人工智能',
          'AI应用',
          '机器学习',
          '深度学习',
          'AI导航',
          '工具推荐',
          '效率工具'
        ],
        canonicalUrl: this.baseUrl
      }
    )
  }

  private static getAbsoluteUrl(path: string): string {
    if (path.startsWith('http')) return path
    return `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
  }
}

// ==================== Structured Data Generator ====================

class StructuredDataGenerator {
  static generateOrganization(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      ...seoConfig.structuredData?.organization
    }
  }

  static generateWebsite(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      ...seoConfig.structuredData?.website
    }
  }

  static generateSoftwareApplication(tool: any): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: tool.description,
      url: tool.website_url,
      image: tool.logo_url,
      applicationCategory: 'AI Tool',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: tool.pricing_type === 'free' ? '0' : undefined,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      },
      aggregateRating: tool.rating_count > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: tool.rating,
        ratingCount: tool.rating_count,
        bestRating: 5,
        worstRating: 1
      } : undefined,
      author: {
        '@type': 'Organization',
        name: tool.company || 'Unknown'
      },
      datePublished: tool.created_at,
      dateModified: tool.updated_at
    }
  }

  static generateBreadcrumbList(items: Array<{name: string, url: string}>): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    }
  }

  static generateItemList(tools: any[], category?: any): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: category ? `${category.name} AI工具` : 'AI工具列表',
      description: category?.description || '精选AI工具推荐',
      numberOfItems: tools.length,
      itemListElement: tools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${seoConfig.siteUrl}/tools/${tool.slug}`,
        name: tool.name,
        image: tool.logo_url
      }))
    }
  }

  static generateFAQPage(faqs: Array<{question: string, answer: string}>): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    }
  }
}

// ==================== SEO Analytics Tracker ====================

class SEOAnalytics {
  static trackPageView(url: string, title: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
        page_title: title,
        page_location: url
      })
    }
  }

  static trackSearch(query: string, resultsCount: number) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: query,
        results_count: resultsCount
      })
    }
  }

  static trackToolView(toolName: string, category: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        item_id: toolName,
        item_name: toolName,
        item_category: category
      })
    }
  }
}

// ==================== SEO Health Checker ====================

class SEOHealthChecker {
  static async checkPageSEO(url: string): Promise<{
    score: number
    issues: string[]
    recommendations: string[]
  }> {
    const issues: string[] = []
    const recommendations: string[] = []
    let score = 100

    try {
      const response = await fetch(url)
      const html = await response.text()
      
      // Check title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      if (!titleMatch || titleMatch[1].length < 30) {
        issues.push('Title tag is missing or too short')
        score -= 20
      }
      if (titleMatch && titleMatch[1].length > 60) {
        recommendations.push('Title tag should be under 60 characters')
        score -= 5
      }

      // Check meta description
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)
      if (!descMatch || descMatch[1].length < 120) {
        issues.push('Meta description is missing or too short')
        score -= 15
      }

      // Check headings
      const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi)
      if (!h1Match || h1Match.length === 0) {
        issues.push('Missing H1 tag')
        score -= 15
      }
      if (h1Match && h1Match.length > 1) {
        issues.push('Multiple H1 tags found')
        score -= 10
      }

      // Check images
      const imgMatches = html.match(/<img[^>]*>/gi)
      if (imgMatches) {
        const imagesWithoutAlt = imgMatches.filter(img => !img.includes('alt='))
        if (imagesWithoutAlt.length > 0) {
          issues.push(`${imagesWithoutAlt.length} images missing alt text`)
          score -= imagesWithoutAlt.length * 2
        }
      }

      // Check structured data
      if (!html.includes('application/ld+json')) {
        recommendations.push('Add structured data for better search visibility')
        score -= 5
      }

      // Check canonical URL
      if (!html.includes('rel="canonical"')) {
        recommendations.push('Add canonical URL to prevent duplicate content')
        score -= 5
      }

    } catch (error) {
      issues.push('Failed to analyze page')
      score = 0
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    }
  }

  static generateSEOReport(results: any[]): {
    overallScore: number
    totalIssues: number
    criticalIssues: string[]
    recommendations: string[]
  } {
    const totalScore = results.reduce((sum, result) => sum + result.score, 0)
    const overallScore = Math.round(totalScore / results.length)
    
    const allIssues = results.flatMap(result => result.issues)
    const totalIssues = allIssues.length
    
    const criticalIssues = allIssues.filter(issue => 
      issue.includes('missing') || issue.includes('Missing')
    )
    
    const allRecommendations = results.flatMap(result => result.recommendations)
    const uniqueRecommendations = [...new Set(allRecommendations)]

    return {
      overallScore,
      totalIssues,
      criticalIssues,
      recommendations: uniqueRecommendations
    }
  }
}

// ==================== Sitemap Generator ====================

class SitemapGenerator {
  static async generateSitemap(): Promise<string> {
    const urls: Array<{
      url: string
      lastmod: string
      changefreq: string
      priority: string
    }> = []

    // Add static pages
    urls.push({
      url: seoConfig.siteUrl,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '1.0'
    })

    // Add category pages (would fetch from database)
    const categories = await this.fetchCategories()
    categories.forEach(category => {
      urls.push({
        url: `${seoConfig.siteUrl}/categories/${category.slug}`,
        lastmod: category.updated_at || new Date().toISOString(),
        changefreq: 'weekly',
        priority: '0.8'
      })
    })

    // Add tool pages (would fetch from database)
    const tools = await this.fetchTools()
    tools.forEach(tool => {
      urls.push({
        url: `${seoConfig.siteUrl}/tools/${tool.slug}`,
        lastmod: tool.updated_at || new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.6'
      })
    })

    // Generate XML
    return this.generateSitemapXML(urls)
  }

  private static generateSitemapXML(urls: any[]): string {
    const urlElements = urls.map(url => `
  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`
  }

  private static async fetchCategories(): Promise<any[]> {
    // This would fetch from your database
    return []
  }

  private static async fetchTools(): Promise<any[]> {
    // This would fetch from your database
    return []
  }

  static async generateRobotsTxt(): Promise<string> {
    return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /search?*

Sitemap: ${seoConfig.siteUrl}/sitemap.xml
Sitemap: ${seoConfig.siteUrl}/sitemap-tools.xml
Sitemap: ${seoConfig.siteUrl}/sitemap-categories.xml

# Crawl-delay for polite crawlers
Crawl-delay: 1`
  }
}

// ==================== Utility Functions ====================

export function createStructuredDataScript(data: any): string {
  return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`
}

export function generateMetaTags(metadata: Metadata): string {
  const tags: string[] = []
  
  if (metadata.title) {
    tags.push(`<title>${metadata.title}</title>`)
  }
  
  if (metadata.description) {
    tags.push(`<meta name="description" content="${metadata.description}">`)
  }
  
  if (metadata.keywords) {
    tags.push(`<meta name="keywords" content="${metadata.keywords}">`)
  }
  
  return tags.join('\n')
}

export { MetadataGenerator, StructuredDataGenerator, SEOAnalytics, SEOHealthChecker, SitemapGenerator }