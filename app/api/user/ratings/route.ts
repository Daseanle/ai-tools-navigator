import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 获取用户评分列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const toolId = searchParams.get('toolId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const offset = (page - 1) * limit

    // 构建查询
    let query = supabase
      .from('user_ratings')
      .select(`
        id,
        user_id,
        tool_id,
        rating,
        comment,
        created_at,
        updated_at,
        tools (
          id,
          name,
          slug,
          tagline,
          logo_url,
          rating,
          users_count
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // 如果指定了工具ID，只返回该工具的评分
    if (toolId) {
      query = query.eq('tool_id', toolId)
    }

    // 应用分页
    const { data: ratings, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching ratings:', error)
      return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 })
    }

    // 获取总数
    const { count: totalCount } = await supabase
      .from('user_ratings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return NextResponse.json({
      success: true,
      data: {
        ratings: ratings || [],
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error in ratings API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 添加或更新评分
export async function POST(request: NextRequest) {
  try {
    const { userId, toolId, rating, comment } = await request.json()

    if (!userId || !toolId || !rating) {
      return NextResponse.json({ 
        error: 'User ID, Tool ID, and rating are required' 
      }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ 
        error: 'Rating must be between 1 and 5' 
      }, { status: 400 })
    }

    // 检查是否已存在评分
    const { data: existing } = await supabase
      .from('user_ratings')
      .select('id')
      .eq('user_id', userId)
      .eq('tool_id', toolId)
      .single()

    if (existing) {
      // 更新现有评分
      const { data, error } = await supabase
        .from('user_ratings')
        .update({
          rating,
          comment: comment || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating rating:', error)
        return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 })
      }

      // 重新计算工具平均评分
      await updateToolRating(toolId)

      return NextResponse.json({
        success: true,
        data: data,
        message: 'Rating updated successfully'
      })

    } else {
      // 添加新评分
      const { data, error } = await supabase
        .from('user_ratings')
        .insert({
          user_id: userId,
          tool_id: toolId,
          rating,
          comment: comment || null
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding rating:', error)
        return NextResponse.json({ error: 'Failed to add rating' }, { status: 500 })
      }

      // 重新计算工具平均评分
      await updateToolRating(toolId)

      return NextResponse.json({
        success: true,
        data: data,
        message: 'Rating added successfully'
      })
    }

  } catch (error) {
    console.error('Error in add/update rating API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 删除评分
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const toolId = searchParams.get('toolId')

    if (!userId || !toolId) {
      return NextResponse.json({ 
        error: 'User ID and Tool ID are required' 
      }, { status: 400 })
    }

    // 删除评分
    const { error } = await supabase
      .from('user_ratings')
      .delete()
      .eq('user_id', userId)
      .eq('tool_id', toolId)

    if (error) {
      console.error('Error deleting rating:', error)
      return NextResponse.json({ error: 'Failed to delete rating' }, { status: 500 })
    }

    // 重新计算工具平均评分
    await updateToolRating(parseInt(toolId))

    return NextResponse.json({
      success: true,
      message: 'Rating deleted successfully'
    })

  } catch (error) {
    console.error('Error in delete rating API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 辅助函数：更新工具平均评分
async function updateToolRating(toolId: number) {
  try {
    // 获取该工具的所有评分
    const { data: ratings } = await supabase
      .from('user_ratings')
      .select('rating')
      .eq('tool_id', toolId)

    if (ratings && ratings.length > 0) {
      // 计算平均评分
      const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      const roundedRating = Math.round(avgRating * 10) / 10 // 保留一位小数

      // 更新工具表中的评分
      await supabase
        .from('tools')
        .update({
          rating: roundedRating,
          ratings_count: ratings.length
        })
        .eq('id', toolId)
    } else {
      // 如果没有评分，重置为0
      await supabase
        .from('tools')
        .update({
          rating: 0,
          ratings_count: 0
        })
        .eq('id', toolId)
    }
  } catch (error) {
    console.error('Error updating tool rating:', error)
  }
}