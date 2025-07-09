import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: '需要登录' 
      }, { status: 401 })
    }

    // 获取创作者收益统计
    const { data: earnings, error } = await supabase
      .from('creator_earnings')
      .select(`
        *,
        prompts(title, views_count, downloads_count),
        payment_orders(created_at, amount)
      `)
      .eq('creator_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch earnings error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '获取收益数据失败' 
      }, { status: 500 })
    }

    // 计算总收益
    const totalEarnings = earnings?.reduce((sum, item) => sum + item.creator_share, 0) || 0
    const pendingEarnings = earnings?.filter(item => item.status === 'pending').reduce((sum, item) => sum + item.creator_share, 0) || 0
    const confirmedEarnings = earnings?.filter(item => item.status === 'confirmed').reduce((sum, item) => sum + item.creator_share, 0) || 0
    const paidEarnings = earnings?.filter(item => item.status === 'paid').reduce((sum, item) => sum + item.creator_share, 0) || 0

    // 获取提现记录
    const { data: withdrawals, error: withdrawError } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (withdrawError) {
      console.error('Fetch withdrawals error:', withdrawError)
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalEarnings,
          pendingEarnings,
          confirmedEarnings,
          paidEarnings,
          availableForWithdrawal: confirmedEarnings
        },
        earnings: earnings || [],
        withdrawals: withdrawals || []
      }
    })

  } catch (error) {
    console.error('Get earnings error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const body = await request.json()
    const { amount, method, accountInfo } = body
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: '需要登录' 
      }, { status: 401 })
    }

    // 验证提现金额
    if (!amount || amount < 10000) { // 最少100元
      return NextResponse.json({ 
        success: false, 
        error: '提现金额不能少于100元' 
      }, { status: 400 })
    }

    // 验证提现方式和账户信息
    if (!method || !accountInfo) {
      return NextResponse.json({ 
        success: false, 
        error: '请选择提现方式并填写账户信息' 
      }, { status: 400 })
    }

    // 检查可提现余额
    const { data: earnings, error } = await supabase
      .from('creator_earnings')
      .select('creator_share')
      .eq('creator_id', userId)
      .eq('status', 'confirmed')

    if (error) {
      console.error('Check earnings error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '检查余额失败' 
      }, { status: 500 })
    }

    const availableAmount = earnings?.reduce((sum, item) => sum + item.creator_share, 0) || 0
    
    if (amount > availableAmount) {
      return NextResponse.json({ 
        success: false, 
        error: '提现金额超过可用余额' 
      }, { status: 400 })
    }

    // 创建提现申请
    const { data: withdrawal, error: insertError } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: userId,
        amount,
        method,
        account_info: accountInfo,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert withdrawal error:', insertError)
      return NextResponse.json({ 
        success: false, 
        error: '提现申请失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: withdrawal
    })

  } catch (error) {
    console.error('Create withdrawal error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}