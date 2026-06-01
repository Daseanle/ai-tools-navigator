import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 用户登出
export async function POST(request: NextRequest) {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '登出失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '登出成功'
    })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
