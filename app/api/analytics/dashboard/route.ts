import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const user_id = searchParams.get('user_id')

    // 获取基础统计数据
    let statsQuery = supabase
      .from('user_behavior_stats')
      .select('*')
      .order('date', { ascending: false })
      .limit(days)

    const { data: statsData, error: statsError } = await statsQuery

    if (statsError) {
      console.error('Stats query error:', statsError)
      return NextResponse.json(
        { error: 'Failed to fetch analytics stats' },
        { status: 500 }
      )
    }

    // 获取实时统计
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const { data: todayEvents, error: todayError } = await supabase
      .from('user_behavior_events')
      .select('*')
      .gte('created_at', todayStart.toISOString())

    if (todayError) {
      console.error('Today events query error:', todayError)
    }

    // 获取活跃会话
    const { data: activeSessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('*')
      .gte('start_time', new Date(now.getTime() - 30 * 60 * 1000).toISOString()) // 30分钟内活跃
      .is('end_time', null)

    if (sessionsError) {
      console.error('Sessions query error:', sessionsError)
    }

    // 计算今日统计
    const todayStats = {
      page_views: todayEvents?.filter(e => e.event_type === 'page_view').length || 0,
      unique_visitors: new Set(todayEvents?.map(e => e.user_id) || []).size,
      clicks: todayEvents?.filter(e => e.event_type === 'click').length || 0,
      active_sessions: activeSessions?.length || 0,
      bounce_rate: 0, // 需要复杂计算
      avg_session_duration: 0 // 需要复杂计算
    }

    // 获取热门页面
    const { data: popularPages, error: pagesError } = await supabase
      .from('user_behavior_events')
      .select('url')
      .eq('event_type', 'page_view')
      .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())

    let pageViews: { [key: string]: number } = {}
    if (popularPages) {
      popularPages.forEach(page => {
        pageViews[page.url] = (pageViews[page.url] || 0) + 1
      })
    }

    const topPages = Object.entries(pageViews)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([url, views]) => ({ url, views }))

    // 获取设备统计
    const { data: deviceData, error: deviceError } = await supabase
      .from('user_behavior_events')
      .select('device_type')
      .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())

    let deviceStats: { [key: string]: number } = {}
    if (deviceData) {
      deviceData.forEach(event => {
        if (event.device_type) {
          deviceStats[event.device_type] = (deviceStats[event.device_type] || 0) + 1
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        daily_stats: statsData || [],
        today_stats: todayStats,
        popular_pages: topPages,
        device_distribution: deviceStats,
        active_sessions: activeSessions?.length || 0,
        total_events_today: todayEvents?.length || 0
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 获取用户画像数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, update_data } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required field: user_id' },
        { status: 400 }
      )
    }

    // 检查用户画像是否存在
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (existingProfile && update_data) {
      // 更新现有画像
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...update_data,
          last_active_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id)
        .select()

      if (error) {
        console.error('Profile update error:', error)
        return NextResponse.json(
          { error: 'Failed to update user profile' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data })
    } else if (!existingProfile) {
      // 创建新画像
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id,
          preferences: update_data?.preferences || {},
          behavior_metrics: update_data?.behavior_metrics || {},
          demographics: update_data?.demographics || {},
          segment_tags: update_data?.segment_tags || [],
          recommendation_context: update_data?.recommendation_context || {},
          total_sessions: 0,
          total_pageviews: 0,
          avg_session_duration: 0,
          last_active_at: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error('Profile creation error:', error)
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json({ success: true, data: existingProfile })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}