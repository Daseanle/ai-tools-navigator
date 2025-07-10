import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 获取工具列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'

    let query = supabase
      .from('tools')
      .select(`
        *,
        categories!inner(name, slug, icon)
      `)

    // 分类过滤
    if (category) {
      query = query.eq('categories.slug', category)
    }

    // 特色工具过滤
    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    // 搜索过滤
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`)
    }

    // 排序
    const validSortFields = ['created_at', 'updated_at', 'name', 'rating', 'visits']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at'
    query = query.order(sortField, { ascending: order === 'asc' })

    // 分页
    query = query.range(offset, offset + limit - 1)

    const { data: tools, error, count } = await query

    if (error) {
      console.error('Get tools error:', error)
      return NextResponse.json({
        success: false,
        error: '获取工具列表失败'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      tools: tools || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('Get tools error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '获取工具列表失败' 
    }, { status: 500 })
  }
}

// 创建新工具
export async function POST(request: NextRequest) {
  try {
    const tool = await request.json()
    
    const { data: newTool, error } = await supabase
      .from('tools')
      .insert([{
        name: tool.name,
        slug: tool.slug || generateSlug(tool.name),
        description: tool.description,
        website: tool.website,
        category_id: tool.categoryId,
        pricing: tool.pricing,
        features: tool.features,
        tags: tool.tags,
        rating: tool.rating || 0,
        visits: 0,
        featured: tool.featured || false,
        status: 'active',
        logo: tool.logo,
        screenshots: tool.screenshots,
        video_url: tool.videoUrl,
        api_available: tool.apiAvailable || false,
        free_tier: tool.freeTier || false,
        trial_available: tool.trialAvailable || false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Create tool error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '创建工具失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      tool: newTool,
      message: '工具创建成功'
    })

  } catch (error) {
    console.error('Create tool error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// 生成slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}