import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { PaymentManager } from '@/lib/payment'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const orderId = url.searchParams.get('orderId')
    
    if (!orderId) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少订单ID' 
      }, { status: 400 })
    }

    // 查询数据库中的订单
    const { data: order, error } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ 
        success: false, 
        error: '订单不存在' 
      }, { status: 404 })
    }

    // 如果订单状态为pending或processing，查询支付渠道状态
    if (order.status === 'pending' || order.status === 'processing') {
      const statusResult = await PaymentManager.queryOrderStatus(orderId)
      
      // 如果状态发生变化，更新数据库
      if (statusResult.status !== order.status) {
        const updateData: any = {
          status: statusResult.status,
          updated_at: new Date().toISOString()
        }
        
        if (statusResult.status === 'completed') {
          updateData.completed_at = statusResult.completedAt
          updateData.transaction_id = statusResult.transactionId
        }

        const { error: updateError } = await supabase
          .from('payment_orders')
          .update(updateData)
          .eq('id', orderId)

        if (!updateError) {
          order.status = statusResult.status
          if (statusResult.status === 'completed') {
            order.completed_at = statusResult.completedAt
            order.transaction_id = statusResult.transactionId
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      order
    })

  } catch (error) {
    console.error('Query order error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
