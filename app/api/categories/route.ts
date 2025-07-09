import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 获取分类列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeCount = searchParams.get('includeCount') === 'true'
    const featured = searchParams.get('featured')

    let query = supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    const { data: categories, error } = await query

    if (error) {
      console.error('Get categories error:', error)
      // 返回模拟数据作为回退
      return NextResponse.json({
        success: true,
        categories: getMockCategories(includeCount, featured === 'true')
      })
    }

    let processedCategories = categories || []

    // 如果需要包含工具数量
    if (includeCount) {
      processedCategories = await Promise.all(
        processedCategories.map(async (category) => {
          const { count } = await supabase
            .from('tools')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('status', 'active')

          return {
            ...category,
            toolCount: count || 0
          }
        })
      )
    }

    return NextResponse.json({
      success: true,
      categories: processedCategories
    })

  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '获取分类失败' 
    }, { status: 500 })
  }
}

// 创建新分类
export async function POST(request: NextRequest) {
  try {
    const category = await request.json()
    
    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert([{
        name: category.name,
        slug: category.slug || generateSlug(category.name),
        description: category.description,
        icon: category.icon,
        color: category.color,
        featured: category.featured || false,
        sort_order: category.sortOrder || 0,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Create category error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '创建分类失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      category: newCategory,
      message: '分类创建成功'
    })

  } catch (error) {
    console.error('Create category error:', error)
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

// 模拟分类数据
function getMockCategories(includeCount: boolean, featuredOnly: boolean) {
  const mockCategories = [
    {
      id: '1',
      name: 'AI对话',
      slug: 'ai-chat',
      description: '智能对话助手和聊天机器人',
      icon: 'MessageCircle',
      color: '#3B82F6',
      featured: true,
      sort_order: 1,
      toolCount: 25,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: '图像生成',
      slug: 'image-generation',
      description: 'AI图像生成和编辑工具',
      icon: 'Image',
      color: '#10B981',
      featured: true,
      sort_order: 2,
      toolCount: 18,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: '效率工具',
      slug: 'productivity',
      description: '提升工作效率的AI工具',
      icon: 'Zap',
      color: '#F59E0B',
      featured: true,
      sort_order: 3,
      toolCount: 32,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      name: '设计工具',
      slug: 'design',
      description: 'AI设计和创意工具',
      icon: 'Palette',
      color: '#EF4444',
      featured: true,
      sort_order: 4,
      toolCount: 15,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '5',
      name: '编程助手',
      slug: 'programming',
      description: '代码生成和编程辅助工具',
      icon: 'Code',
      color: '#8B5CF6',
      featured: true,
      sort_order: 5,
      toolCount: 22,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '6',
      name: '数据分析',
      slug: 'data-analysis',
      description: 'AI数据分析和可视化工具',
      icon: 'BarChart3',
      color: '#06B6D4',
      featured: false,
      sort_order: 6,
      toolCount: 12,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '7',
      name: '音频处理',
      slug: 'audio',
      description: 'AI音频生成和编辑工具',
      icon: 'Music',
      color: '#F97316',
      featured: false,
      sort_order: 7,
      toolCount: 8,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '8',
      name: '视频制作',
      slug: 'video',
      description: 'AI视频生成和编辑工具',
      icon: 'Video',
      color: '#EC4899',
      featured: false,
      sort_order: 8,
      toolCount: 10,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '9',
      name: '翻译工具',
      slug: 'translation',
      description: 'AI翻译和语言处理工具',
      icon: 'Globe',
      color: '#84CC16',
      featured: false,
      sort_order: 9,
      toolCount: 6,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '10',
      name: '教育学习',
      slug: 'education',
      description: 'AI教育和学习辅助工具',
      icon: 'GraduationCap',
      color: '#6366F1',
      featured: false,
      sort_order: 10,
      toolCount: 14,
      created_at: '2024-01-01T00:00:00Z'
    }
  ]

  let filteredCategories = mockCategories

  if (featuredOnly) {
    filteredCategories = filteredCategories.filter(cat => cat.featured)
  }

  if (!includeCount) {
    filteredCategories = filteredCategories.map(cat => {
      const { toolCount, ...rest } = cat
      return rest
    })
  }

  return filteredCategories
}