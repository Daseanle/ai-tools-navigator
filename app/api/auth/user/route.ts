import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 获取当前用户信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: '用户ID必填' 
      }, { status: 400 })
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Get user error:', error)
      return NextResponse.json({
        success: false,
        error: '用户不存在'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: user
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '获取用户信息失败' 
    }, { status: 500 })
  }
}

// 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    const { userId, ...updates } = await request.json()

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: '用户ID必填' 
      }, { status: 400 })
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        email: updates.email,
        avatar: updates.avatar,
        bio: updates.bio,
        preferences: updates.preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Update user error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '更新用户信息失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: user,
      message: '用户信息更新成功'
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// 创建用户
export async function POST(request: NextRequest) {
  try {
    const user = await request.json()

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: user.provider || 'email',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Create user error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '创建用户失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      message: '用户创建成功'
    })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}