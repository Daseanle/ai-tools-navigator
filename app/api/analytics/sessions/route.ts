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
      session_id,
      user_id = 'anonymous',
      start_time,
      device_type,
      source = 'direct',
      utm_source,
      utm_medium,
      utm_campaign
    } = body

    // 验证必填字段
    if (!session_id) {
      return NextResponse.json(
        { error: 'Missing required field: session_id' },
        { status: 400 }
      )
    }

    // 检查会话是否已存在
    const { data: existingSession } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('session_id', session_id)
      .single()

    if (existingSession) {
      return NextResponse.json({ 
        success: true, 
        message: 'Session already exists',
        session_id 
      })
    }

    // 创建新会话
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        session_id,
        user_id,
        start_time: start_time || new Date().toISOString(),
        device_type,
        source,
        utm_source,
        utm_medium,
        utm_campaign,
        pages_visited: [],
        page_count: 0,
        click_count: 0,
        scroll_depth: 0,
        is_bounce: false
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create session' },
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
    const session_id = searchParams.get('session_id')
    const user_id = searchParams.get('user_id')

    if (!session_id && !user_id) {
      return NextResponse.json(
        { error: 'Missing session_id or user_id parameter' },
        { status: 400 }
      )
    }

    let query = supabase.from('user_sessions').select('*')

    if (session_id) {
      query = query.eq('session_id', session_id)
    } else if (user_id) {
      query = query.eq('user_id', user_id).order('start_time', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
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