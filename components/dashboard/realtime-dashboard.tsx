// Real-time Dashboard Component
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRealTimeSync, useToolsSync, useAnalyticsSync, RealTimeStatus } from '@/lib/realtime-sync'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Activity, Users, TrendingUp, Eye } from 'lucide-react'

// ==================== Real-time Metrics Dashboard ====================

export function RealTimeDashboard() {
  const [metrics, setMetrics] = useState({
    totalTools: 0,
    activeUsers: 0,
    totalViews: 0,
    avgRating: 0
  })

  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Real-time subscriptions
  const { data: tools, isConnected: toolsConnected } = useToolsSync()
  const { data: analytics, isConnected: analyticsConnected } = useAnalyticsSync()

  // Update metrics when data changes
  useEffect(() => {
    if (tools.length > 0) {
      const totalRating = tools.reduce((sum, tool) => sum + (tool.rating || 0), 0)
      const avgRating = totalRating / tools.length

      setMetrics(prev => ({
        ...prev,
        totalTools: tools.length,
        avgRating: Math.round(avgRating * 10) / 10
      }))
    }
  }, [tools])

  useEffect(() => {
    if (analytics.length > 0) {
      const totalViews = analytics.reduce((sum, item) => sum + (item.views || 0), 0)
      
      setMetrics(prev => ({
        ...prev,
        totalViews,
        activeUsers: analytics.filter(item => 
          item.last_active && 
          new Date(item.last_active) > new Date(Date.now() - 5 * 60 * 1000)
        ).length
      }))

      // Update recent activity
      const recent = analytics
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
      
      setRecentActivity(recent)
    }
  }, [analytics])

  useEffect(() => {
    if (toolsConnected && analyticsConnected) {
      setIsLoading(false)
    }
  }, [toolsConnected, analyticsConnected])

  const refreshData = useCallback(() => {
    // Trigger data refresh
    window.location.reload()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading real-time data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Real-time Connection</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <RealTimeStatus />
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Tools"
          value={metrics.totalTools}
          icon={<Activity className="w-5 h-5" />}
          trend="+12%"
          trendColor="text-green-600"
        />
        
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers}
          icon={<Users className="w-5 h-5" />}
          trend="+5%"
          trendColor="text-green-600"
        />
        
        <MetricCard
          title="Total Views"
          value={metrics.totalViews.toLocaleString()}
          icon={<Eye className="w-5 h-5" />}
          trend="+18%"
          trendColor="text-green-600"
        />
        
        <MetricCard
          title="Avg Rating"
          value={metrics.avgRating}
          icon={<TrendingUp className="w-5 h-5" />}
          trend="+0.2"
          trendColor="text-green-600"
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Tools Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Live Tools Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <LiveToolsFeed tools={tools.slice(0, 5)} />
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== Metric Card Component ====================

function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendColor 
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendColor?: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className={`text-sm ${trendColor}`}>
                {trend} from last period
              </p>
            )}
          </div>
          <div className="text-gray-400">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== Activity Item Component ====================

function ActivityItem({ activity }: { activity: any }) {
  const getActivityType = () => {
    if (activity.event_type === 'view') return 'Tool viewed'
    if (activity.event_type === 'rating') return 'Tool rated'
    if (activity.event_type === 'favorite') return 'Tool favorited'
    return 'Unknown activity'
  }

  const getActivityColor = () => {
    switch (activity.event_type) {
      case 'view': return 'bg-blue-100 text-blue-800'
      case 'rating': return 'bg-green-100 text-green-800'
      case 'favorite': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <Badge className={getActivityColor()}>
          {getActivityType()}
        </Badge>
        <div>
          <p className="text-sm font-medium">
            {activity.tool_name || activity.user_name || 'Unknown'}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(activity.created_at).toLocaleTimeString()}
          </p>
        </div>
      </div>
      {activity.value && (
        <span className="text-sm text-gray-600">
          {activity.value}
        </span>
      )}
    </div>
  )
}

// ==================== Live Tools Feed ====================

function LiveToolsFeed({ tools }: { tools: any[] }) {
  return (
    <div className="space-y-3">
      {tools.length > 0 ? (
        tools.map((tool) => (
          <div key={tool.id} className="flex items-center gap-4 p-3 border rounded-lg">
            <img 
              src={tool.logo_url || '/placeholder-logo.png'} 
              alt={tool.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium">{tool.name}</h4>
              <p className="text-sm text-gray-600">{tool.tagline}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm">{tool.rating || 0}</span>
              </div>
              <p className="text-xs text-gray-500">
                {tool.visits || 0} views
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center py-4">
          No tools data available
        </p>
      )}
    </div>
  )
}

// ==================== Real-time Tool Card ====================

export function RealTimeToolCard({ toolId }: { toolId: string }) {
  const { data: ratings } = useRealTimeSync({
    channel: `tool-ratings-${toolId}`,
    table: 'tool_ratings',
    filter: `tool_id=eq.${toolId}`,
    events: ['INSERT', 'UPDATE', 'DELETE']
  })

  const [averageRating, setAverageRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)

  useEffect(() => {
    if (ratings.length > 0) {
      const total = ratings.reduce((sum, rating) => sum + rating.rating, 0)
      setAverageRating(total / ratings.length)
      setTotalRatings(ratings.length)
    }
  }, [ratings])

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Real-time Ratings</h3>
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">★</span>
            <span>{averageRating.toFixed(1)}</span>
            <span className="text-gray-500">({totalRatings} ratings)</span>
          </div>
        </div>
        <Badge variant="outline">Live</Badge>
      </div>
    </div>
  )
}

// ==================== Real-time Notifications ====================

export function RealTimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])

  const { data: globalUpdates } = useRealTimeSync({
    channel: 'global-notifications',
    table: 'notifications',
    events: ['INSERT'],
    debounceMs: 1000
  })

  useEffect(() => {
    if (globalUpdates.length > 0) {
      const newNotifications = globalUpdates
        .filter(notification => 
          new Date(notification.created_at) > new Date(Date.now() - 5 * 60 * 1000)
        )
        .slice(0, 5)
      
      setNotifications(newNotifications)
    }
  }, [globalUpdates])

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm animate-slide-in"
        >
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
            <div>
              <h4 className="font-medium text-sm">{notification.title}</h4>
              <p className="text-xs text-gray-600">{notification.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notification.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default RealTimeDashboard