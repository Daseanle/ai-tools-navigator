// Dynamic Robots.txt Generator
import { NextResponse } from 'next/server'
import { SitemapGenerator } from '@/lib/seo-optimizer'

export async function GET() {
  try {
    const robotsTxt = await SitemapGenerator.generateRobotsTxt()
    
    return new NextResponse(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400'
      }
    })
  } catch (error) {
    console.error('Robots.txt generation error:', error)
    return new NextResponse('User-agent: *\nDisallow: /', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
