/**
 * SEO优化系统
 * 包含sitemap生成、结构化数据、meta标签优化等
 */

import type { Tool, Category } from "@/types"

export interface SEOConfig {
  siteName: string
  siteUrl: string
  defaultTitle: string
  defaultDescription: string
  defaultKeywords: string[]
  twitterHandle?: string
  facebookAppId?: string
  googleSiteVerification?: string
  bingWebmasterKey?: string
  baiduSiteVerification?: string
}

export interface SEOMetadata {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  openGraph: {
    title: string
    description: string
    image: string
    url: string
    type: 'website' | 'article' | 'product'
    siteName: string
  }
  twitter: {
    card: 'summary' | 'summary_large_image'
    title: string
    description: string
    image: string
    creator?: string
  }
  structuredData?: any
  alternateLanguages?: Array<{
    hreflang: string
    href: string
  }>
}

// SEO配置
export const seoConfig: SEOConfig = {
  siteName: 'AI Navigator Pro',
  siteUrl: 'https://ai-navigator-pro.com',
  defaultTitle: 'AI Navigator Pro - 发现最好的AI工具',
  defaultDescription: '探索、发现和使用最优秀的AI工具。提供AI写作、绘画、编程、视频等工具的详细评测和使用指南。',
  defaultKeywords: [
    'AI工具',
    '人工智能',
    'AI导航',
    'ChatGPT',
    'AI写作',
    'AI绘画',
    'AI编程',
    '生产力工具',
    'AI助手'
  ],
  twitterHandle: '@ai_navigator_pro',
  googleSiteVerification: 'your-google-verification-code',
  bingWebmasterKey: 'your-bing-verification-code',
  baiduSiteVerification: 'your-baidu-verification-code'
}

// SEO管理类
export class SEOManager {
  // 生成页面SEO元数据
  static generatePageSEO(
    title: string,
    description: string,
    path: string,
    options: {
      keywords?: string[]
      image?: string
      type?: 'website' | 'article' | 'product'
      publishedTime?: string
      modifiedTime?: string
      author?: string
      structuredData?: any
    } = {}
  ): SEOMetadata {
    const fullTitle = title === seoConfig.defaultTitle ? title : `${title} - ${seoConfig.siteName}`
    const canonicalUrl = `${seoConfig.siteUrl}${path}`
    const imageUrl = options.image || `${seoConfig.siteUrl}/og-default.jpg`

    return {
      title: fullTitle,
      description,
      keywords: options.keywords || seoConfig.defaultKeywords,
      canonical: canonicalUrl,
      openGraph: {
        title: fullTitle,
        description,
        image: imageUrl,
        url: canonicalUrl,
        type: options.type || 'website',
        siteName: seoConfig.siteName
      },
      twitter: {
        card: 'summary_large_image',
        title: fullTitle,
        description,
        image: imageUrl,
        creator: seoConfig.twitterHandle
      },
      structuredData: options.structuredData,
      alternateLanguages: [
        { hreflang: 'zh-CN', href: `${seoConfig.siteUrl}/zh${path}` },
        { hreflang: 'en', href: `${seoConfig.siteUrl}/en${path}` }
      ]
    }
  }

  // 生成工具页面SEO
  static generateToolSEO(tool: Tool): SEOMetadata {
    const title = `${tool.name} - ${tool.tagline}`
    const description = tool.description || `${tool.name}是一个优秀的AI工具，${tool.tagline}。了解更多功能特性、使用方法和用户评价。`
    const keywords = [
      tool.name,
      tool.tagline,
      tool.category?.name || '',
      ...(tool.tags?.map(tag => tag.name) || []),
      'AI工具',
      '人工智能'
    ]

    const structuredData = this.generateToolStructuredData(tool)

    return this.generatePageSEO(title, description, `/tools/${tool.slug}`, {
      keywords,
      image: tool.logo_url,
      type: 'product',
      structuredData
    })
  }

  // 生成分类页面SEO
  static generateCategorySEO(category: Category): SEOMetadata {
    const title = `${category.name}工具推荐`
    const description = category.description || `发现最好的${category.name}AI工具。精选优质${category.name}应用，提供详细评测和使用指南。`
    const keywords = [
      category.name,
      `${category.name}工具`,
      `AI${category.name}`,
      '人工智能',
      'AI工具推荐'
    ]

    const structuredData = this.generateCategoryStructuredData(category)

    return this.generatePageSEO(title, description, `/categories/${category.slug}`, {
      keywords,
      type: 'website',
      structuredData
    })
  }

