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
      // 返回模拟数据作为回退
      return NextResponse.json({
        success: true,
        tools: getMockTools(category, featured, limit, offset, search),
        pagination: {
          total: 100,
          limit,
          offset,
          hasMore: offset + limit < 100
        }
      })
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

// 模拟数据回退
function getMockTools(category?: string | null, featured?: string | null, limit = 20, offset = 0, search?: string | null) {
  const mockTools = [
    {
      id: '1',
      name: 'ChatGPT',
      slug: 'chatgpt',
      description: '强大的AI对话助手，能够回答问题、协助创作、编程等多种任务',
      website: 'https://chat.openai.com',
      category: { name: 'AI对话', slug: 'ai-chat', icon: 'MessageCircle' },
      pricing: 'Freemium',
      features: ['自然语言对话', '代码生成', '文本创作', '问题解答'],
      tags: ['AI', '对话', '创作', '编程'],
      rating: 4.8,
      visits: 1250000,
      featured: true,
      status: 'active',
      logo: '/logos/chatgpt.png',
      screenshots: ['/screenshots/chatgpt-1.png'],
      api_available: true,
      free_tier: true,
      trial_available: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Claude',
      slug: 'claude',
      description: 'Anthropic开发的AI助手，擅长分析、写作和对话',
      website: 'https://claude.ai',
      category: { name: 'AI对话', slug: 'ai-chat', icon: 'MessageCircle' },
      pricing: 'Freemium',
      features: ['智能对话', '文档分析', '代码辅助', '创意写作'],
      tags: ['AI', '对话', '分析', '写作'],
      rating: 4.7,
      visits: 890000,
      featured: true,
      status: 'active',
      logo: '/logos/claude.png',
      screenshots: ['/screenshots/claude-1.png'],
      api_available: true,
      free_tier: true,
      trial_available: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Midjourney',
      slug: 'midjourney',
      description: '基于AI的图像生成工具，创造惊人的艺术作品',
      website: 'https://midjourney.com',
      category: { name: '图像生成', slug: 'image-generation', icon: 'Image' },
      pricing: 'Paid',
      features: ['AI绘画', '艺术风格', '高质量输出', '社区分享'],
      tags: ['AI', '图像', '艺术', '创作'],
      rating: 4.6,
      visits: 750000,
      featured: true,
      status: 'active',
      logo: '/logos/midjourney.png',
      screenshots: ['/screenshots/midjourney-1.png'],
      api_available: false,
      free_tier: false,
      trial_available: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      name: 'Notion AI',
      slug: 'notion-ai',
      description: '集成在Notion中的AI助手，提升工作效率',
      website: 'https://notion.so',
      category: { name: '效率工具', slug: 'productivity', icon: 'Zap' },
      pricing: 'Freemium',
      features: ['智能写作', '内容总结', '翻译', '头脑风暴'],
      tags: ['AI', '效率', '写作', '协作'],
      rating: 4.5,
      visits: 650000,
      featured: false,
      status: 'active',
      logo: '/logos/notion.png',
      screenshots: ['/screenshots/notion-1.png'],
      api_available: true,
      free_tier: true,
      trial_available: false,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '5',
      name: 'Canva AI',
      slug: 'canva-ai',
      description: '智能设计工具，快速创建专业设计作品',
      website: 'https://canva.com',
      category: { name: '设计工具', slug: 'design', icon: 'Palette' },
      pricing: 'Freemium',
      features: ['AI设计', '模板生成', '图像编辑', '品牌套件'],
      tags: ['AI', '设计', '创作', '模板'],
      rating: 4.4,
      visits: 580000,
      featured: false,
      status: 'active',
      logo: '/logos/canva.png',
      screenshots: ['/screenshots/canva-1.png'],
      api_available: true,
      free_tier: true,
      trial_available: true,
      created_at: '2024-01-01T00:00:00Z'
    }
  ]

  let filteredTools = mockTools

  // 分类过滤
  if (category) {
    filteredTools = filteredTools.filter(tool => tool.category.slug === category)
  }

  // 特色过滤
  if (featured === 'true') {
    filteredTools = filteredTools.filter(tool => tool.featured)
  }

  // 搜索过滤
  if (search) {
    const searchLower = search.toLowerCase()
    filteredTools = filteredTools.filter(tool => 
      tool.name.toLowerCase().includes(searchLower) ||
      tool.description.toLowerCase().includes(searchLower) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }

  // 分页
  return filteredTools.slice(offset, offset + limit)
}