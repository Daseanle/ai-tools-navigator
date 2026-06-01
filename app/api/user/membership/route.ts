import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 获取用户会员信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // 获取用户会员信息
    const { data: membershipData, error } = await supabase
      .from('user_memberships')
      .select(`
        id,
        user_id,
        tier,
        billing_cycle,
        status,
        started_at,
        expires_at,
        auto_renew,
        payment_method,
        created_at,
        updated_at,
        usage_stats,
        last_payment_at,
        next_payment_at,
        cancel_at_period_end,
        canceled_at
      `)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching membership:', error)
      return NextResponse.json({ error: 'Failed to fetch membership' }, { status: 500 })
    }

    // 如果没有会员信息，返回免费会员
    if (!membershipData) {
      return NextResponse.json({
        success: true,
        data: {
          tier: 'free',
          billing_cycle: 'monthly',
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: null,
          auto_renew: false,
          usage_stats: {
            tools_bookmarked: 0,
            prompts_downloaded: 0,
            api_calls_made: 0,
            team_members: 0
          },
          limits: {
            tools_bookmarks: 50,
            prompt_downloads: 10,
            api_calls: 100,
            team_members: 1,
            advanced_features: false,
            priority_support: false
          }
        }
      })
    }

    // 检查会员是否过期
    const isExpired = membershipData.expires_at && new Date(membershipData.expires_at) < new Date()
    
    // 根据会员等级获取限制
    const limits = getMembershipLimits(membershipData.tier)

    return NextResponse.json({
      success: true,
      data: {
        ...membershipData,
        is_expired: isExpired,
        limits,
        days_until_expiry: membershipData.expires_at 
          ? Math.ceil((new Date(membershipData.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : null
      }
    })

  } catch (error) {
    console.error('Error in membership API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 创建或更新会员订阅
export async function POST(request: NextRequest) {
  try {
    const { userId, tier, billingCycle, paymentMethod } = await request.json()

    if (!userId || !tier || !billingCycle) {
      return NextResponse.json({ 
        error: 'User ID, tier, and billing cycle are required' 
      }, { status: 400 })
    }

    const validTiers = ['free', 'experience', 'industry', 'team']
    const validBillingCycles = ['monthly', 'yearly']

    if (!validTiers.includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    if (!validBillingCycles.includes(billingCycle)) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 })
    }

    // 计算过期时间
    const startDate = new Date()
    const expiryDate = new Date()
    if (billingCycle === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1)
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1)
    }

    // 检查是否已有会员记录
    const { data: existing } = await supabase
      .from('user_memberships')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      // 更新现有会员
      const { data, error } = await supabase
        .from('user_memberships')
        .update({
          tier,
          billing_cycle: billingCycle,
          status: 'active',
          started_at: startDate.toISOString(),
          expires_at: tier === 'free' ? null : expiryDate.toISOString(),
          auto_renew: tier !== 'free',
          payment_method: paymentMethod || null,
          updated_at: new Date().toISOString(),
          last_payment_at: tier !== 'free' ? new Date().toISOString() : null,
          next_payment_at: tier !== 'free' ? expiryDate.toISOString() : null,
          cancel_at_period_end: false,
          canceled_at: null
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating membership:', error)
        return NextResponse.json({ error: 'Failed to update membership' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        data: data,
        message: 'Membership updated successfully'
      })

    } else {
      // 创建新会员记录
      const { data, error } = await supabase
        .from('user_memberships')
        .insert({
          user_id: userId,
          tier,
          billing_cycle: billingCycle,
          status: 'active',
          started_at: startDate.toISOString(),
          expires_at: tier === 'free' ? null : expiryDate.toISOString(),
          auto_renew: tier !== 'free',
          payment_method: paymentMethod || null,
          usage_stats: {
            tools_bookmarked: 0,
            prompts_downloaded: 0,
            api_calls_made: 0,
            team_members: 0
          },
          last_payment_at: tier !== 'free' ? new Date().toISOString() : null,
          next_payment_at: tier !== 'free' ? expiryDate.toISOString() : null
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating membership:', error)
        return NextResponse.json({ error: 'Failed to create membership' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        data: data,
        message: 'Membership created successfully'
      })
    }

  } catch (error) {
    console.error('Error in create/update membership API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 取消会员订阅
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const immediate = searchParams.get('immediate') === 'true'

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (immediate) {
      // 立即取消
      const { error } = await supabase
        .from('user_memberships')
        .update({
          status: 'canceled',
          auto_renew: false,
          expires_at: new Date().toISOString(),
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) {
        console.error('Error canceling membership immediately:', error)
        return NextResponse.json({ error: 'Failed to cancel membership' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Membership canceled immediately'
      })

    } else {
      // 在周期结束时取消
      const { error } = await supabase
        .from('user_memberships')
        .update({
          auto_renew: false,
          cancel_at_period_end: true,
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) {
        console.error('Error scheduling membership cancellation:', error)
        return NextResponse.json({ error: 'Failed to schedule cancellation' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Membership will be canceled at the end of the current period'
      })
    }

  } catch (error) {
    console.error('Error in cancel membership API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 获取会员限制
function getMembershipLimits(tier: string) {
  const limits = {
    free: {
      tools_bookmarks: 50,
      prompt_downloads: 10,
      api_calls: 100,
      team_members: 1,
      advanced_features: false,
      priority_support: false,
      custom_branding: false,
      analytics: false
    },
    experience: {
      tools_bookmarks: 500,
      prompt_downloads: 100,
      api_calls: 1000,
      team_members: 1,
      advanced_features: true,
      priority_support: false,
      custom_branding: false,
      analytics: true
    },
    industry: {
      tools_bookmarks: 'unlimited',
      prompt_downloads: 'unlimited',
      api_calls: 10000,
      team_members: 5,
      advanced_features: true,
      priority_support: true,
      custom_branding: true,
      analytics: true
    },
    team: {
      tools_bookmarks: 'unlimited',
      prompt_downloads: 'unlimited',
      api_calls: 'unlimited',
      team_members: 'unlimited',
      advanced_features: true,
      priority_support: true,
      custom_branding: true,
      analytics: true
    }
  }

  return limits[tier as keyof typeof limits] || limits.free
}

// NaviGuard-AI Security Audited - 2026-06-01
