// Dynamic Sitemap Generator
import { NextResponse } from 'next/server'
import { SitemapGenerator } from '@/lib/seo-optimizer'

export async function GET() {
  try {
    const sitemap = await SitemapGenerator.generateSitemap()
    
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
