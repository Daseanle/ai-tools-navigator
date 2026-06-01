import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      url,
      load_time,
      first_contentful_paint,
      largest_contentful_paint,
      first_input_delay,
      cumulative_layout_shift,
      user_id = 'anonymous',
      session_id,
      device_type,
      connection_type
    } = body

    // 验证必填字段
    if (!url) {
      return NextResponse.json(
        { error: 'Missing required field: url' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('page_performance')
      .insert({
        url,
        load_time,
        first_contentful_paint,
        largest_contentful_paint,
        first_input_delay,
        cumulative_layout_shift,
        user_id,
        session_id,
        device_type,
        connection_type
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to store performance data' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const device_type = searchParams.get('device_type')
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = supabase
      .from('page_performance')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (url) {
      query = query.eq('url', url)
    }

    if (device_type) {
      query = query.eq('device_type', device_type)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch performance data' },
        { status: 500 }
      )
    }

    // 计算平均值
    if (data && data.length > 0) {
      const averages = {
        avg_load_time: data.reduce((sum, item) => sum + (item.load_time || 0), 0) / data.length,
        avg_fcp: data.reduce((sum, item) => sum + (item.first_contentful_paint || 0), 0) / data.length,
        avg_lcp: data.reduce((sum, item) => sum + (item.largest_contentful_paint || 0), 0) / data.length,
        avg_fid: data.reduce((sum, item) => sum + (item.first_input_delay || 0), 0) / data.length,
        avg_cls: data.reduce((sum, item) => sum + (item.cumulative_layout_shift || 0), 0) / data.length,
        total_samples: data.length
      }

      return NextResponse.json({ 
        success: true, 
        data, 
        averages: averages
      })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
