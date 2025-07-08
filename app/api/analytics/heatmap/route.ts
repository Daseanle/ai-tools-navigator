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
      page_url,
      viewport,
      click_data = [],
      scroll_data = [],
      hover_data = [],
      date_collected
    } = body

    // 验证必填字段
    if (!page_url || !viewport) {
      return NextResponse.json(
        { error: 'Missing required fields: page_url, viewport' },
        { status: 400 }
      )
    }

    // 检查当天是否已有该页面的热力图数据
    const today = date_collected || new Date().toISOString().split('T')[0]
    const { data: existingData } = await supabase
      .from('heatmap_data')
      .select('*')
      .eq('page_url', page_url)
      .eq('date_collected', today)
      .single()

    if (existingData) {
      // 合并现有数据
      const mergedClickData = [...(existingData.click_data || []), ...click_data]
      const mergedScrollData = [...(existingData.scroll_data || []), ...scroll_data]
      const mergedHoverData = [...(existingData.hover_data || []), ...hover_data]

      const { data, error } = await supabase
        .from('heatmap_data')
        .update({
          click_data: mergedClickData,
          scroll_data: mergedScrollData,
          hover_data: mergedHoverData,
          total_views: (existingData.total_views || 0) + 1
        })
        .eq('id', existingData.id)
        .select()

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to update heatmap data' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data })
    } else {
      // 创建新的热力图数据
      const { data, error } = await supabase
        .from('heatmap_data')
        .insert({
          page_url,
          viewport,
          click_data,
          scroll_data,
          hover_data,
          total_views: 1,
          unique_users: 1,
          date_collected: today
        })
        .select()

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to create heatmap data' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data })
    }
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
    const page_url = searchParams.get('page_url')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')

    let query = supabase
      .from('heatmap_data')
      .select('*')
      .order('date_collected', { ascending: false })

    if (page_url) {
      query = query.eq('page_url', page_url)
    }

    if (start_date) {
      query = query.gte('date_collected', start_date)
    }

    if (end_date) {
      query = query.lte('date_collected', end_date)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch heatmap data' },
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