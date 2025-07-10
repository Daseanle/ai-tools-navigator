// SEO Management API
import { NextRequest, NextResponse } from 'next/server'
import { SEOHealthChecker, SitemapGenerator, MetadataGenerator } from '@/lib/seo-optimizer'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'health'

    switch (action) {
      case 'health':
        return await getSEOHealth(searchParams)
      case 'sitemap':
        return await generateSitemapInfo()
      case 'metadata':
        return await getMetadataInfo(searchParams)
      case 'performance':
        return await getPerformanceMetrics()
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('SEO API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'analyze':
        return await analyzePages(data)
      case 'optimize':
        return await optimizePage(data)
      case 'generate-sitemap':
        return await generateSitemap()
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('SEO API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getSEOHealth(searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  
  if (url) {
    // Analyze specific URL
    const result = await SEOHealthChecker.checkPageSEO(url)
    return NextResponse.json({
      success: true,
      data: result
    })
  } else {
    // Analyze key pages
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const pages = [
      { url: `${baseUrl}/`, name: 'Home Page' },
      { url: `${baseUrl}/tools`, name: 'Tools Page' },
      { url: `${baseUrl}/categories`, name: 'Categories Page' }
    ]

    const results = await Promise.all(
      pages.map(async page => ({
        ...page,
        ...(await SEOHealthChecker.checkPageSEO(page.url))
      }))
    )

    const report = SEOHealthChecker.generateSEOReport(results)

    return NextResponse.json({
      success: true,
      data: {
        pages: results,
        report
      }
    })
  }
}

async function generateSitemapInfo() {
  try {
    const sitemap = await SitemapGenerator.generateSitemap()
    const robotsTxt = await SitemapGenerator.generateRobotsTxt()
    
    // Count URLs in sitemap
    const urlCount = (sitemap.match(/<url>/g) || []).length
    
    return NextResponse.json({
      success: true,
      data: {
        sitemapUrl: '/sitemap.xml',
        robotsUrl: '/robots.txt',
        urlCount,
        lastGenerated: new Date().toISOString(),
        size: sitemap.length
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate sitemap info' }, { status: 500 })
  }
}

async function getMetadataInfo(searchParams: URLSearchParams) {
  const type = searchParams.get('type') || 'tool'
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'ID parameter required' }, { status: 400 })
  }

  try {
    let metadata
    
    switch (type) {
      case 'tool':
        // This would fetch tool data from database
        const tool = { 
          id, 
          name: 'Sample Tool', 
          slug: 'sample-tool',
          description: 'A sample AI tool for demonstration',
          logo_url: '/images/sample-logo.png'
        }
        metadata = MetadataGenerator.generateToolMetadata(tool)
        break
      case 'category':
        // This would fetch category data from database
        const category = { 
          id, 
          name: 'Sample Category', 
          slug: 'sample-category',
          description: 'A sample category for demonstration'
        }
        metadata = MetadataGenerator.generateCategoryMetadata(category)
        break
      default:
        metadata = MetadataGenerator.generateHomeMetadata()
    }

    return NextResponse.json({
      success: true,
      data: metadata
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate metadata' }, { status: 500 })
  }
}

async function getPerformanceMetrics() {
  // This would typically fetch real performance data
  const metrics = {
    coreWebVitals: {
      lcp: 2.1, // Largest Contentful Paint
      fid: 85,  // First Input Delay
      cls: 0.05 // Cumulative Layout Shift
    },
    lighthouse: {
      performance: 92,
      accessibility: 95,
      bestPractices: 88,
      seo: 96
    },
    searchConsole: {
      impressions: 15420,
      clicks: 892,
      ctr: 5.8,
      position: 12.4
    },
    pagespeed: {
      mobile: 85,
      desktop: 93
    }
  }

  return NextResponse.json({
    success: true,
    data: metrics
  })
}

async function analyzePages(data: any) {
  const { urls } = data
  
  if (!urls || !Array.isArray(urls)) {
    return NextResponse.json({ error: 'URLs array required' }, { status: 400 })
  }

  try {
    const results = await Promise.all(
      urls.map(async (url: string) => ({
        url,
        ...(await SEOHealthChecker.checkPageSEO(url))
      }))
    )

    const report = SEOHealthChecker.generateSEOReport(results)

    return NextResponse.json({
      success: true,
      data: {
        results,
        report
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to analyze pages' }, { status: 500 })
  }
}

async function optimizePage(data: any) {
  const { url, optimizations } = data
  
  // This would apply optimizations to the page
  // For now, just return optimization suggestions
  const suggestions = [
    'Optimize image sizes and formats',
    'Minify CSS and JavaScript',
    'Implement lazy loading for images',
    'Add structured data markup',
    'Improve meta descriptions',
    'Optimize heading structure'
  ]

  return NextResponse.json({
    success: true,
    data: {
      url,
      applied: optimizations || [],
      suggestions
    }
  })
}

async function generateSitemap() {
  try {
    const sitemap = await SitemapGenerator.generateSitemap()
    
    // In a real application, you might save this to a file or database
    
    return NextResponse.json({
      success: true,
      data: {
        sitemap,
        generated: new Date().toISOString(),
        urlCount: (sitemap.match(/<url>/g) || []).length
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 })
  }
}

// Utility function to validate URLs
function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

// Function to get page content for analysis
async function getPageContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SEO-Bot/1.0'
      }
    })
    return await response.text()
  } catch (error) {
    throw new Error(`Failed to fetch page content: ${error}`)
  }
}