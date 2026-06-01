import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase'
import * as speakeasy from 'speakeasy'
import * as QRCode from 'qrcode'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    // 检查用户是否已经启用了2FA
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('two_factor_enabled, two_factor_secret')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError
    }

    if (profile?.two_factor_enabled) {
      return NextResponse.json({
        enabled: true,
        message: '两步验证已启用'
      })
    }

    // 生成新的密钥
    const secret = speakeasy.generateSecret({
      name: `AI Navigator (${user.email})`,
      issuer: 'AI Navigator'
    })

    // 生成QR码
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    // 暂存密钥（还未启用）
    await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: user.email,
        two_factor_secret: secret.base32,
        two_factor_enabled: false,
        updated_at: new Date().toISOString()
      })

    return NextResponse.json({
      enabled: false,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manual_entry_key: secret.base32
    })

  } catch (error) {
    console.error('Two-factor setup error:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, action } = await request.json()
    
    if (!token || !action) {
      return NextResponse.json(
        { error: '验证码和操作类型都是必填项' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseServerClient()
    
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    // 获取用户的2FA密钥
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('two_factor_secret, two_factor_enabled')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: '用户信息获取失败' },
        { status: 500 }
      )
    }

    if (!profile?.two_factor_secret) {
      return NextResponse.json(
        { error: '请先设置两步验证' },
        { status: 400 }
      )
    }

    // 验证令牌
    const verified = speakeasy.totp.verify({
      secret: profile.two_factor_secret,
      encoding: 'base32',
      token: token,
      window: 2  // 允许时间窗口
    })

    if (!verified) {
      return NextResponse.json(
        { error: '验证码不正确' },
        { status: 400 }
      )
    }

    if (action === 'enable') {
      // 启用两步验证
      await supabase
        .from('user_profiles')
        .update({
          two_factor_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      return NextResponse.json({
        success: true,
        message: '两步验证已成功启用'
      })
    } else if (action === 'disable') {
      // 禁用两步验证
      await supabase
        .from('user_profiles')
        .update({
          two_factor_enabled: false,
          two_factor_secret: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      return NextResponse.json({
        success: true,
        message: '两步验证已禁用'
      })
    }

    return NextResponse.json(
      { error: '无效的操作类型' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Two-factor action error:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
