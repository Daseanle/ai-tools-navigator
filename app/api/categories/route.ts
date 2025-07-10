import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createApiResponse, handleApiError } from '@/lib/auth-middleware'

// 获取分类列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeCount = searchParams.get('includeCount') === 'true'
    const featured = searchParams.get('featured')

    let query = supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    const { data: categories, error } = await query

    if (error) {
      return handleApiError(error, '获取分类失败')
    }

    let processedCategories = categories || []

    // 如果需要包含工具数量，使用优化的查询
    if (includeCount) {
      // 使用物化视图优化查询
      const { data: toolCounts, error: countError } = await supabase
        .from('tool_statistics')
        .select('category_id, count')
        .eq('status', 'active')

      if (countError) {
        console.error('Tool count query error:', countError)
      }

      const countMap = new Map()
      toolCounts?.forEach((item: any) => {
        countMap.set(item.category_id, item.count)
      })

      processedCategories = processedCategories.map(category => ({
        ...category,
        toolCount: countMap.get(category.id) || 0
      }))
    }

    return createApiResponse({
      categories: processedCategories
    })

  } catch (error) {
    return handleApiError(error, '获取分类失败')
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