import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // 测试数据库连接
    console.log('Testing database connection...')
    
    // 检查 tools 表
    const { data: tools, error: toolsError, count: toolsCount } = await supabase
      .from('tools')
      .select('id, name, slug, status', { count: 'exact' })
      .limit(5)

    console.log('Tools query result:', { tools, toolsError, toolsCount })

    // 检查 categories 表
    const { data: categories, error: categoriesError, count: categoriesCount } = await supabase
      .from('categories')
      .select('id, name, slug, is_active', { count: 'exact' })
      .limit(5)

    console.log('Categories query result:', { categories, categoriesError, categoriesCount })

    // 检查数据库表是否存在
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['tools', 'categories'])

    console.log('Tables check:', { tables, tablesError })

    return NextResponse.json({
      success: true,
      debug: {
        environment: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        },
        tools: {
          data: tools,
          error: toolsError,
          count: toolsCount
        },
        categories: {
          data: categories,
          error: categoriesError,
          count: categoriesCount
        },
        tables: {
          data: tables,
          error: tablesError
        }
      }
    })

  } catch (error) {
    console.error('Database debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '数据库连接失败',
      debug: {
        environment: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      }
    }, { status: 500 })
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
