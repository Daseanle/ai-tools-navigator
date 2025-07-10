import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 获取试用信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const trialType = searchParams.get('trialType') // 'membership', 'feature', 'tool'

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // 构建查询
    let query = supabase
      .from('user_trials')
      .select(`
        id,
        user_id,
        trial_type,
        trial_name,
        tier,
        feature_name,
        status,
        started_at,
        expires_at,
        extended_at,
        usage_stats,
        limits,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)

    if (trialType) {
      query = query.eq('trial_type', trialType)
    }

    const { data: trials, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching trials:', error)
      return NextResponse.json({ error: 'Failed to fetch trials' }, { status: 500 })
    }

    // 检查试用状态并更新过期的试用
    const currentTime = new Date()
    const updatedTrials = trials?.map(trial => {
      const isExpired = trial.expires_at && new Date(trial.expires_at) < currentTime
      const isActive = trial.status === 'active' && !isExpired
      
      if (trial.status === 'active' && isExpired) {
        // 异步更新过期状态
        supabase
          .from('user_trials')
          .update({ status: 'expired' })
          .eq('id', trial.id)
          .then(() => {}, (error: any) => console.error('Error updating expired trial:', error))
      }

      return {
        ...trial,
        is_active: isActive,
        is_expired: isExpired,
        days_remaining: trial.expires_at 
          ? Math.ceil((new Date(trial.expires_at).getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24))
          : null,
        hours_remaining: trial.expires_at 
          ? Math.ceil((new Date(trial.expires_at).getTime() - currentTime.getTime()) / (1000 * 60 * 60))
          : null
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: {
        trials: updatedTrials,
        active_trials: updatedTrials.filter(t => t.is_active),
        expired_trials: updatedTrials.filter(t => t.is_expired)
      }
    })

  } catch (error) {
    console.error('Error in trials API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 启动试用
export async function POST(request: NextRequest) {
  try {
    const { userId, trialType, trialName, tier, featureName, durationDays } = await request.json()

    if (!userId || !trialType || !trialName) {
      return NextResponse.json({ 
        error: 'User ID, trial type, and trial name are required' 
      }, { status: 400 })
    }

    const validTrialTypes = ['membership', 'feature', 'tool']
    if (!validTrialTypes.includes(trialType)) {
      return NextResponse.json({ error: 'Invalid trial type' }, { status: 400 })
    }

    // 检查是否已经有相同的试用
    const { data: existingTrial } = await supabase
      .from('user_trials')
      .select('id, status')
      .eq('user_id', userId)
      .eq('trial_type', trialType)
      .eq('trial_name', trialName)
      .single()

    if (existingTrial) {
      if (existingTrial.status === 'active') {
        return NextResponse.json({ error: 'Trial already active' }, { status: 409 })
      }
      if (existingTrial.status === 'expired') {
        return NextResponse.json({ error: 'Trial already used' }, { status: 409 })
      }
    }

    // 计算试用期
    const startDate = new Date()
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + (durationDays || 7)) // 默认7天

    // 获取试用限制
    const limits = getTrialLimits(trialType, tier, featureName)

    // 创建试用记录
    const { data, error } = await supabase
      .from('user_trials')
      .insert({
        user_id: userId,
        trial_type: trialType,
        trial_name: trialName,
        tier: tier || null,
        feature_name: featureName || null,
        status: 'active',
        started_at: startDate.toISOString(),
        expires_at: expiryDate.toISOString(),
        usage_stats: {
          actions_used: 0,
          features_accessed: [],
          last_used: null
        },
        limits
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating trial:', error)
      return NextResponse.json({ error: 'Failed to create trial' }, { status: 500 })
    }

    // 如果是会员试用，临时升级用户会员等级
    if (trialType === 'membership' && tier) {
      await updateUserMembershipForTrial(userId, tier, expiryDate)
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Trial started successfully'
    })

  } catch (error) {
    console.error('Error in start trial API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 使用试用功能
export async function PUT(request: NextRequest) {
  try {
    const { userId, trialId, action, metadata } = await request.json()

    if (!userId || !trialId || !action) {
      return NextResponse.json({ 
        error: 'User ID, trial ID, and action are required' 
      }, { status: 400 })
    }

    // 获取试用信息
    const { data: trial, error: trialError } = await supabase
      .from('user_trials')
      .select('*')
      .eq('id', trialId)
      .eq('user_id', userId)
      .single()

    if (trialError || !trial) {
      return NextResponse.json({ error: 'Trial not found' }, { status: 404 })
    }

    // 检查试用是否有效
    if (trial.status !== 'active') {
      return NextResponse.json({ error: 'Trial not active' }, { status: 400 })
    }

    const isExpired = trial.expires_at && new Date(trial.expires_at) < new Date()
    if (isExpired) {
      return NextResponse.json({ error: 'Trial expired' }, { status: 400 })
    }

    // 更新使用统计
    const updatedStats = {
      ...trial.usage_stats,
      actions_used: (trial.usage_stats.actions_used || 0) + 1,
      features_accessed: Array.from(new Set([
        ...(trial.usage_stats.features_accessed || []),
        action
      ])),
      last_used: new Date().toISOString()
    }

    // 检查是否超过限制
    if (trial.limits?.max_actions && updatedStats.actions_used > trial.limits.max_actions) {
      return NextResponse.json({ error: 'Trial usage limit exceeded' }, { status: 400 })
    }

    // 更新试用记录
    const { error: updateError } = await supabase
      .from('user_trials')
      .update({
        usage_stats: updatedStats,
        updated_at: new Date().toISOString()
      })
      .eq('id', trialId)

    if (updateError) {
      console.error('Error updating trial usage:', updateError)
      return NextResponse.json({ error: 'Failed to update trial usage' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        usage_stats: updatedStats,
        remaining_actions: trial.limits?.max_actions 
          ? trial.limits.max_actions - updatedStats.actions_used
          : null
      },
      message: 'Trial usage recorded'
    })

  } catch (error) {
    console.error('Error in use trial API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 获取试用限制
function getTrialLimits(trialType: string, tier?: string, featureName?: string) {
  const limits = {
    membership: {
      experience: {
        max_actions: 100,
        max_bookmarks: 50,
        max_downloads: 20,
        features: ['advanced_search', 'personalized_recommendations']
      },
      industry: {
        max_actions: 500,
        max_bookmarks: 200,
        max_downloads: 100,
        features: ['advanced_search', 'personalized_recommendations', 'priority_support', 'analytics']
      },
      team: {
        max_actions: 1000,
        max_bookmarks: 'unlimited',
        max_downloads: 'unlimited',
        features: ['all_features']
      }
    },
    feature: {
      advanced_search: {
        max_actions: 50,
        features: ['advanced_search']
      },
      ai_recommendations: {
        max_actions: 30,
        features: ['ai_recommendations']
      },
      analytics: {
        max_actions: 20,
        features: ['analytics']
      }
    },
    tool: {
      max_actions: 10,
      features: ['tool_access']
    }
  }

  if (trialType === 'membership' && tier) {
    return limits.membership[tier as keyof typeof limits.membership] || limits.membership.experience
  }

  if (trialType === 'feature' && featureName) {
    return limits.feature[featureName as keyof typeof limits.feature] || limits.feature.advanced_search
  }

  return limits.tool
}

// 为试用临时升级用户会员等级
async function updateUserMembershipForTrial(userId: string, tier: string, expiryDate: Date) {
  try {
    const { data: existing } = await supabase
      .from('user_memberships')
      .select('id, tier, original_tier')
      .eq('user_id', userId)
      .single()

    if (existing) {
      // 更新现有会员记录
      await supabase
        .from('user_memberships')
        .update({
          tier,
          original_tier: existing.original_tier || existing.tier,
          expires_at: expiryDate.toISOString(),
          is_trial: true
        })
        .eq('id', existing.id)
    } else {
      // 创建新会员记录
      await supabase
        .from('user_memberships')
        .insert({
          user_id: userId,
          tier,
          original_tier: 'free',
          expires_at: expiryDate.toISOString(),
          is_trial: true,
          status: 'active'
        })
    }
  } catch (error) {
    console.error('Error updating membership for trial:', error)
  }
}