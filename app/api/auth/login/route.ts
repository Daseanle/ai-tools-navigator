import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 用户登录
export async function POST(request: NextRequest) {
  try {
    const { email, password, provider } = await request.json()

    if (provider === 'email') {
      if (!email || !password) {
        return NextResponse.json({ 
          success: false, 
          error: '邮箱和密码必填' 
        }, { status: 400 })
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Login error:', error)
        return NextResponse.json({ 
          success: false, 
          error: '登录失败，请检查邮箱和密码' 
        }, { status: 401 })
      }

      return NextResponse.json({
        success: true,
        user: data.user,
        session: data.session,
        message: '登录成功'
      })

    } else if (provider === 'google') {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
        }
      })

      if (error) {
        console.error('Google login error:', error)
        return NextResponse.json({ 
          success: false, 
          error: 'Google登录失败' 
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        url: data.url,
        message: '正在跳转到Google登录'
      })

    } else {
      return NextResponse.json({ 
        success: false, 
        error: '不支持的登录方式' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