  // 生成工具结构化数据
  static generateToolStructuredData(tool: Tool) {
    return {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": tool.name,
      "description": tool.description || tool.tagline,
      "url": tool.website_url,
      "applicationCategory": "AI Tool",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": tool.pricing_type === 'free' ? "0" : "varies",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": tool.rating ? {
        "@type": "AggregateRating",
        "ratingValue": tool.rating,
        "ratingCount": tool.upvotes_count || 100,
        "bestRating": 5,
        "worstRating": 1
      } : undefined,
      "author": {
        "@type": "Organization",
        "name": "AI Navigator Pro"
      },
      "datePublished": tool.created_at,
      "dateModified": tool.updated_at,
      "image": tool.logo_url,
      "screenshot": tool.logo_url
    }
  }

  // 生成分类结构化数据
  static generateCategoryStructuredData(category: Category) {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${category.name}工具推荐`,
      "description": category.description,
      "url": `${seoConfig.siteUrl}/categories/${category.slug}`,
      "mainEntity": {
        "@type": "ItemList",
        "name": category.name,
        "description": category.description,
        "numberOfItems": category.tools_count || 0
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "首页",
            "item": seoConfig.siteUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "工具分类",
            "item": `${seoConfig.siteUrl}/categories`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": category.name,
            "item": `${seoConfig.siteUrl}/categories/${category.slug}`
          }
        ]
      }
    }
  }

  // 生成网站结构化数据
  static generateWebsiteStructuredData() {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": seoConfig.siteName,
      "description": seoConfig.defaultDescription,
      "url": seoConfig.siteUrl,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${seoConfig.siteUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      },
      "sameAs": [
        "https://twitter.com/ai_navigator_pro",
        "https://github.com/ai-navigator-pro"
      ]
    }
  }

  // 生成sitemap
  static generateSitemap(tools: Tool[], categories: Category[]): string {
    const urls = []

    // 主要页面
    const mainPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/tools', priority: '0.9', changefreq: 'daily' },
      { url: '/categories', priority: '0.8', changefreq: 'weekly' },
      { url: '/membership', priority: '0.7', changefreq: 'monthly' },
      { url: '/prompts', priority: '0.8', changefreq: 'daily' },
      { url: '/community', priority: '0.7', changefreq: 'daily' },
      { url: '/developers', priority: '0.6', changefreq: 'weekly' },
      { url: '/enterprise', priority: '0.6', changefreq: 'monthly' },
      { url: '/trials', priority: '0.7', changefreq: 'weekly' }
    ]

    mainPages.forEach(page => {
      urls.push(`
  <url>
    <loc>${seoConfig.siteUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`)
    })

    // 工具页面
    tools.forEach(tool => {
      urls.push(`
  <url>
    <loc>${seoConfig.siteUrl}/tools/${tool.slug}</loc>
    <lastmod>${tool.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
    })

    // 分类页面
    categories.forEach(category => {
      urls.push(`
  <url>
    <loc>${seoConfig.siteUrl}/categories/${category.slug}</loc>
    <lastmod>${category.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`)
    })

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`
  }

  // 生成robots.txt
  static generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

# 允许所有搜索引擎爬取
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Baiduspider
Allow: /

# 禁止爬取的路径
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /dashboard/private/

# Sitemap位置
Sitemap: ${seoConfig.siteUrl}/sitemap.xml
Sitemap: ${seoConfig.siteUrl}/sitemap-tools.xml
Sitemap: ${seoConfig.siteUrl}/sitemap-categories.xml

# 爬取频率限制
Crawl-delay: 1`
  }

