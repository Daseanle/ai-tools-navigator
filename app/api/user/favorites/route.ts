import { NextRequest } from 'next/server'
import { withAuth, createApiResponse, handleApiError } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'

// 获取用户收藏列表
export async function GET(request: NextRequest) {
  return (await withAuth(async (request: NextRequest, user: any) => {
    try {
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '20')
      const category = searchParams.get('category') || ''
      const search = searchParams.get('search') || ''

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
            description,
            logo,
            website,
            rating,
            visits,
            pricing,
            featured,
            categories (
              id,
              name,
              slug,
              icon,
              color
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // 应用分页
      const { data: favorites, error, count } = await query
        .range(offset, offset + limit - 1)

      if (error) {
        return handleApiError(error, '获取收藏列表失败')
      }

      // 处理数据格式
      const formattedFavorites = favorites?.map(fav => ({
        id: fav.id,
        tool_id: fav.tool_id,
        favorited_at: fav.created_at,
        tool: fav.tools
      })) || []

      // 应用筛选
      let filteredFavorites = formattedFavorites
      
      if (category) {
        filteredFavorites = filteredFavorites.filter(fav => 
          (fav.tool as any).categories?.slug === category
        )
      }

      if (search) {
        filteredFavorites = filteredFavorites.filter(fav =>
          (fav.tool as any).name.toLowerCase().includes(search.toLowerCase()) ||
          (fav.tool as any).description.toLowerCase().includes(search.toLowerCase())
        )
      }

      // 获取总数
      const { count: totalCount } = await supabase
        .from('user_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      return createApiResponse({
        favorites: filteredFavorites,
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / limit)
        }
      })

    } catch (error) {
      return handleApiError(error, '获取收藏列表失败')
    }
  }))(request)
}

// 添加收藏
export async function POST(request: NextRequest) {
  return (await withAuth(async (request: NextRequest, user: any) => {
    try {
      const { toolId } = await request.json()

      if (!toolId) {
        return createApiResponse(null, false, '工具ID是必须的', 400)
      }

      // 检查是否已收藏
      const { data: existing } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('tool_id', toolId)
        .single()

      if (existing) {
        return createApiResponse(null, false, '工具已被收藏', 409)
      }

      // 添加收藏
      const { data, error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          tool_id: toolId
        })
        .select()
        .single()

      if (error) {
        return handleApiError(error, '添加收藏失败')
      }

      return createApiResponse(data, true, '收藏成功')

    } catch (error) {
      return handleApiError(error, '添加收藏失败')
    }
  }))(request)
}

// 取消收藏
export async function DELETE(request: NextRequest) {
  return (await withAuth(async (request: NextRequest, user: any) => {
    try {
      const { searchParams } = new URL(request.url)
      const toolId = searchParams.get('toolId')

      if (!toolId) {
        return createApiResponse(null, false, '工具ID是必须的', 400)
      }

      // 删除收藏
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('tool_id', toolId)

      if (error) {
        return handleApiError(error, '取消收藏失败')
      }

      return createApiResponse(null, true, '取消收藏成功')

    } catch (error) {
      return handleApiError(error, '取消收藏失败')
    }
  }))(request)
}

// NaviGuard-AI Security Audited - 2026-06-01
