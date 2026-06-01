import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 记录转化和佣金计算
export async function POST(request: NextRequest) {
  try {
    const { trialId, conversionValue, subscriptionType } = await request.json()
    
    if (!trialId || !conversionValue) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要参数' 
      }, { status: 400 })
    }

    // 获取试用记录
    const { data: trial, error: trialError } = await supabase
      .from('user_trials')
      .select('*')
      .eq('id', trialId)
      .single()

    if (trialError || !trial) {
      return NextResponse.json({ 
        success: false, 
        error: '试用记录不存在' 
      }, { status: 404 })
    }

    // 更新试用状态为已转化
    const { error: updateError } = await supabase
      .from('user_trials')
      .update({
        status: 'converted',
        converted_at: new Date().toISOString(),
        conversion_value: conversionValue
      })
      .eq('id', trialId)

    if (updateError) {
      console.error('Failed to update trial:', updateError)
      return NextResponse.json({ 
        success: false, 
        error: '更新试用状态失败' 
      }, { status: 500 })
    }

    // 如果有推广者，处理佣金计算
    if (trial.affiliate_id) {
      // 获取推广计划配置
      const affiliatePrograms = {
        'chatgpt': { commissionRate: 0.15, toolName: 'ChatGPT Plus' },
        'claude': { commissionRate: 0.20, toolName: 'Claude Pro' },
        'midjourney': { commissionRate: 0.12, toolName: 'Midjourney' },
        'notion': { commissionRate: 0.25, toolName: 'Notion AI' },
        'canva': { commissionRate: 0.18, toolName: 'Canva Pro' }
      }

      const program = affiliatePrograms[trial.tool_id as keyof typeof affiliatePrograms]
      if (program) {
        const commissionAmount = conversionValue * program.commissionRate

        // 查找对应的点击记录
        const { data: click, error: clickError } = await supabase
          .from('affiliate_clicks')
          .select('*')
          .eq('trial_id', trialId)
          .single()

        if (click && !clickError) {
          // 更新点击记录为已转化
          await supabase
            .from('affiliate_clicks')
            .update({
              converted: true,
              conversion_value: conversionValue,
              commission_earned: commissionAmount,
              converted_at: new Date().toISOString()
            })
            .eq('id', click.id)
        }

        // 创建佣金记录
        const earningId = 'earning-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
        const { error: earningError } = await supabase
          .from('affiliate_earnings')
          .insert({
            id: earningId,
            affiliate_id: trial.affiliate_id,
            tool_id: trial.tool_id,
            click_id: click?.id || null,
            trial_id: trialId,
            amount: commissionAmount,
            commission_rate: program.commissionRate,
            status: 'pending',
            earned_at: new Date().toISOString(),
            description: `${program.toolName}订阅推广佣金 - ${subscriptionType || '标准订阅'}`
          })

        if (earningError) {
          console.error('Failed to create earning record:', earningError)
          // 不阻断流程，只记录日志
        }

        // 更新推广伙伴统计
        const { data: partner, error: partnerError } = await supabase
          .from('affiliate_partners')
          .select('*')
          .eq('id', trial.affiliate_id)
          .single()

        if (partner && !partnerError) {
          const newTotalEarnings = partner.total_earnings + commissionAmount
          const newMonthlyEarnings = partner.monthly_earnings + commissionAmount
          const newConversions = partner.conversions_generated + 1
          const newConversionRate = newConversions / Math.max(partner.clicks_generated, 1)

          // 计算新的合伙人等级
          let newTier = 'bronze'
          if (newTotalEarnings >= 20000) newTier = 'platinum'
          else if (newTotalEarnings >= 5000) newTier = 'gold'
          else if (newTotalEarnings >= 1000) newTier = 'silver'

          await supabase
            .from('affiliate_partners')
            .update({
              total_earnings: newTotalEarnings,
              monthly_earnings: newMonthlyEarnings,
              conversions_generated: newConversions,
              conversion_rate: newConversionRate,
              tier: newTier,
              last_activity_at: new Date().toISOString()
            })
            .eq('id', trial.affiliate_id)
        }

        return NextResponse.json({
          success: true,
          conversion: {
            trialId,
            conversionValue,
            commissionAmount,
            commissionRate: program.commissionRate,
            affiliateId: trial.affiliate_id
          },
          message: '转化记录成功，佣金已计算'
        })
      }
    }

    return NextResponse.json({
      success: true,
      conversion: {
        trialId,
        conversionValue,
        commissionAmount: 0,
        affiliateId: trial.affiliate_id
      },
      message: '转化记录成功'
    })

  } catch (error) {
    console.error('Conversion tracking error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// 查询转化统计
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const affiliateId = searchParams.get('affiliateId')
    const toolId = searchParams.get('toolId')
    const period = searchParams.get('period') || 'month'

    let query = supabase
      .from('affiliate_earnings')
      .select(`
        *,
        user_trials!inner(tool_id, user_id, type, duration)
      `)

    if (affiliateId) {
      query = query.eq('affiliate_id', affiliateId)
    }

    if (toolId) {
      query = query.eq('tool_id', toolId)
    }

    // 根据时间段过滤
    const now = new Date()
    if (period === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      query = query.gte('earned_at', monthStart.toISOString())
    } else if (period === 'week') {
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      query = query.gte('earned_at', weekStart.toISOString())
    }

    const { data: conversions, error } = await query
      .order('earned_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Get conversions error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '查询失败' 
      }, { status: 500 })
    }

    // 计算统计数据
    const totalAmount = conversions?.reduce((sum, conv) => sum + conv.amount, 0) || 0
    const totalCount = conversions?.length || 0
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0

    const stats = {
      totalAmount,
      totalCount,
      avgAmount,
      pendingAmount: conversions?.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0) || 0,
      confirmedAmount: conversions?.filter(c => c.status === 'confirmed').reduce((sum, c) => sum + c.amount, 0) || 0,
      paidAmount: conversions?.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0) || 0,
    }

    return NextResponse.json({
      success: true,
      conversions: conversions || [],
      stats,
      period
    })

  } catch (error) {
    console.error('Get conversions error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
