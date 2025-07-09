import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '12')
    const category = url.searchParams.get('category')
    const pricing = url.searchParams.get('pricing')
    const search = url.searchParams.get('search')
    const sort = url.searchParams.get('sort') || 'featured'
    
    const offset = (page - 1) * limit

    // 构建查询
    let query = supabase
      .from('prompts')
      .select(`
        *,
        prompt_categories(id, name, icon, color)
      `)
      .eq('status', 'published')

    // 分类筛选
    if (category && category !== 'all') {
      query = query.eq('category_id', category)
    }

    // 价格筛选
    if (pricing === 'free') {
      query = query.eq('pricing_type', 'free')
    } else if (pricing === 'paid') {
      query = query.in('pricing_type', ['paid', 'premium'])
    }

    // 搜索
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 排序
    switch (sort) {
      case 'popular':
        query = query.order('downloads_count', { ascending: false })
        break
      case 'rating':
        query = query.order('rating_average', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'price-low':
        query = query.order('price', { ascending: true })
        break
      case 'price-high':
        query = query.order('price', { ascending: false })
        break
      default:
        query = query.order('featured', { ascending: false })
                   .order('downloads_count', { ascending: false })
    }

    // 分页
    query = query.range(offset, offset + limit - 1)

    const { data: prompts, error } = await query

    if (error) {
      console.error('Fetch prompts error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '获取Prompt失败' 
      }, { status: 500 })
    }

    // 获取总数
    const { count } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    return NextResponse.json({
      success: true,
      data: prompts,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Get prompts error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, 
      description, 
      content, 
      category_id, 
      pricing_type, 
      price, 
      tags, 
      language, 
      model_compatibility, 
      difficulty, 
      estimated_time,
      author_id,
      author_name,
      author_avatar
    } = body

    // 验证必要字段
    if (!title || !description || !content || !category_id || !author_id) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要字段' 
      }, { status: 400 })
    }

    // 生成Prompt ID
    const promptId = 'prompt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

    // 插入Prompt
    const { data: prompt, error } = await supabase
      .from('prompts')
      .insert({
        id: promptId,
        title,
        description,
        content,
        category_id,
        author_id,
        author_name,
        author_avatar,
        pricing_type: pricing_type || 'free',
        price: price || 0,
        tags: tags || [],
        language: language || 'zh',
        model_compatibility: model_compatibility || [],
        difficulty: difficulty || 'beginner',
        estimated_time: estimated_time || 10,
        status: 'pending' // 需要审核
      })
      .select()
      .single()

    if (error) {
      console.error('Insert prompt error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '创建Prompt失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: prompt
    })

  } catch (error) {
    console.error('Create prompt error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}