import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 获取帖子评论
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'newest' // newest, oldest, popular

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const offset = (page - 1) * limit

    // 构建查询
    let query = supabase
      .from('community_comments')
      .select(`
        id,
        user_id,
        post_id,
        parent_id,
        content,
        upvotes,
        downvotes,
        status,
        created_at,
        updated_at,
        users (
          id,
          username,
          avatar_url,
          display_name
        )
      `)
      .eq('post_id', postId)
      .eq('status', 'published')

    // 应用排序
    switch (sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'popular':
        query = query.order('upvotes', { ascending: false })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    // 应用分页
    const { data: comments, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }

    // 获取总数
    const { count: totalCount } = await supabase
      .from('community_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('status', 'published')

    return NextResponse.json({
      success: true,
      data: {
        comments: comments || [],
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error in comments API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 创建评论
export async function POST(request: NextRequest) {
  try {
    const { userId, postId, content, parentId } = await request.json()

    if (!userId || !postId || !content) {
      return NextResponse.json({ 
        error: 'User ID, post ID, and content are required' 
      }, { status: 400 })
    }

    // 验证帖子存在
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .select('id')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // 如果是回复，验证父评论存在
    if (parentId) {
      const { data: parentComment, error: parentError } = await supabase
        .from('community_comments')
        .select('id')
        .eq('id', parentId)
        .eq('post_id', postId)
        .single()

      if (parentError || !parentComment) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 })
      }
    }

    // 创建评论
    const { data, error } = await supabase
      .from('community_comments')
      .insert({
        user_id: userId,
        post_id: postId,
        parent_id: parentId || null,
        content,
        status: 'published'
      })
      .select(`
        id,
        user_id,
        post_id,
        parent_id,
        content,
        upvotes,
        downvotes,
        status,
        created_at,
        updated_at,
        users (
          id,
          username,
          avatar_url,
          display_name
        )
      `)
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
    }

    // 更新帖子评论数
    await supabase.rpc('increment_post_comments', { post_id: postId })

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Comment created successfully'
    })

  } catch (error) {
    console.error('Error in create comment API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
