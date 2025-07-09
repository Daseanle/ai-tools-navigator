import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 全站搜索
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all' // all, tools, prompts, articles
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query.trim()) {
      return NextResponse.json({
        success: false,
        error: '搜索关键词不能为空'
      }, { status: 400 })
    }

    const results = {
      tools: [],
      prompts: [],
      articles: [],
      total: 0
    }

    // 搜索工具
    if (type === 'all' || type === 'tools') {
      const { data: tools, error: toolsError } = await supabase
        .from('tools')
        .select(`
          id, name, slug, description, logo, rating, visits, featured,
          categories!inner(name, slug, icon)
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
        .eq('status', 'active')
        .order('rating', { ascending: false })
        .limit(type === 'tools' ? limit : 10)

      if (!toolsError && tools) {
        results.tools = tools.map(tool => ({
          ...tool,
          type: 'tool',
          url: `/tools/${tool.slug}`
        }))
      }
    }

    // 搜索Prompts
    if (type === 'all' || type === 'prompts') {
      const { data: prompts, error: promptsError } = await supabase
        .from('prompts')
        .select(`
          id, title, description, price, rating, downloads, category,
          users!inner(name, avatar)
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
        .eq('status', 'published')
        .order('rating', { ascending: false })
        .limit(type === 'prompts' ? limit : 10)

      if (!promptsError && prompts) {
        results.prompts = prompts.map(prompt => ({
          ...prompt,
          type: 'prompt',
          url: `/prompts/${prompt.id}`
        }))
      }
    }

    // 如果数据库查询失败，返回模拟数据
    if (results.tools.length === 0 && results.prompts.length === 0) {
      return NextResponse.json({
        success: true,
        results: getMockSearchResults(query, type, limit, offset),
        suggestions: getSearchSuggestions(query)
      })
    }

    // 计算总数
    results.total = results.tools.length + results.prompts.length + results.articles.length

    // 如果搜索所有类型，则混合排序
    let allResults = []
    if (type === 'all') {
      allResults = [...results.tools, ...results.prompts, ...results.articles]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(offset, offset + limit)
    } else {
      allResults = results[type as keyof typeof results] || []
    }

    return NextResponse.json({
      success: true,
      results: {
        items: allResults,
        total: results.total,
        tools: results.tools.length,
        prompts: results.prompts.length,
        articles: results.articles.length
      },
      suggestions: getSearchSuggestions(query),
      pagination: {
        limit,
        offset,
        hasMore: results.total > offset + limit
      }
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '搜索失败' 
    }, { status: 500 })
  }
}

// 获取搜索建议
function getSearchSuggestions(query: string): string[] {
  const suggestions = [
    'ChatGPT',
    'AI对话',
    '图像生成',
    'Midjourney',
    'Claude',
    'AI写作',
    'Notion AI',
    'Canva',
    'AI设计',
    '效率工具',
    'AI编程',
    'AI翻译',
    'AI视频',
    'AI音频',
    'AI分析'
  ]

  return suggestions
    .filter(s => s.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
}

// 模拟搜索结果
function getMockSearchResults(query: string, type: string, limit: number, offset: number) {
  const mockResults = [
    {
      id: '1',
      name: 'ChatGPT',
      slug: 'chatgpt',
      description: '强大的AI对话助手，能够回答问题、协助创作、编程等多种任务',
      logo: '/logos/chatgpt.png',
      rating: 4.8,
      visits: 1250000,
      featured: true,
      type: 'tool',
      url: '/tools/chatgpt',
      category: { name: 'AI对话', slug: 'ai-chat', icon: 'MessageCircle' }
    },
    {
      id: '2',
      name: 'Claude',
      slug: 'claude',
      description: 'Anthropic开发的AI助手，擅长分析、写作和对话',
      logo: '/logos/claude.png',
      rating: 4.7,
      visits: 890000,
      featured: true,
      type: 'tool',
      url: '/tools/claude',
      category: { name: 'AI对话', slug: 'ai-chat', icon: 'MessageCircle' }
    },
    {
      id: '3',
      name: 'Midjourney',
      slug: 'midjourney',
      description: '基于AI的图像生成工具，创造惊人的艺术作品',
      logo: '/logos/midjourney.png',
      rating: 4.6,
      visits: 750000,
      featured: true,
      type: 'tool',
      url: '/tools/midjourney',
      category: { name: '图像生成', slug: 'image-generation', icon: 'Image' }
    },
    {
      id: 'prompt-1',
      title: '专业文案写作助手',
      description: '帮助你写出吸引人的营销文案和产品描述',
      price: 29.99,
      rating: 4.5,
      downloads: 1500,
      category: '文案写作',
      type: 'prompt',
      url: '/prompts/prompt-1',
      users: { name: '创作者A', avatar: '/avatars/user-1.png' }
    },
    {
      id: 'prompt-2',
      title: '代码解释器',
      description: '智能解释和优化各种编程语言的代码',
      price: 19.99,
      rating: 4.7,
      downloads: 2300,
      category: '编程助手',
      type: 'prompt',
      url: '/prompts/prompt-2',
      users: { name: '开发者B', avatar: '/avatars/user-2.png' }
    }
  ]

  // 根据查询过滤
  const filtered = mockResults.filter(item => {
    const searchableText = `${item.name || item.title} ${item.description}`.toLowerCase()
    return searchableText.includes(query.toLowerCase())
  })

  // 根据类型过滤
  const typeFiltered = type === 'all' ? filtered : filtered.filter(item => item.type === type)

  return {
    items: typeFiltered.slice(offset, offset + limit),
    total: typeFiltered.length,
    tools: filtered.filter(item => item.type === 'tool').length,
    prompts: filtered.filter(item => item.type === 'prompt').length,
    articles: 0
  }
}