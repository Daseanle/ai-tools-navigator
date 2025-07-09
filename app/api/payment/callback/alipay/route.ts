import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { PaymentManager } from '@/lib/payment'

// 支付宝回调
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const callbackData = Object.fromEntries(formData.entries())
    
    console.log('Alipay payment callback:', callbackData)
    
    const result = await PaymentManager.handlePaymentCallback('alipay', callbackData)
    
    if (result.success && result.orderId) {
      // 更新订单状态
      const { error } = await supabase
        .from('payment_orders')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          transaction_id: callbackData.trade_no,
          updated_at: new Date().toISOString()
        })
        .eq('id', result.orderId)

      if (error) {
        console.error('Update order error:', error)
      } else {
        // 处理业务逻辑
        await handleOrderCompletion(result.orderId)
      }
    }

    // 返回支付宝要求的响应格式
    return new NextResponse('success')

  } catch (error) {
    console.error('Alipay callback error:', error)
    return new NextResponse('fail')
  }
}

async function handleOrderCompletion(orderId: string) {
  try {
    // 获取订单详情
    const { data: order, error } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      console.error('Order not found:', orderId)
      return
    }

    // 根据产品类型处理不同的业务逻辑
    switch (order.product_type) {
      case 'membership':
        await handleMembershipPayment(order)
        break
      case 'content':
        await handleContentPayment(order)
        break
      case 'api_credits':
        await handleApiCreditsPayment(order)
        break
      case 'ad_credits':
        await handleAdCreditsPayment(order)
        break
    }
  } catch (error) {
    console.error('Handle order completion error:', error)
  }
}

async function handleMembershipPayment(order: any) {
  // 更新用户会员状态
  const { error } = await supabase
    .from('user_memberships')
    .upsert({
      user_id: order.user_id,
      membership_type: order.metadata.membershipType,
      billing_cycle: order.metadata.billingCycle,
      status: 'active',
      started_at: new Date().toISOString(),
      expires_at: calculateExpiryDate(order.metadata.billingCycle),
      updated_at: new Date().toISOString()
    })

  if (error) {
    console.error('Update membership error:', error)
  }
}

async function handleContentPayment(order: any) {
  // 处理内容购买
  if (order.product_type === 'content' && order.metadata.contentType === 'prompt') {
    const { error } = await supabase
      .from('user_prompt_purchases')
      .insert({
        user_id: order.user_id,
        prompt_id: order.product_id,
        order_id: order.id,
        price: order.amount,
        purchased_at: new Date().toISOString()
      })

    if (error) {
      console.error('Insert prompt purchase error:', error)
    }
  }
}

async function handleApiCreditsPayment(order: any) {
  // 增加API积分
  const { error } = await supabase
    .from('user_api_credits')
    .upsert({
      user_id: order.user_id,
      credits: order.metadata.credits,
      updated_at: new Date().toISOString()
    })

  if (error) {
    console.error('Update API credits error:', error)
  }
}

async function handleAdCreditsPayment(order: any) {
  // 增加广告积分
  const { error } = await supabase
    .from('user_ad_credits')
    .upsert({
      user_id: order.user_id,
      credits: order.amount,
      updated_at: new Date().toISOString()
    })

  if (error) {
    console.error('Update ad credits error:', error)
  }
}

function calculateExpiryDate(billingCycle: string): string {
  const now = new Date()
  if (billingCycle === 'monthly') {
    now.setMonth(now.getMonth() + 1)
  } else if (billingCycle === 'yearly') {
    now.setFullYear(now.getFullYear() + 1)
  }
  return now.toISOString()
}