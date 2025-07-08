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
      user_id = 'anonymous',
      session_id,
      event_type,
      event_data,
      url,
      referrer,
      user_agent,
      viewport,
      device_type,
      os,
      browser,
      screen_resolution,
      geo_location,
      timezone
    } = body

    // 验证必填字段
    if (!session_id || !event_type || !url) {
      return NextResponse.json(
        { error: 'Missing required fields: session_id, event_type, url' },
        { status: 400 }
      )
    }

    // 插入用户行为事件
    const { data, error } = await supabase
      .from('user_behavior_events')
      .insert({
        user_id,
        session_id,
        event_type,
        event_data: event_data || {},
        url,
        referrer,
        user_agent,
        viewport,
        device_type,
        os,
        browser,
        screen_resolution,
        geo_location,
        timezone
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to store event data' },
        { status: 500 }
      )
    }

    // 同时更新会话信息
    await updateSessionData(session_id, user_id, event_type, url, device_type)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function updateSessionData(
  session_id: string, 
  user_id: string, 
  event_type: string, 
  url: string, 
  device_type: string
) {
  try {
    // 检查会话是否存在
    const { data: existingSession } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_id', session_id)
      .single()

    if (existingSession) {
      // 更新现有会话
      const updates: any = {
        end_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // 更新页面访问列表
      const pages = existingSession.pages_visited || []
      if (!pages.includes(url)) {
        updates.pages_visited = [...pages, url]
        updates.page_count = pages.length + 1
      }

      // 更新点击计数
      if (event_type === 'click') {
        updates.click_count = (existingSession.click_count || 0) + 1
      }

      // 更新滚动深度
      if (event_type === 'scroll') {
        const scrollData = typeof existingSession.event_data === 'object' ? existingSession.event_data : {}
        const currentDepth = scrollData.scrollDepth || 0
        updates.scroll_depth = Math.max(existingSession.scroll_depth || 0, currentDepth)
      }

      // 设置退出页面
      updates.exit_page = url

      await supabase
        .from('user_sessions')
        .update(updates)
        .eq('session_id', session_id)
    } else {
      // 创建新会话
      await supabase
        .from('user_sessions')
        .insert({
          session_id,
          user_id,
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
          pages_visited: [url],
          page_count: 1,
          click_count: event_type === 'click' ? 1 : 0,
          scroll_depth: 0,
          device_type,
          source: 'direct', // 可以根据 referrer 判断来源
          exit_page: url,
          is_bounce: false
        })
    }
  } catch (error) {
    console.error('Session update error:', error)
  }
}