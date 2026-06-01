import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // 测试数据库连接
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1)

    if (error) {
      return NextResponse.json({
        status: 'error',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      database: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
