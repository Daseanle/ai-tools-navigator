import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 加入推广计划
export async function POST(request: NextRequest) {
  try {
    const { userId, payoutMethod, payoutDetails, referralCode } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: '用户ID不能为空' 
      }, { status: 400 })
    }

    // 检查是否已经是推广伙伴
    const { data: existingPartner, error: checkError } = await supabase
      .from('affiliate_partners')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existingPartner) {
      return NextResponse.json({ 
        success: false, 
        error: '您已经是推广伙伴' 
      }, { status: 400 })
    }

    // 生成推广伙伴ID
    const partnerId = 'partner-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    
    // 创建推广伙伴记录
    const { error: insertError } = await supabase
      .from('affiliate_partners')
      .insert({
        id: partnerId,
        user_id: userId,
        status: 'pending', // 默认待审核
        tier: 'bronze',
        total_earnings: 0,
        monthly_earnings: 0,
        clicks_generated: 0,
        conversions_generated: 0,
        conversion_rate: 0,
        payout_method: payoutMethod || 'alipay',
        payout_details: payoutDetails || {},
        joined_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Failed to create affiliate partner:', insertError)
      return NextResponse.json({ 
        success: false, 
        error: '加入推广计划失败' 
      }, { status: 500 })
    }

    // 如果有推荐码，记录推荐关系
    if (referralCode) {
      const { data: referrer, error: referrerError } = await supabase
        .from('affiliate_partners')
        .select('*')
        .eq('id', referralCode)
        .single()

      if (referrer && !referrerError) {
        // 这里可以添加推荐奖励逻辑
        console.log(`User ${userId} was referred by ${referrer.user_id}`)
      }
    }

    return NextResponse.json({
      success: true,
      partnerId,
      message: '成功加入推广计划，等待审核'
    })

  } catch (error) {
    console.error('Join affiliate program error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// 获取推广伙伴信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const partnerId = searchParams.get('partnerId')

    if (!userId && !partnerId) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要参数' 
      }, { status: 400 })
    }

    let query = supabase
      .from('affiliate_partners')
      .select('*')

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (partnerId) {
      query = query.eq('id', partnerId)
    }

    const { data: partner, error } = await query.single()

    if (error) {
      console.error('Get affiliate partner error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '查询失败' 
      }, { status: 500 })
    }

    // 获取本月统计数据
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const { data: monthlyStats, error: statsError } = await supabase
      .from('affiliate_earnings')
      .select('amount')
      .eq('affiliate_id', partner.id)
      .gte('earned_at', monthStart.toISOString())

    const monthlyEarnings = monthlyStats?.reduce((sum, item) => sum + item.amount, 0) || 0

    // 获取最近的点击和转化数据
    const { data: recentClicks, error: clicksError } = await supabase
      .from('affiliate_clicks')
      .select('*')
      .eq('affiliate_id', partner.id)
      .order('clicked_at', { ascending: false })
      .limit(10)

    const { data: recentEarnings, error: earningsError } = await supabase
      .from('affiliate_earnings')
      .select('*')
      .eq('affiliate_id', partner.id)
      .order('earned_at', { ascending: false })
      .limit(10)

    // 计算合伙人等级
    const tierInfo = {
      bronze: { name: '青铜合伙人', minEarnings: 0, bonusRate: 0, color: 'orange' },
      silver: { name: '白银合伙人', minEarnings: 1000, bonusRate: 0.05, color: 'gray' },
      gold: { name: '黄金合伙人', minEarnings: 5000, bonusRate: 0.10, color: 'yellow' },
      platinum: { name: '铂金合伙人', minEarnings: 20000, bonusRate: 0.15, color: 'purple' }
    }

    const currentTier = tierInfo[partner.tier as keyof typeof tierInfo]
    
    // 计算下一个等级的进度
    const nextTierKey = partner.tier === 'bronze' ? 'silver' : 
                       partner.tier === 'silver' ? 'gold' : 
                       partner.tier === 'gold' ? 'platinum' : null
    
    const nextTier = nextTierKey ? tierInfo[nextTierKey] : null
    const progress = nextTier ? 
      Math.min((partner.total_earnings / nextTier.minEarnings) * 100, 100) : 100

    return NextResponse.json({
      success: true,
      partner: {
        ...partner,
        monthlyEarnings,
        currentTier,
        nextTier,
        progress,
        recentClicks: recentClicks || [],
        recentEarnings: recentEarnings || []
      }
    })

  } catch (error) {
    console.error('Get affiliate partner error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// 更新推广伙伴信息
export async function PUT(request: NextRequest) {
  try {
    const { partnerId, payoutMethod, payoutDetails, status } = await request.json()
    
    if (!partnerId) {
      return NextResponse.json({ 
        success: false, 
        error: '推广伙伴ID不能为空' 
      }, { status: 400 })
    }

    const updateData: any = {
      last_activity_at: new Date().toISOString()
    }

    if (payoutMethod) updateData.payout_method = payoutMethod
    if (payoutDetails) updateData.payout_details = payoutDetails
    if (status) updateData.status = status

    const { error } = await supabase
      .from('affiliate_partners')
      .update(updateData)
      .eq('id', partnerId)

    if (error) {
      console.error('Update affiliate partner error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '更新失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '推广伙伴信息更新成功'
    })

  } catch (error) {
    console.error('Update affiliate partner error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}