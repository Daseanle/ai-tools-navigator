/**
 * 获取生成的Prompt列表API
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const category = url.searchParams.get('category') || ''
    const difficulty = url.searchParams.get('difficulty') || ''
    const search = url.searchParams.get('search') || ''
    const sortBy = url.searchParams.get('sortBy') || 'created_at'
    const sortOrder = url.searchParams.get('sortOrder') || 'desc'
    
    const offset = (page - 1) * limit

    console.log('获取生成的Prompt列表', {
      page,
      limit,
      category,
      difficulty,
      search,
      sortBy
    })

    // 构建查询
    let query = supabase
      .from('generated_prompts')
      .select(`
        id,
        title,
        description,
        category,
        tags,
        difficulty,
        language,
        estimated_quality,
        downloads,
        ratings,
        average_rating,
        favorites,
        views,
        featured,
        verified,
        created_at,
        updated_at
      `)
      .eq('status', 'published')

    // 添加筛选条件
    if (category) {
      query = query.eq('category', category)
    }
    
    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 排序
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // 分页
    const { data: prompts, error, count } = await query
      .range(offset, offset + limit - 1)
      .limit(limit)

    if (error) {
      console.error('获取Prompt列表失败:', error)
      throw error
    }

    // 获取总数
    const { count: totalCount } = await supabase
      .from('generated_prompts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    console.log('✅ 成功获取Prompt列表', {
      count: prompts?.length || 0,
      totalCount
    })

    return NextResponse.json({
      success: true,
      data: {
        prompts: prompts || [],
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / limit)
        },
        filters: {
          category,
          difficulty,
          search,
          sortBy,
          sortOrder
        }
      }
    })

  } catch (error) {
    console.error('❌ 获取Prompt列表失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, promptId, userId = 'anonymous' } = body

    console.log('执行Prompt操作', { action, promptId, userId })

    if (action === 'view') {
      // 记录查看
      await supabase
        .from('prompt_usage_stats')
        .insert({
          prompt_id: promptId,
          user_id: userId,
          action: 'view',
          ip_address: request.ip,
          user_agent: request.headers.get('user-agent')
        })
    } else if (action === 'favorite') {
      // 收藏/取消收藏
      const { data: existing } = await supabase
        .from('prompt_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('prompt_id', promptId)
        .single()

      if (existing) {
        // 取消收藏
        await supabase
          .from('prompt_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('prompt_id', promptId)
      } else {
        // 添加收藏
        await supabase
          .from('prompt_favorites')
          .insert({
            user_id: userId,
            prompt_id: promptId
          })
      }
    } else if (action === 'copy') {
      // 记录复制
      await supabase
        .from('prompt_usage_stats')
        .insert({
          prompt_id: promptId,
          user_id: userId,
          action: 'copy',
          ip_address: request.ip,
          user_agent: request.headers.get('user-agent')
        })
    }

    return NextResponse.json({
      success: true,
      message: '操作成功'
    })

  } catch (error) {
    console.error('❌ 操作失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}