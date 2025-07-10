// Real-time API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'

    switch (action) {
      case 'status':
        return await getRealtimeStatus()
      case 'metrics':
        return await getRealtimeMetrics()
      case 'activity':
        return await getRecentActivity()
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Real-time API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'broadcast':
        return await broadcastUpdate(data)
      case 'trigger':
        return await triggerEvent(data)
      case 'notify':
        return await sendNotification(data)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Real-time API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getRealtimeStatus() {
  // Get connection statistics and health
  const status = {
    connected: true,
    timestamp: new Date().toISOString(),
    activeConnections: 0,
    subscriptions: 0
  }

  return NextResponse.json({
    success: true,
    data: status
  })
}

async function getRealtimeMetrics() {
  try {
    // Fetch real-time metrics
    const [tools, analytics, users] = await Promise.all([
      supabase.from('tools').select('id, rating, visits, created_at'),
      supabase.from('tool_analytics').select('*').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('users').select('id, last_active').gte('last_active', new Date(Date.now() - 5 * 60 * 1000).toISOString())
    ])

    const metrics = {
      totalTools: tools.data?.length || 0,
      activeUsers: users.data?.length || 0,
      totalViews: tools.data?.reduce((sum, tool) => sum + (tool.visits || 0), 0) || 0,
      avgRating: tools.data?.reduce((sum, tool) => sum + (tool.rating || 0), 0) / (tools.data?.length || 1) || 0,
      dailyActivity: analytics.data?.length || 0
    }

    return NextResponse.json({
      success: true,
      data: metrics
    })
  } catch (error) {
    console.error('Metrics fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}

async function getRecentActivity() {
  try {
    const { data, error } = await supabase
      .from('tool_analytics')
      .select(`
        *,
        tool:tools(name, logo_url),
        user:users(name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('Activity fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }
}

async function broadcastUpdate(data: any) {
  try {
    const { table, record, type } = data

    // Insert/update the record to trigger real-time updates
    let result
    switch (type) {
      case 'INSERT':
        result = await supabase.from(table).insert(record)
        break
      case 'UPDATE':
        result = await supabase.from(table).update(record).eq('id', record.id)
        break
      case 'DELETE':
        result = await supabase.from(table).delete().eq('id', record.id)
        break
      default:
        throw new Error('Invalid update type')
    }

    if (result.error) throw result.error

    return NextResponse.json({
      success: true,
      message: 'Update broadcasted successfully'
    })
  } catch (error) {
    console.error('Broadcast error:', error)
    return NextResponse.json({ error: 'Failed to broadcast update' }, { status: 500 })
  }
}

async function triggerEvent(data: any) {
  try {
    const { event, payload } = data

    // Log the event for analytics
    await supabase.from('system_events').insert({
      event_type: event,
      payload,
      created_at: new Date().toISOString()
    })

    // Trigger specific actions based on event type
    switch (event) {
      case 'tool_view':
        await incrementToolViews(payload.toolId)
        break
      case 'tool_rating':
        await updateToolRating(payload.toolId, payload.rating)
        break
      case 'user_activity':
        await updateUserActivity(payload.userId)
        break
    }

    return NextResponse.json({
      success: true,
      message: 'Event triggered successfully'
    })
  } catch (error) {
    console.error('Event trigger error:', error)
    return NextResponse.json({ error: 'Failed to trigger event' }, { status: 500 })
  }
}

async function sendNotification(data: any) {
  try {
    const { title, message, type, targetUsers } = data

    const notification = {
      title,
      message,
      type: type || 'info',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }

    // Insert global notification
    const { error } = await supabase.from('notifications').insert(notification)
    if (error) throw error

    // Send to specific users if specified
    if (targetUsers && targetUsers.length > 0) {
      const userNotifications = targetUsers.map((userId: string) => ({
        ...notification,
        user_id: userId
      }))
      
      await supabase.from('user_notifications').insert(userNotifications)
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully'
    })
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}

// Helper functions
async function incrementToolViews(toolId: string) {
  await supabase.rpc('increment_tool_views', { tool_id_param: toolId })
}

async function updateToolRating(toolId: string, rating: number) {
  // This would typically recalculate the average rating
  await supabase.rpc('update_tool_rating', { 
    tool_id_param: toolId, 
    new_rating: rating 
  })
}

async function updateUserActivity(userId: string) {
  await supabase
    .from('users')
    .update({ last_active: new Date().toISOString() })
    .eq('id', userId)
}

// WebSocket connection handler (commented out for standard route)
// export async function WEBSOCKET(request: NextRequest) {
//   // This would handle WebSocket connections for real-time updates
//   // Implementation would depend on your WebSocket setup
//   return new Response('WebSocket upgrade not implemented in this context', { 
//     status: 501 
//   })
// }