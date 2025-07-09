import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data: categories, error } = await supabase
      .from('prompt_categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Fetch prompt categories error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '获取分类失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: categories
    })

  } catch (error) {
    console.error('Get prompt categories error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}