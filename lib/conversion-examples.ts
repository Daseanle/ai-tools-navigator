/**
 * AI工具试用转化回调示例
 * 
 * 当用户从试用转为付费订阅时，需要调用转化API来记录佣金
 * 这个文件提供了不同场景下的转化回调示例代码
 */

// 示例1: ChatGPT Plus 订阅转化
async function chatgptConversionCallback(trialId: string, subscriptionData: any) {
  try {
    const response = await fetch('/api/conversions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trialId,
        conversionValue: 160, // ChatGPT Plus 月费
        subscriptionType: 'ChatGPT Plus Monthly',
        metadata: {
          planId: subscriptionData.planId,
          userId: subscriptionData.userId,
          subscriptionId: subscriptionData.subscriptionId,
          startDate: subscriptionData.startDate
        }
      })
    })

    const result = await response.json()
    console.log('ChatGPT conversion recorded:', result)
    
    if (result.success) {
      // 转化成功，可以显示感谢信息或发送通知
      console.log(`Commission earned: ¥${result.conversion.commissionAmount}`)
    }
  } catch (error) {
    console.error('ChatGPT conversion tracking failed:', error)
  }
}

// 示例2: Claude Pro 订阅转化
async function claudeConversionCallback(trialId: string, subscriptionData: any) {
  try {
    const response = await fetch('/api/conversions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trialId,
        conversionValue: 150, // Claude Pro 月费
        subscriptionType: 'Claude Pro Monthly',
        metadata: {
          planId: subscriptionData.planId,
          userId: subscriptionData.userId,
          subscriptionId: subscriptionData.subscriptionId,
          startDate: subscriptionData.startDate
        }
      })
    })

    const result = await response.json()
    console.log('Claude conversion recorded:', result)
  } catch (error) {
    console.error('Claude conversion tracking failed:', error)
  }
}

// 示例3: Midjourney 订阅转化
async function midjourneyConversionCallback(trialId: string, subscriptionData: any) {
  try {
    const response = await fetch('/api/conversions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trialId,
        conversionValue: 80, // Midjourney 月费
        subscriptionType: 'Midjourney Basic Plan',
        metadata: {
          planId: subscriptionData.planId,
          userId: subscriptionData.userId,
          subscriptionId: subscriptionData.subscriptionId,
          startDate: subscriptionData.startDate
        }
      })
    })

    const result = await response.json()
    console.log('Midjourney conversion recorded:', result)
  } catch (error) {
    console.error('Midjourney conversion tracking failed:', error)
  }
}

// 示例4: 通用转化回调函数
async function recordConversion(params: {
  trialId: string
  toolId: string
  conversionValue: number
  subscriptionType: string
  metadata?: any
}) {
  try {
    const response = await fetch('/api/conversions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trialId: params.trialId,
        conversionValue: params.conversionValue,
        subscriptionType: params.subscriptionType,
        metadata: params.metadata || {}
      })
    })

    const result = await response.json()
    
    if (result.success) {
      console.log('Conversion recorded successfully:', {
        trialId: params.trialId,
        toolId: params.toolId,
        conversionValue: params.conversionValue,
        commissionAmount: result.conversion.commissionAmount,
        commissionRate: result.conversion.commissionRate,
        affiliateId: result.conversion.affiliateId
      })
      
      // 可选：发送成功通知
      if (result.conversion.affiliateId) {
        await sendAffiliateNotification(result.conversion.affiliateId, {
          type: 'conversion',
          toolId: params.toolId,
          commissionAmount: result.conversion.commissionAmount,
          trialId: params.trialId
        })
      }
    } else {
      console.error('Conversion recording failed:', result.error)
    }
    
    return result
  } catch (error) {
    console.error('Conversion tracking failed:', error)
    throw error
  }
}

// 推广伙伴通知函数
async function sendAffiliateNotification(affiliateId: string, notification: {
  type: string
  toolId: string
  commissionAmount: number
  trialId: string
}) {
  try {
    // 这里可以发送邮件、短信或站内消息通知推广伙伴
    console.log(`Sending notification to affiliate ${affiliateId}:`, notification)
    
    // 示例：发送邮件通知
    const emailData = {
      to: affiliateId,
      subject: '恭喜！您获得了新的推广佣金',
      template: 'affiliate_commission',
      data: {
        toolName: getToolName(notification.toolId),
        commissionAmount: notification.commissionAmount,
        trialId: notification.trialId,
        date: new Date().toLocaleDateString('zh-CN')
      }
    }
    
    // 调用邮件服务
    // await sendEmail(emailData)
  } catch (error) {
    console.error('Failed to send affiliate notification:', error)
  }
}

// 获取工具名称
function getToolName(toolId: string): string {
  const toolNames = {
    'chatgpt': 'ChatGPT Plus',
    'claude': 'Claude Pro',
    'midjourney': 'Midjourney',
    'notion': 'Notion AI',
    'canva': 'Canva Pro'
  }
  return toolNames[toolId as keyof typeof toolNames] || toolId
}

// 示例：在页面加载时检查是否有转化需要处理
async function checkPendingConversions() {
  try {
    // 从URL参数或localStorage获取试用ID
    const urlParams = new URLSearchParams(window.location.search)
    const trialId = urlParams.get('trial_id') || localStorage.getItem('currentTrialId')
    
    if (trialId) {
      // 检查是否是付费成功页面
      const isPaymentSuccess = urlParams.get('payment_status') === 'success'
      const subscriptionId = urlParams.get('subscription_id')
      
      if (isPaymentSuccess && subscriptionId) {
        // 获取订阅信息
        const subscriptionData = await getSubscriptionData(subscriptionId)
        
        if (subscriptionData) {
          // 记录转化
          await recordConversion({
            trialId,
            toolId: subscriptionData.toolId,
            conversionValue: subscriptionData.amount,
            subscriptionType: subscriptionData.planName,
            metadata: {
              subscriptionId,
              userId: subscriptionData.userId,
              paymentMethod: subscriptionData.paymentMethod
            }
          })
          
          // 清除试用ID
          localStorage.removeItem('currentTrialId')
        }
      }
    }
  } catch (error) {
    console.error('Check pending conversions failed:', error)
  }
}

// 获取订阅数据（示例）
async function getSubscriptionData(subscriptionId: string) {
  // 这里应该调用实际的订阅API
  return {
    toolId: 'chatgpt',
    amount: 160,
    planName: 'ChatGPT Plus Monthly',
    userId: 'user-123',
    paymentMethod: 'credit_card'
  }
}

// 使用示例：
// 1. 在试用页面保存试用ID
// localStorage.setItem('currentTrialId', trialId)

// 2. 在付费成功页面调用转化回调
// checkPendingConversions()

// 3. 或者直接调用转化API
// recordConversion({
//   trialId: 'trial-123',
//   toolId: 'chatgpt',
//   conversionValue: 160,
//   subscriptionType: 'ChatGPT Plus Monthly'
// })

export {
  chatgptConversionCallback,
  claudeConversionCallback,
  midjourneyConversionCallback,
  recordConversion,
  checkPendingConversions,
  sendAffiliateNotification
}

// NaviGuard-AI Security Audited - 2026-06-01
