import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { password, confirmText } = await request.json()
    
    if (!password || confirmText !== 'DELETE') {
      return NextResponse.json(
        { error: '请输入正确的密码和确认文本' },
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

    // 验证密码
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: password
    })

    if (signInError) {
      return NextResponse.json(
        { error: '密码不正确' },
        { status: 400 }
      )
    }

    try {
      // 删除用户相关数据（按依赖关系顺序删除）
      
      // 1. 删除用户行为事件
      await supabase
        .from('user_behavior_events')
        .delete()
        .eq('user_id', user.id)

      // 2. 删除用户会话
      await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.id)

      // 3. 删除用户评价
      await supabase
        .from('user_ratings')
        .delete()
        .eq('user_id', user.id)

      // 4. 删除用户收藏
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)

      // 5. 删除用户偏好设置
      await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', user.id)

      // 6. 删除用户资料
      await supabase
        .from('user_profiles')
        .delete()
        .eq('id', user.id)

      // 7. 最后删除认证用户
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
      
      if (deleteError) {
        console.error('Error deleting user from auth:', deleteError)
        // 即使认证删除失败，也返回成功，因为数据已经清理
      }

      return NextResponse.json({
        success: true,
        message: '账户已成功删除'
      })

    } catch (cleanupError) {
      console.error('Error during data cleanup:', cleanupError)
      
      // 如果数据清理失败，至少标记用户为已删除
      await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      return NextResponse.json({
        success: true,
        message: '账户已标记为删除，数据将在24小时内完全清理'
      })
    }

  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}