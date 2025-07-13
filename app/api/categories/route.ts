import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 获取分类列表
export async function GET(request: NextRequest) {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Categories API error:', error)
      return NextResponse.json({
        success: false,
        error: '获取分类失败: ' + error.message,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { categories: categories || [] },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json({
      success: false,
      error: '获取分类失败: ' + (error instanceof Error ? error.message : String(error)),
      timestamp: new Date().toISOString()
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
        sort_order: category.sortOrder || 0,
        is_active: true
      }])
      .select()
      .single()

    if (error) {
      return handleApiError(error, '创建分类失败')
    }

    return createApiResponse(newCategory, true, '分类创建成功')

  } catch (error) {
    return handleApiError(error, '创建分类失败')
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