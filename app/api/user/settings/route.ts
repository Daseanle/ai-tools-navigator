import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 获取用户设置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // 获取用户设置
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select(`
        id,
        user_id,
        language,
        theme,
        timezone,
        email_notifications,
        push_notifications,
        marketing_emails,
        privacy_settings,
        display_preferences,
        search_preferences,
        ai_preferences,
        accessibility_settings,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // 如果没有设置记录，返回默认设置
    if (!settings) {
      const defaultSettings = {
        user_id: userId,
        language: 'zh',
        theme: 'dark',
        timezone: 'Asia/Shanghai',
        email_notifications: {
          new_tools: true,
          weekly_digest: true,
          product_updates: true,
          security_alerts: true
        },
        push_notifications: {
          favorites_updates: true,
          community_mentions: false,
          system_notifications: true
        },
        marketing_emails: false,
        privacy_settings: {
          profile_visibility: 'public',
          show_activity: true,
          show_favorites: true,
          show_ratings: true,
          data_sharing: false
        },
        display_preferences: {
          cards_per_page: 20,
          view_mode: 'grid',
          show_descriptions: true,
          show_ratings: true,
          show_pricing: true,
          compact_mode: false
        },
        search_preferences: {
          default_sort: 'popularity',
          show_filters: true,
          save_searches: true,
          auto_complete: true,
          search_history: true
        },
        ai_preferences: {
          personalized_recommendations: true,
          smart_categories: true,
          predictive_search: true,
          usage_analytics: true
        },
        accessibility_settings: {
          high_contrast: false,
          large_text: false,
          reduced_motion: false,
          screen_reader: false,
          keyboard_navigation: false
        }
      }

      return NextResponse.json({
        success: true,
        data: defaultSettings
      })
    }

    return NextResponse.json({
      success: true,
      data: settings
    })

  } catch (error) {
    console.error('Error in user settings API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 更新用户设置
export async function PUT(request: NextRequest) {
  try {
    const { userId, settings } = await request.json()

    if (!userId || !settings) {
      return NextResponse.json({ 
        error: 'User ID and settings are required' 
      }, { status: 400 })
    }

    // 验证设置数据
    const validatedSettings = validateSettings(settings)
    if (!validatedSettings.valid) {
      return NextResponse.json({ 
        error: validatedSettings.error 
      }, { status: 400 })
    }

    // 检查是否已有设置记录
    const { data: existing } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      // 更新现有设置
      const { data, error } = await supabase
        .from('user_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating user settings:', error)
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        data: data,
        message: 'Settings updated successfully'
      })

    } else {
      // 创建新设置记录
      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          ...settings
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user settings:', error)
        return NextResponse.json({ error: 'Failed to create settings' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        data: data,
        message: 'Settings created successfully'
      })
    }

  } catch (error) {
    console.error('Error in update user settings API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 重置用户设置
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // 删除用户设置记录（这样下次GET会返回默认设置）
    const { error } = await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error resetting user settings:', error)
      return NextResponse.json({ error: 'Failed to reset settings' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Settings reset to default successfully'
    })

  } catch (error) {
    console.error('Error in reset user settings API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 验证设置数据
function validateSettings(settings: any) {
  const validLanguages = ['zh', 'en']
  const validThemes = ['light', 'dark', 'system']
  const validViewModes = ['grid', 'list']
  const validSortOptions = ['popularity', 'rating', 'newest', 'name']

  if (settings.language && !validLanguages.includes(settings.language)) {
    return { valid: false, error: 'Invalid language' }
  }

  if (settings.theme && !validThemes.includes(settings.theme)) {
    return { valid: false, error: 'Invalid theme' }
  }

  if (settings.display_preferences?.view_mode && !validViewModes.includes(settings.display_preferences.view_mode)) {
    return { valid: false, error: 'Invalid view mode' }
  }

  if (settings.search_preferences?.default_sort && !validSortOptions.includes(settings.search_preferences.default_sort)) {
    return { valid: false, error: 'Invalid sort option' }
  }

  if (settings.display_preferences?.cards_per_page && (settings.display_preferences.cards_per_page < 1 || settings.display_preferences.cards_per_page > 100)) {
    return { valid: false, error: 'Cards per page must be between 1 and 100' }
  }

  return { valid: true }
}

// NaviGuard-AI Security Audited - 2026-06-01
