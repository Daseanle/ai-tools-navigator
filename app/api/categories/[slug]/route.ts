import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface RouteParams {
  params: {
    slug: string
  }
}

// 获取单个分类详情
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params
    const { searchParams } = new URL(request.url)
    const includeTools = searchParams.get('includeTools') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Get category error:', error)
      // 返回模拟数据作为回退
      const mockCategory = getMockCategory(slug, includeTools, limit, offset)
      if (mockCategory) {
        return NextResponse.json({
          success: true,
          category: mockCategory
        })
      }
      return NextResponse.json({ 
        success: false, 
        error: '分类不存在' 
      }, { status: 404 })
    }

    let processedCategory = category

    // 如果需要包含工具列表
    if (includeTools) {
      const { data: tools, error: toolsError } = await supabase
        .from('tools')
        .select('*')
        .eq('category_id', category.id)
        .eq('status', 'active')
        .order('rating', { ascending: false })
        .range(offset, offset + limit - 1)

      if (!toolsError) {
        processedCategory = {
          ...category,
          tools: tools || []
        }
      }
    }

    // 获取工具数量
    const { count } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category.id)
      .eq('status', 'active')

    processedCategory.toolCount = count || 0

    return NextResponse.json({
      success: true,
      category: processedCategory
    })

  } catch (error) {
    console.error('Get category error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// 更新分类信息
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params
    const updates = await request.json()

    const { data: category, error } = await supabase
      .from('categories')
      .update({
        name: updates.name,
        description: updates.description,
        icon: updates.icon,
        color: updates.color,
        featured: updates.featured,
        sort_order: updates.sortOrder,
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug)
      .select()
      .single()

    if (error) {
      console.error('Update category error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '更新分类失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      category: category,
      message: '分类更新成功'
    })

  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// 删除分类
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params

    // 检查分类下是否有工具
    const { count } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', slug)

    if (count && count > 0) {
      return NextResponse.json({ 
        success: false, 
        error: '无法删除包含工具的分类' 
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('slug', slug)

    if (error) {
      console.error('Delete category error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '删除分类失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '分类删除成功'
    })

  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// 模拟分类数据
function getMockCategory(slug: string, includeTools: boolean, limit: number, offset: number) {
  const mockCategories: Record<string, any> = {
    'ai-chat': {
      id: '1',
      name: 'AI对话',
      slug: 'ai-chat',
      description: '智能对话助手和聊天机器人，提供自然语言交互体验',
      icon: 'MessageCircle',
      color: '#3B82F6',
      featured: true,
      sort_order: 1,
      toolCount: 25,
      created_at: '2024-01-01T00:00:00Z'
    },
    'image-generation': {
      id: '2',
      name: '图像生成',
      slug: 'image-generation',
      description: 'AI图像生成和编辑工具，创造惊人的视觉内容',
      icon: 'Image',
      color: '#10B981',
      featured: true,
      sort_order: 2,
      toolCount: 18,
      created_at: '2024-01-01T00:00:00Z'
    },
    'productivity': {
      id: '3',
      name: '效率工具',
      slug: 'productivity',
      description: '提升工作效率的AI工具，优化工作流程',
      icon: 'Zap',
      color: '#F59E0B',
      featured: true,
      sort_order: 3,
      toolCount: 32,
      created_at: '2024-01-01T00:00:00Z'
    },
    'design': {
      id: '4',
      name: '设计工具',
      slug: 'design',
      description: 'AI设计和创意工具，助力设计师创作',
      icon: 'Palette',
      color: '#EF4444',
      featured: true,
      sort_order: 4,
      toolCount: 15,
      created_at: '2024-01-01T00:00:00Z'
    },
    'programming': {
      id: '5',
      name: '编程助手',
      slug: 'programming',
      description: '代码生成和编程辅助工具，提升开发效率',
      icon: 'Code',
      color: '#8B5CF6',
      featured: true,
      sort_order: 5,
      toolCount: 22,
      created_at: '2024-01-01T00:00:00Z'
    }
  }

  const category = mockCategories[slug]
  if (!category) return null

  if (includeTools) {
    const mockTools = [
      {
        id: '1',
        name: 'ChatGPT',
        slug: 'chatgpt',
        description: '强大的AI对话助手',
        logo: '/logos/chatgpt.png',
        rating: 4.8,
        visits: 1250000,
        featured: true,
        pricing: 'Freemium',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Claude',
        slug: 'claude',
        description: 'Anthropic开发的AI助手',
        logo: '/logos/claude.png',
        rating: 4.7,
        visits: 890000,
        featured: true,
        pricing: 'Freemium',
        created_at: '2024-01-01T00:00:00Z'
      }
    ]

    category.tools = mockTools.slice(offset, offset + limit)
  }

  return category
}