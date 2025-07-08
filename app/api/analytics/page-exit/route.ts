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
      userId,
      sessionId,
      page,
      timeSpent
    } = body

    // 验证必填字段
    if (!sessionId || !page) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, page' },
        { status: 400 }
      )
    }

    // 更新会话数据
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .update({
        end_time: new Date().toISOString(),
        exit_page: page,
        duration: timeSpent ? Math.floor(timeSpent / 1000) : null,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)

    if (sessionError) {
      console.error('Session update error:', sessionError)
    }

    // 记录页面退出事件
    const { error: eventError } = await supabase
      .from('user_behavior_events')
      .insert({
        user_id: userId || 'anonymous',
        session_id: sessionId,
        event_type: 'page_exit',
        event_data: {
          page: page,
          timeSpent: timeSpent
        },
        url: page,
        user_agent: request.headers.get('user-agent') || '',
        viewport: null,
        device_type: null,
        os: null,
        browser: null,
        screen_resolution: null,
        timezone: null
      })

    if (eventError) {
      console.error('Event insert error:', eventError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}