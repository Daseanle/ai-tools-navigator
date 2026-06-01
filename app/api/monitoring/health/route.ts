import { NextRequest, NextResponse } from 'next/server'
import { HealthChecker, metricsCollector, SystemHealth } from '@/lib/monitoring'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeMetrics = searchParams.get('metrics') === 'true'
    const timeWindow = parseInt(searchParams.get('window') || '300000')

    // Get system health
    const health: SystemHealth = await HealthChecker.getSystemHealth()

    // Add detailed metrics if requested
    let metrics = {}
    if (includeMetrics) {
      metrics = metricsCollector.getAllStats(timeWindow)
    }

    // Determine appropriate status code
    const statusCode = health.status === 'healthy' ? 200 : 
                     health.status === 'degraded' ? 207 : 503

    const response = {
      status: health.status,
      timestamp: new Date().toISOString(),
      uptime: health.uptime,
      system: {
        memory: health.memory,
        cpu: health.cpu
      },
      services: {
        database: health.database,
        cache: health.cache,
        api: health.api
      },
      ...(includeMetrics && { metrics })
    }

    return NextResponse.json(response, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'down',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 503 }
    )
  }
}

// POST endpoint for recording custom metrics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, value, tags } = body

    if (!name || typeof value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data. Name and numeric value required.' },
        { status: 400 }
      )
    }

    metricsCollector.record({ name, value, tags })

    return NextResponse.json({
      success: true,
      message: 'Metric recorded successfully'
    })

  } catch (error) {
    console.error('Failed to record metric:', error)
    return NextResponse.json(
      { error: 'Failed to record metric' },
      { status: 500 }
    )
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
