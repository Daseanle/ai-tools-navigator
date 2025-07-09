import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promptId = params.id
    const userId = request.headers.get('x-user-id') // 从header获取用户ID

    // 获取Prompt详情
    const { data: prompt, error } = await supabase
      .from('prompts')
      .select(`
        *,
        prompt_categories(id, name, icon, color)
      `)
      .eq('id', promptId)
      .single()

    if (error || !prompt) {
      return NextResponse.json({ 
        success: false, 
        error: 'Prompt不存在' 
      }, { status: 404 })
    }

    // 增加浏览量
    await supabase
      .from('prompts')
      .update({ views_count: prompt.views_count + 1 })
      .eq('id', promptId)

    // 检查用户是否已购买
    let hasPurchased = false
    if (userId && prompt.pricing_type !== 'free') {
      const { data: purchase } = await supabase
        .from('user_prompt_purchases')
        .select('id')
        .eq('user_id', userId)
        .eq('prompt_id', promptId)
        .single()

      hasPurchased = !!purchase
    }

    // 检查用户是否已收藏
    let isFavorited = false
    if (userId) {
      const { data: favorite } = await supabase
        .from('user_prompt_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('prompt_id', promptId)
        .single()

      isFavorited = !!favorite
    }

    // 检查用户是否已评分
    let userRating = null
    if (userId) {
      const { data: rating } = await supabase
        .from('user_prompt_ratings')
        .select('*')
        .eq('user_id', userId)
        .eq('prompt_id', promptId)
        .single()

      userRating = rating
    }

    return NextResponse.json({
      success: true,
      data: {
        ...prompt,
        hasPurchased,
        isFavorited,
        userRating
      }
    })

  } catch (error) {
    console.error('Get prompt error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promptId = params.id
    const userId = request.headers.get('x-user-id')
    const body = await request.json()
    const { action } = body

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: '需要登录' 
      }, { status: 401 })
    }

    switch (action) {
      case 'purchase':
        return await handlePurchase(promptId, userId)
      case 'favorite':
        return await handleFavorite(promptId, userId, body.favorite)
      case 'rate':
        return await handleRating(promptId, userId, body.rating, body.comment)
      case 'download':
        return await handleDownload(promptId, userId)
      default:
        return NextResponse.json({ 
          success: false, 
          error: '不支持的操作' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Prompt action error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

async function handlePurchase(promptId: string, userId: string) {
  // 获取Prompt信息
  const { data: prompt, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', promptId)
    .single()

  if (error || !prompt) {
    return NextResponse.json({ 
      success: false, 
      error: 'Prompt不存在' 
    }, { status: 404 })
  }

  if (prompt.pricing_type === 'free') {
    return NextResponse.json({ 
      success: false, 
      error: '免费Prompt无需购买' 
    }, { status: 400 })
  }

  // 检查是否已购买
  const { data: existingPurchase } = await supabase
    .from('user_prompt_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('prompt_id', promptId)
    .single()

  if (existingPurchase) {
    return NextResponse.json({ 
      success: false, 
      error: '您已购买过此Prompt' 
    }, { status: 400 })
  }

  // 创建支付订单
  const orderData = {
    userId,
    productType: 'content',
    productId: promptId,
    productName: prompt.title,
    amount: prompt.price,
    currency: 'CNY',
    paymentMethod: 'pending', // 待用户选择
    metadata: {
      contentType: 'prompt',
      authorId: prompt.author_id
    }
  }

  return NextResponse.json({
    success: true,
    data: { 
      needPayment: true, 
      orderData,
      prompt 
    }
  })
}

async function handleFavorite(promptId: string, userId: string, favorite: boolean) {
  if (favorite) {
    // 添加收藏
    const { error } = await supabase
      .from('user_prompt_favorites')
      .insert({
        user_id: userId,
        prompt_id: promptId
      })

    if (error && error.code !== '23505') { // 忽略重复插入错误
      throw error
    }
  } else {
    // 取消收藏
    const { error } = await supabase
      .from('user_prompt_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('prompt_id', promptId)

    if (error) {
      throw error
    }
  }

  return NextResponse.json({ success: true })
}

async function handleRating(promptId: string, userId: string, rating: number, comment?: string) {
  const { error } = await supabase
    .from('user_prompt_ratings')
    .upsert({
      user_id: userId,
      prompt_id: promptId,
      rating,
      comment,
      updated_at: new Date().toISOString()
    })

  if (error) {
    throw error
  }

  return NextResponse.json({ success: true })
}

async function handleDownload(promptId: string, userId: string) {
  // 检查是否有权限下载
  const { data: prompt } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', promptId)
    .single()

  if (!prompt) {
    return NextResponse.json({ 
      success: false, 
      error: 'Prompt不存在' 
    }, { status: 404 })
  }

  // 如果是付费Prompt，检查是否已购买
  if (prompt.pricing_type !== 'free') {
    const { data: purchase } = await supabase
      .from('user_prompt_purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('prompt_id', promptId)
      .single()

    if (!purchase) {
      return NextResponse.json({ 
        success: false, 
        error: '请先购买此Prompt' 
      }, { status: 403 })
    }
  }

  // 增加下载量
  await supabase
    .from('prompts')
    .update({ downloads_count: prompt.downloads_count + 1 })
    .eq('id', promptId)

  // 记录使用记录
  await supabase
    .from('user_prompt_usage')
    .insert({
      user_id: userId,
      prompt_id: promptId
    })

  return NextResponse.json({ 
    success: true, 
    data: { 
      content: prompt.content 
    } 
  })
}