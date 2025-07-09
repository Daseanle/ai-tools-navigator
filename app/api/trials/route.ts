import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 启动试用
export async function POST(request: NextRequest) {
  try {
    const { userId, offerId, affiliateId } = await request.json()
    
    if (!userId || !offerId) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要参数' 
      }, { status: 400 })
    }

    // 获取试用配置
    const trialOffers = [
      {
        id: 'chatgpt-trial',
        toolId: 'chatgpt',
        type: 'free_trial',
        duration: 7,
        originalPrice: 160,
        promoCode: 'AI_NAVIGATOR_7D',
        redirectUrl: 'https://chat.openai.com/auth/login?promo=AI_NAVIGATOR_7D'
      },
      {
        id: 'claude-trial',
        toolId: 'claude',
        type: 'discount',
        duration: 30,
        originalPrice: 150,
        discountedPrice: 75,
        promoCode: 'CLAUDE_50OFF',
        redirectUrl: 'https://claude.ai/upgrade?promo=CLAUDE_50OFF'
      },
      {
        id: 'midjourney-trial',
        toolId: 'midjourney',
        type: 'extended_trial',
        duration: 14,
        originalPrice: 80,
        promoCode: 'MJ_EXTENDED_14',
        redirectUrl: 'https://discord.com/channels/662267976984297473/1008571070560989244'
      }
    ]

    const offer = trialOffers.find(o => o.id === offerId)
    if (!offer) {
      return NextResponse.json({ 
        success: false, 
        error: '试用优惠不存在' 
      }, { status: 404 })
    }

    // 生成试用记录
    const trialId = 'trial-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    
    // 记录试用开始
    const { error: insertError } = await supabase
      .from('user_trials')
      .insert({
        id: trialId,
        user_id: userId,
        tool_id: offer.toolId,
        offer_id: offerId,
        type: offer.type,
        duration: offer.duration,
        original_price: offer.originalPrice,
        discounted_price: offer.discountedPrice,
        promo_code: offer.promoCode,
        affiliate_id: affiliateId,
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + offer.duration * 24 * 60 * 60 * 1000).toISOString()
      })

    if (insertError) {
      console.error('Failed to record trial:', insertError)
      // 继续执行，不阻断用户体验
    }

    // 如果有推广者，记录推广点击
    if (affiliateId) {
      const clickId = 'click-' + Date.now()
      const userAgent = request.headers.get('user-agent') || ''
      const referrer = request.headers.get('referer') || ''
      const ip = request.ip || request.headers.get('x-forwarded-for') || ''

      await supabase
        .from('affiliate_clicks')
        .insert({
          id: clickId,
          affiliate_id: affiliateId,
          tool_id: offer.toolId,
          user_id: userId,
          trial_id: trialId,
          user_ip: ip,
          user_agent: userAgent,
          referrer: referrer,
          converted: false,
          clicked_at: new Date().toISOString()
        })
    }

    return NextResponse.json({
      success: true,
      trialId,
      redirectUrl: offer.redirectUrl,
      message: '试用已开始，即将跳转到工具页面'
    })

  } catch (error) {
    console.error('Start trial error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// 获取试用状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trialId = searchParams.get('trialId')
    const userId = searchParams.get('userId')

    if (!trialId && !userId) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要参数' 
      }, { status: 400 })
    }

    let query = supabase
      .from('user_trials')
      .select('*')

    if (trialId) {
      query = query.eq('id', trialId)
    } else if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: trials, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get trial status error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '查询失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      trials: trials || []
    })

  } catch (error) {
    console.error('Get trial status error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}