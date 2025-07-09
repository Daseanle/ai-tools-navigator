import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 获取用户收藏列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const offset = (page - 1) * limit

    // 构建查询
    let query = supabase
      .from('user_favorites')
      .select(`
        id,
        tool_id,
        created_at,
        tools (
          id,
          name,
          slug,
          tagline,
          description,
          logo_url,
          website_url,
          rating,
          users_count,
          upvotes_count,
          pricing_type,
          created_at,
          updated_at,
          tool_categories (
            category:categories (
              id,
              name,
              slug,
              icon,
              color
            )
          ),
          tool_tags (
            tag:tags (
              id,
              name,
              slug,
              color
            )
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // 应用分页
    const { data: favorites, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching favorites:', error)
      return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
    }

    // 处理数据格式
    const formattedFavorites = favorites?.map(fav => ({
      id: fav.id,
      tool_id: fav.tool_id,
      favorited_at: fav.created_at,
      tool: {
        ...fav.tools,
        categories: fav.tools?.tool_categories?.map((tc: any) => tc.category) || [],
        tags: fav.tools?.tool_tags?.map((tt: any) => tt.tag) || []
      }
    })) || []

    // 应用筛选
    let filteredFavorites = formattedFavorites
    
    if (category) {
      filteredFavorites = filteredFavorites.filter(fav => 
        fav.tool.categories.some((cat: any) => cat.slug === category)
      )
    }

    if (search) {
      filteredFavorites = filteredFavorites.filter(fav =>
        fav.tool.name.toLowerCase().includes(search.toLowerCase()) ||
        fav.tool.tagline.toLowerCase().includes(search.toLowerCase()) ||
        fav.tool.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    // 获取总数
    const { count: totalCount } = await supabase
      .from('user_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return NextResponse.json({
      success: true,
      data: {
        favorites: filteredFavorites,
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error in favorites API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 添加收藏
export async function POST(request: NextRequest) {
  try {
    const { userId, toolId } = await request.json()

    if (!userId || !toolId) {
      return NextResponse.json({ error: 'User ID and Tool ID are required' }, { status: 400 })
    }

    // 检查是否已收藏
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('tool_id', toolId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Tool already favorited' }, { status: 409 })
    }

    // 添加收藏
    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        tool_id: toolId
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding favorite:', error)
      return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 })
    }

    // 更新工具收藏数
    await supabase.rpc('increment_tool_favorites', { tool_id: toolId })

    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error('Error in add favorite API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 取消收藏
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const toolId = searchParams.get('toolId')

    if (!userId || !toolId) {
      return NextResponse.json({ error: 'User ID and Tool ID are required' }, { status: 400 })
    }

    // 删除收藏
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('tool_id', toolId)

    if (error) {
      console.error('Error removing favorite:', error)
      return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 })
    }

    // 更新工具收藏数
    await supabase.rpc('decrement_tool_favorites', { tool_id: parseInt(toolId) })

    return NextResponse.json({
      success: true,
      message: 'Favorite removed successfully'
    })

  } catch (error) {
    console.error('Error in remove favorite API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}