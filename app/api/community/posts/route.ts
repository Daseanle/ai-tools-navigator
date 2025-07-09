import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 获取社区动态/帖子列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category') || ''
    const tag = searchParams.get('tag') || ''
    const sort = searchParams.get('sort') || 'newest' // newest, popular, trending
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit

    // 构建查询
    let query = supabase
      .from('community_posts')
      .select(`
        id,
        user_id,
        title,
        content,
        type,
        category,
        tags,
        images,
        links,
        upvotes,
        downvotes,
        comments_count,
        views,
        featured,
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
      .eq('status', 'published')

    // 应用筛选
    if (category) {
      query = query.eq('category', category)
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    // 应用排序
    switch (sort) {
      case 'popular':
        query = query.order('upvotes', { ascending: false })
        break
      case 'trending':
        // 简化的趋势算法：24小时内的点赞数
        query = query.order('created_at', { ascending: false })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    // 应用分页
    const { data: posts, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching community posts:', error)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    // 获取总数
    const { count: totalCount } = await supabase
      .from('community_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    return NextResponse.json({
      success: true,
      data: {
        posts: posts || [],
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error in community posts API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 创建新帖子
export async function POST(request: NextRequest) {
  try {
    const { userId, title, content, type, category, tags, images, links } = await request.json()

    if (!userId || !title || !content) {
      return NextResponse.json({ 
        error: 'User ID, title, and content are required' 
      }, { status: 400 })
    }

    const validTypes = ['discussion', 'question', 'showcase', 'feedback', 'announcement']
    const validCategories = ['general', 'tools', 'prompts', 'tutorials', 'news', 'help']

    if (type && !validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid post type' }, { status: 400 })
    }

    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // 创建帖子
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: userId,
        title,
        content,
        type: type || 'discussion',
        category: category || 'general',
        tags: tags || [],
        images: images || [],
        links: links || [],
        status: 'published'
      })
      .select(`
        id,
        user_id,
        title,
        content,
        type,
        category,
        tags,
        images,
        links,
        upvotes,
        downvotes,
        comments_count,
        views,
        featured,
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
      console.error('Error creating community post:', error)
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Post created successfully'
    })

  } catch (error) {
    console.error('Error in create community post API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}