  // 生成关键词建议
  static generateKeywordSuggestions(tool: Tool): string[] {
    const suggestions = []
    const baseName = tool.name.toLowerCase()

    // 基础关键词
    suggestions.push(tool.name)
    suggestions.push(`${tool.name}官网`)
    suggestions.push(`${tool.name}使用教程`)
    suggestions.push(`${tool.name}怎么用`)
    suggestions.push(`${tool.name}免费`)

    // 类别相关
    if (tool.category) {
      suggestions.push(`${tool.category.name}工具`)
      suggestions.push(`AI${tool.category.name}`)
      suggestions.push(`${tool.name} ${tool.category.name}`)
    }

    // 功能相关
    if (tool.tagline) {
      const words = tool.tagline.split(/[，。！？\s]+/).filter(word => word.length > 1)
      words.forEach(word => {
        suggestions.push(`${tool.name} ${word}`)
        suggestions.push(`${word} ${tool.name}`)
      })
    }

    // 比较关键词
    suggestions.push(`${tool.name} vs ChatGPT`)
    suggestions.push(`${tool.name} 替代品`)
    suggestions.push(`${tool.name} 竞品`)

    // 价格相关
    if (tool.pricing_type === 'free') {
      suggestions.push(`免费${tool.category?.name}工具`)
      suggestions.push(`${tool.name} 免费版`)
    }

    return suggestions.slice(0, 20) // 返回前20个建议
  }

  // 分析页面SEO得分
  static analyzePageSEO(metadata: SEOMetadata): {
    score: number
    issues: string[]
    recommendations: string[]
  } {
    const issues = []
    const recommendations = []
    let score = 100

    // 标题检查
    if (!metadata.title) {
      issues.push('缺少页面标题')
      score -= 20
    } else if (metadata.title.length > 60) {
      issues.push('标题过长，建议控制在60字符以内')
      score -= 5
    } else if (metadata.title.length < 10) {
      issues.push('标题过短，建议至少10个字符')
      score -= 5
    }

    // 描述检查
    if (!metadata.description) {
      issues.push('缺少页面描述')
      score -= 15
    } else if (metadata.description.length > 160) {
      issues.push('描述过长，建议控制在160字符以内')
      score -= 5
    } else if (metadata.description.length < 50) {
      issues.push('描述过短，建议至少50个字符')
      score -= 5
    }

    // 关键词检查
    if (!metadata.keywords || metadata.keywords.length === 0) {
      issues.push('缺少关键词')
      score -= 10
    } else if (metadata.keywords.length > 10) {
      recommendations.push('关键词数量较多，建议精简到10个以内')
    }

    // Open Graph检查
    if (!metadata.openGraph.image) {
      issues.push('缺少Open Graph图片')
      score -= 10
    }

    // 结构化数据检查
    if (!metadata.structuredData) {
      recommendations.push('建议添加结构化数据以提升搜索结果展示')
      score -= 5
    }

    // 生成建议
    if (score >= 90) {
      recommendations.push('SEO优化良好，保持当前标准')
    } else if (score >= 70) {
      recommendations.push('SEO基本达标，可进一步优化')
    } else {
      recommendations.push('SEO需要重点优化，建议优先处理issues中的问题')
    }

    return { score, issues, recommendations }
  }
}

// 页面性能优化建议
export interface PerformanceMetrics {
  loadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  timeToInteractive: number
}

export class PerformanceOptimizer {
  // 分析页面性能
  static analyzePerformance(): Promise<PerformanceMetrics> {
    return new Promise((resolve) => {
      // 使用Performance API获取性能指标
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const paint = performance.getEntriesByType('paint')

        const metrics: PerformanceMetrics = {
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: 0, // 需要使用PerformanceObserver
          cumulativeLayoutShift: 0,  // 需要使用PerformanceObserver
          firstInputDelay: 0,        // 需要使用PerformanceObserver
          timeToInteractive: navigation.domInteractive - navigation.fetchStart
        }

        resolve(metrics)
      } else {
        resolve({
          loadTime: 0,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
          cumulativeLayoutShift: 0,
          firstInputDelay: 0,
          timeToInteractive: 0
        })
      }
    })
  }

  // 性能优化建议
  static getOptimizationSuggestions(metrics: PerformanceMetrics): string[] {
    const suggestions = []

    if (metrics.loadTime > 3000) {
      suggestions.push('页面加载时间过长，建议优化图片压缩和代码分割')
    }

    if (metrics.firstContentfulPaint > 1800) {
      suggestions.push('首次内容绘制时间较长，建议优化关键渲染路径')
    }

    if (metrics.timeToInteractive > 3500) {
      suggestions.push('交互时间较长，建议减少JavaScript执行时间')
    }

    if (suggestions.length === 0) {
      suggestions.push('页面性能良好，继续保持')
    }

    return suggestions
  }
}