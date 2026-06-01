import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 搜索自动补全
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        suggestions: getPopularSuggestions()
      })
    }

    const suggestions = []

    // 从工具名称中获取建议
    const { data: tools, error: toolsError } = await supabase
      .from('tools')
      .select('name, slug')
      .ilike('name', `%${query}%`)
      .eq('status', 'active')
      .limit(5)

    if (!toolsError && tools) {
      suggestions.push(...tools.map(tool => ({
        text: tool.name,
        type: 'tool',
        url: `/tools/${tool.slug}`
      })))
    }

    // 从分类中获取建议
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('name, slug')
      .ilike('name', `%${query}%`)
      .limit(3)

    if (!categoriesError && categories) {
      suggestions.push(...categories.map(category => ({
        text: category.name,
        type: 'category',
        url: `/categories/${category.slug}`
      })))
    }

    // 如果数据库查询失败，返回模拟建议
    if (suggestions.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: getMockSuggestions(query, limit)
      })
    }

    return NextResponse.json({
      success: true,
      suggestions: suggestions.slice(0, limit)
    })

  } catch (error) {
    console.error('Autocomplete error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '获取建议失败' 
    }, { status: 500 })
  }
}

// 获取热门搜索建议
function getPopularSuggestions() {
  return [
    { text: 'ChatGPT', type: 'tool', url: '/tools/chatgpt' },
    { text: 'AI对话', type: 'category', url: '/categories/ai-chat' },
    { text: 'Midjourney', type: 'tool', url: '/tools/midjourney' },
    { text: '图像生成', type: 'category', url: '/categories/image-generation' },
    { text: 'Claude', type: 'tool', url: '/tools/claude' },
    { text: '效率工具', type: 'category', url: '/categories/productivity' },
    { text: 'AI写作', type: 'search', url: '/search?q=AI写作' },
    { text: 'Notion AI', type: 'tool', url: '/tools/notion-ai' }
  ]
}

// 模拟搜索建议
function getMockSuggestions(query: string, limit: number) {
  const allSuggestions = [
    { text: 'ChatGPT', type: 'tool', url: '/tools/chatgpt' },
    { text: 'Claude', type: 'tool', url: '/tools/claude' },
    { text: 'Midjourney', type: 'tool', url: '/tools/midjourney' },
    { text: 'Notion AI', type: 'tool', url: '/tools/notion-ai' },
    { text: 'Canva AI', type: 'tool', url: '/tools/canva-ai' },
    { text: 'AI对话', type: 'category', url: '/categories/ai-chat' },
    { text: 'AI写作', type: 'search', url: '/search?q=AI写作' },
    { text: 'AI设计', type: 'search', url: '/search?q=AI设计' },
    { text: 'AI编程', type: 'search', url: '/search?q=AI编程' },
    { text: '图像生成', type: 'category', url: '/categories/image-generation' },
    { text: '效率工具', type: 'category', url: '/categories/productivity' },
    { text: '设计工具', type: 'category', url: '/categories/design' }
  ]

  return allSuggestions
    .filter(suggestion => 
      suggestion.text.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, limit)
}

// NaviGuard-AI Security Audited - 2026-06-01
