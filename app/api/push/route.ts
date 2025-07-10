// Push Notifications API for PWA
import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

// Configure web-push
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

// In-memory storage for subscriptions (use database in production)
const subscriptions = new Map<string, PushSubscription>()

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'subscribe'

    switch (action) {
      case 'subscribe':
        return await handleSubscribe(request)
      case 'unsubscribe':
        return await handleUnsubscribe(request)
      case 'send':
        return await handleSendNotification(request)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Push notification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'

    switch (action) {
      case 'status':
        return await getSubscriptionStatus()
      case 'vapid':
        return getVapidPublicKey()
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Push notification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleSubscribe(request: NextRequest) {
  try {
    const subscription = await request.json()
    
    // Validate subscription
    if (!subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription' },
        { status: 400 }
      )
    }

    // Store subscription (use database in production)
    const subscriptionId = generateSubscriptionId(subscription)
    subscriptions.set(subscriptionId, subscription)

    // Send welcome notification
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: '欢迎使用 AI Tools Navigator',
          body: '您已成功启用推送通知！我们会及时为您推送最新的AI工具信息。',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: 'welcome',
          data: {
            url: '/'
          }
        })
      )
    } catch (notificationError) {
      console.error('Failed to send welcome notification:', notificationError)
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription saved successfully',
      subscriptionId
    })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    )
  }
}

async function handleUnsubscribe(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json()
    
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID required' },
        { status: 400 }
      )
    }

    // Remove subscription
    const removed = subscriptions.delete(subscriptionId)
    
    return NextResponse.json({
      success: removed,
      message: removed ? 'Unsubscribed successfully' : 'Subscription not found'
    })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}

async function handleSendNotification(request: NextRequest) {
  try {
    const { 
      title, 
      body, 
      icon, 
      badge, 
      tag, 
      url, 
      targetSubscription,
      broadcast = false 
    } = await request.json()

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      )
    }

    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: icon || '/icons/icon-192x192.png',
      badge: badge || '/icons/badge-72x72.png',
      tag: tag || 'general',
      data: {
        url: url || '/',
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'view',
          title: '查看',
          icon: '/icons/view.png'
        },
        {
          action: 'dismiss',
          title: '忽略',
          icon: '/icons/dismiss.png'
        }
      ],
      requireInteraction: false,
      silent: false
    })

    let sentCount = 0
    let failedCount = 0

    if (broadcast) {
      // Send to all subscriptions
      const sendPromises = Array.from(subscriptions.values()).map(async (subscription) => {
        try {
          await webpush.sendNotification(subscription, notificationPayload)
          sentCount++
        } catch (error) {
          console.error('Failed to send notification:', error)
          failedCount++
          
          // Remove invalid subscriptions
          if (error.statusCode === 410) {
            const id = findSubscriptionId(subscription)
            if (id) subscriptions.delete(id)
          }
        }
      })

      await Promise.allSettled(sendPromises)
    } else if (targetSubscription) {
      // Send to specific subscription
      try {
        await webpush.sendNotification(targetSubscription, notificationPayload)
        sentCount = 1
      } catch (error) {
        console.error('Failed to send notification:', error)
        failedCount = 1
      }
    } else {
      return NextResponse.json(
        { error: 'Either broadcast=true or targetSubscription must be provided' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
      totalSubscriptions: subscriptions.size
    })
  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

async function getSubscriptionStatus() {
  return NextResponse.json({
    success: true,
    data: {
      totalSubscriptions: subscriptions.size,
      vapidConfigured: !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
    }
  })
}

function getVapidPublicKey() {
  return NextResponse.json({
    success: true,
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  })
}

// Helper functions
function generateSubscriptionId(subscription: PushSubscription): string {
  // Create a unique ID based on the endpoint
  return Buffer.from(subscription.endpoint).toString('base64').slice(0, 16)
}

function findSubscriptionId(subscription: PushSubscription): string | null {
  for (const [id, storedSub] of subscriptions.entries()) {
    if (storedSub.endpoint === subscription.endpoint) {
      return id
    }
  }
  return null
}

// Notification templates
const notificationTemplates = {
  newTool: (toolName: string) => ({
    title: '新AI工具推荐',
    body: `发现新的AI工具：${toolName}，快来看看吧！`,
    tag: 'new-tool',
    url: '/tools'
  }),
  
  weeklyDigest: (toolCount: number) => ({
    title: '本周AI工具精选',
    body: `本周为您精选了${toolCount}个优质AI工具，不要错过！`,
    tag: 'weekly-digest',
    url: '/tools?filter=recent'
  }),
  
  categoryUpdate: (categoryName: string) => ({
    title: '分类更新提醒',
    body: `${categoryName}分类有新的工具更新，快来探索吧！`,
    tag: 'category-update',
    url: `/categories/${categoryName}`
  }),
  
  maintenance: () => ({
    title: '系统维护通知',
    body: '系统将进行短暂维护，期间可能无法访问部分功能。',
    tag: 'maintenance',
    url: '/'
  }),
  
  feature: (featureName: string) => ({
    title: '新功能上线',
    body: `${featureName}功能已上线，快来体验全新功能！`,
    tag: 'new-feature',
    url: '/'
  })
}

// Scheduled notification sender (would be called by a cron job)
async function sendScheduledNotifications() {
  try {
    // This would typically be called by a scheduled task
    const weeklyDigest = notificationTemplates.weeklyDigest(15)
    
    const payload = JSON.stringify(weeklyDigest)
    let sentCount = 0
    
    for (const subscription of subscriptions.values()) {
      try {
        await webpush.sendNotification(subscription, payload)
        sentCount++
      } catch (error) {
        console.error('Failed to send scheduled notification:', error)
      }
    }
    
    console.log(`Sent weekly digest to ${sentCount} subscribers`)
    return sentCount
    
  } catch (error) {
    console.error('Failed to send scheduled notifications:', error)
    return 0
  }
}