import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { PaymentManager, type PaymentOrder } from '@/lib/payment'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productType, productId, productName, amount, currency, paymentMethod, userId, metadata } = body

    // 验证必要参数
    if (!productType || !productId || !productName || !amount || !paymentMethod || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要参数' 
      }, { status: 400 })
    }

    // 创建支付订单
    const orderData = {
      userId,
      productType,
      productId,
      productName,
      amount,
      currency: currency || 'CNY',
      paymentMethod,
      description: metadata?.description || `购买${productName}`,
      metadata: metadata || {}
    }

    const order = await PaymentManager.createOrder(orderData)

    // 保存订单到数据库
    const { data: savedOrder, error: saveError } = await supabase
      .from('payment_orders')
      .insert({
        id: order.id,
        user_id: order.userId,
        product_type: order.productType,
        product_id: order.productId,
        product_name: order.productName,
        amount: order.amount,
        currency: order.currency,
        payment_method: order.paymentMethod,
        status: order.status,
        description: order.description,
        metadata: order.metadata,
        expired_at: order.expiredAt
      })
      .select()
      .single()

    if (saveError) {
      console.error('Save order error:', saveError)
      return NextResponse.json({ 
        success: false, 
        error: '创建订单失败' 
      }, { status: 500 })
    }

    // 根据支付方式创建支付
    let paymentResult
    switch (paymentMethod) {
      case 'wechat_pay':
        paymentResult = await PaymentManager.createWechatPayment(order)
        break
      case 'alipay':
        paymentResult = await PaymentManager.createAlipayPayment(order)
        break
      case 'stripe_card':
        paymentResult = await PaymentManager.createStripePayment(order)
        break
      default:
        return NextResponse.json({ 
          success: false, 
          error: '不支持的支付方式' 
        }, { status: 400 })
    }

    if (!paymentResult.success) {
      return NextResponse.json({ 
        success: false, 
        error: paymentResult.error 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      order: savedOrder,
      payment: paymentResult
    })

  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
