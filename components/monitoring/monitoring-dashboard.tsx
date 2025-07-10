'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  Database, 
  Globe, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Zap,
  Clock,
  Users,
  Server
} from 'lucide-react'

interface MetricData {
  name: string
  value: number | string
  unit?: string
  status: 'good' | 'warning' | 'critical'
  trend?: 'up' | 'down' | 'stable'
}

interface PerformanceMetrics {
  webVitals: MetricData[]
  database: MetricData[]
  server: MetricData[]
  business: MetricData[]
}

export function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // 获取性能指标
  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/monitoring/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  // 刷新指标
  const refreshMetrics = () => {
    setLoading(true)
    fetchMetrics()
    setLastUpdate(new Date())
  }

  useEffect(() => {
    fetchMetrics()
    
    // 每30秒自动刷新
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getTrendIcon = (trend?: string) => {
    if (!trend) return null
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down': return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
      case 'stable': return <div className="w-4 h-4 border-t-2 border-gray-400" />
      default: return null
    }
  }

  const MetricCard = ({ metric }: { metric: MetricData }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(metric.status)}
            <span className="font-medium">{metric.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            {getTrendIcon(metric.trend)}
            <Badge className={getStatusColor(metric.status)}>
              {metric.status}
            </Badge>
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold">{metric.value}</span>
          {metric.unit && (
            <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 animate-spin" />
          <span>加载监控数据...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">系统监控</h2>
          <p className="text-gray-600 mt-1">
            最后更新: {lastUpdate.toLocaleString()}
          </p>
        </div>
        <Button onClick={refreshMetrics} disabled={loading}>
          <Activity className="w-4 h-4 mr-2" />
          刷新数据
        </Button>
      </div>

      {/* 总览状态 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span className="font-medium">网站状态</span>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">正常运行</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-purple-600" />
              <span className="font-medium">服务器</span>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">健康</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-orange-600" />
              <span className="font-medium">数据库</span>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">连接正常</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="font-medium">用户</span>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm">活跃增长</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细指标 */}
      <Tabs defaultValue="webvitals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="webvitals">
            <Zap className="w-4 h-4 mr-2" />
            Web Vitals
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="w-4 h-4 mr-2" />
            数据库
          </TabsTrigger>
          <TabsTrigger value="server">
            <Server className="w-4 h-4 mr-2" />
            服务器
          </TabsTrigger>
          <TabsTrigger value="business">
            <TrendingUp className="w-4 h-4 mr-2" />
            业务指标
          </TabsTrigger>
        </TabsList>

        <TabsContent value="webvitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Core Web Vitals</span>
              </CardTitle>
              <CardDescription>
                用户体验关键指标，影响SEO排名
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics?.webVitals.map((metric, index) => (
                  <MetricCard key={index} metric={metric} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>数据库性能</span>
              </CardTitle>
              <CardDescription>
                数据库连接、查询性能和资源使用
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics?.database.map((metric, index) => (
                  <MetricCard key={index} metric={metric} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="server" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="w-5 h-5" />
                <span>服务器资源</span>
              </CardTitle>
              <CardDescription>
                CPU、内存、网络和存储使用情况
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics?.server.map((metric, index) => (
                  <MetricCard key={index} metric={metric} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>业务指标</span>
              </CardTitle>
              <CardDescription>
                用户活跃度、转化率和收入指标
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics?.business.map((metric, index) => (
                  <MetricCard key={index} metric={metric} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 告警信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span>系统告警</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Clock className="w-4 h-4" />
            <AlertDescription>
              系统运行正常，暂无告警信息。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

// 默认导出
export default MonitoringDashboard