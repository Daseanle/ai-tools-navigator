import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 用户注册
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ 
        success: false, 
        error: '邮箱、密码和姓名必填' 
      }, { status: 400 })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        error: '邮箱格式无效' 
      }, { status: 400 })
    }

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json({ 
        success: false, 
        error: '密码至少6位' 
      }, { status: 400 })
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          avatar: '/avatars/default.png'
        }
      }
    })

    if (error) {
      console.error('Register error:', error)
      
      if (error.message.includes('already registered')) {
        return NextResponse.json({ 
          success: false, 
          error: '该邮箱已注册' 
        }, { status: 409 })
      }

      return NextResponse.json({ 
        success: false, 
        error: '注册失败，请稍后重试' 
      }, { status: 500 })
    }

    // 如果需要邮箱验证
    if (data.user && !data.user.email_confirmed_at) {
      return NextResponse.json({
        success: true,
        user: data.user,
        needsVerification: true,
        message: '注册成功，请查看邮箱完成验证'
      })
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      message: '注册成功'
    })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
