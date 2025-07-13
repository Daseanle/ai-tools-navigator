'use client'

/**
 * 自动化运营控制面板
 * 网站自动化系统的统一管理界面
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  PlayCircle, 
  StopCircle, 
  RefreshCw, 
  Activity, 
  TrendingUp, 
  Users, 
  Search, 
  FileText, 
  TestTube,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  Zap
} from 'lucide-react'

interface SystemStatus {
  isRunning: boolean
  lastHealthCheck: string | null
  activeSchedules: any[]
  systemInfo: any
}

interface HealthStatus {
  overall: 'excellent' | 'good' | 'warning' | 'critical'
  systems: any
  alerts: any[]
  recommendations: string[]
}

interface Metrics {
  traffic: any
  conversion: any
  content: any
  automation: any
}

export default function AutomationControlPanel() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取系统状态
  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/automation/master?action=status')
      const data = await response.json()
      setSystemStatus(data)
    } catch (error) {
      console.error('获取系统状态失败:', error)
      setError('无法获取系统状态')
    }
  }

  // 获取健康状态
  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/api/automation/master?action=health')
      const data = await response.json()
      if (data.status === 'success') {
        setHealthStatus(data.health)
      }
    } catch (error) {
      console.error('获取健康状态失败:', error)
    }
  }

  // 获取性能指标
  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/automation/master?action=metrics')
      const data = await response.json()
      if (data.status === 'success') {
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('获取性能指标失败:', error)
    }
  }

  // 启动自动化系统
  const startAutomation = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/automation/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      })
      const data = await response.json()
      if (data.status === 'success') {
        await fetchSystemStatus()
        setError(null)
      } else {
        setError(data.error || '启动失败')
      }
    } catch (error) {
      setError('启动自动化系统失败')
    } finally {
      setLoading(false)
    }
  }

  // 停止自动化系统
  const stopAutomation = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/automation/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      })
      const data = await response.json()
      if (data.status === 'success') {
        await fetchSystemStatus()
        setError(null)
      } else {
        setError(data.error || '停止失败')
      }
    } catch (error) {
      setError('停止自动化系统失败')
    } finally {
      setLoading(false)
    }
  }

  // 执行特定操作
  const executeAction = async (action: string, params: any = {}) => {
    setLoading(true)
    try {
      const response = await fetch('/api/automation/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...params })
      })
      const data = await response.json()
      
      if (data.status === 'success') {
        // 刷新相关数据
        await Promise.all([
          fetchSystemStatus(),
          fetchHealthStatus(),
          fetchMetrics()
        ])
        setError(null)
        return data
      } else {
        setError(data.error || '操作失败')
      }
    } catch (error) {
      setError(`执行${action}失败`)
    } finally {
      setLoading(false)
    }
  }

  // 初始化数据加载
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchSystemStatus(),
          fetchHealthStatus(),
          fetchMetrics()
        ])
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()

    // 设置定时刷新
    const interval = setInterval(() => {
      fetchSystemStatus()
      fetchHealthStatus()
    }, 30000) // 每30秒刷新一次

    return () => clearInterval(interval)
  }, [])

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'good': return <CheckCircle className="h-5 w-5 text-blue-600" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />
      default: return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🤖 AI Navigator 自动化控制台</h1>
          <p className="text-gray-600 mt-2">统一管理网站自动化运营系统</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={fetchSystemStatus}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          
          {systemStatus?.isRunning ? (
            <Button 
              onClick={stopAutomation}
              variant="destructive"
              disabled={loading}
            >
              <StopCircle className="h-4 w-4 mr-2" />
              停止自动化
            </Button>
          ) : (
            <Button 
              onClick={startAutomation}
              disabled={loading}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              启动自动化
            </Button>
          )}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 系统状态概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">系统状态</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {systemStatus?.isRunning ? (
                <>
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600">运行中</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">已停止</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">健康状态</CardTitle>
            {healthStatus && getHealthIcon(healthStatus.overall)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${healthStatus ? getHealthColor(healthStatus.overall) : 'text-gray-400'}`}>
              {healthStatus?.overall || 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃任务</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStatus?.activeSchedules?.filter(s => s.enabled).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              总计 {systemStatus?.activeSchedules?.length || 0} 个任务
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成功率</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics?.automation?.successRate ? Math.round(metrics.automation.successRate * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要控制面板 */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="systems">系统监控</TabsTrigger>
          <TabsTrigger value="content">内容生成</TabsTrigger>
          <TabsTrigger value="seo">SEO优化</TabsTrigger>
          <TabsTrigger value="testing">A/B测试</TabsTrigger>
          <TabsTrigger value="analytics">用户分析</TabsTrigger>
        </TabsList>

        {/* 概览标签页 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 性能指标 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  性能指标
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">总流量</span>
                        <span className="font-medium">{metrics.traffic?.total?.toLocaleString() || 0}</span>
                      </div>
                      <Progress value={(metrics.traffic?.growth || 0) * 100} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">转化率</span>
                        <span className="font-medium">{((metrics.conversion?.rates?.signup || 0) * 100).toFixed(2)}%</span>
                      </div>
                      <Progress value={(metrics.conversion?.rates?.signup || 0) * 100} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">内容生成</span>
                        <span className="font-medium">{metrics.content?.published || 0} 篇</span>
                      </div>
                      <Progress value={metrics.content?.engagement || 0} className="h-2" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* 系统警报 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  系统警报
                </CardTitle>
              </CardHeader>
              <CardContent>
                {healthStatus?.alerts && healthStatus.alerts.length > 0 ? (
                  <div className="space-y-2">
                    {healthStatus.alerts.slice(0, 5).map((alert, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 rounded border-l-2 border-yellow-400 bg-yellow-50">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{alert.type}</p>
                          <p className="text-xs text-gray-600">{alert.message}</p>
                        </div>
                        <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                    <p>系统运行正常，无警报</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 系统监控标签页 */}
        <TabsContent value="systems" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthStatus?.systems && Object.entries(healthStatus.systems).map(([systemName, system]) => (
              <Card key={systemName}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {getHealthIcon((system as any).status)}
                    {systemName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">状态</span>
                      <Badge variant={(system as any).status === 'healthy' ? 'default' : 'destructive'}>
                        {(system as any).status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">性能</span>
                      <span className="font-medium">{(system as any).performance}%</span>
                    </div>
                    <Progress value={(system as any).performance} className="h-2" />
                    <div className="text-xs text-gray-500">
                      最后活跃: {new Date((system as any).lastActive).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 内容生成标签页 */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                内容生成控制
              </CardTitle>
              <CardDescription>
                AI驱动的自动化内容生产系统
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={() => executeAction('generate_content')}
                  disabled={loading}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  生成内容
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => executeAction('generate_content', { topics: ['AI工具评测', '自动化教程'] })}
                  disabled={loading}
                >
                  指定主题生成
                </Button>
              </div>
              
              {metrics?.content && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.content.generated}</div>
                    <div className="text-sm text-gray-600">已生成</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.content.published}</div>
                    <div className="text-sm text-gray-600">已发布</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.content.engagement}%</div>
                    <div className="text-sm text-gray-600">参与度</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.content.seoScore}</div>
                    <div className="text-sm text-gray-600">SEO评分</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO优化标签页 */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                SEO自动化优化
              </CardTitle>
              <CardDescription>
                智能SEO分析和竞品监控系统
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={() => executeAction('seo_analysis')}
                  disabled={loading}
                >
                  <Search className="h-4 w-4 mr-2" />
                  执行SEO分析
                </Button>
                
                <Button 
                  variant="outline"
                  disabled={loading}
                >
                  竞品监控
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B测试标签页 */}
        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                智能A/B测试
              </CardTitle>
              <CardDescription>
                自动化实验设计和转化优化
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={() => executeAction('run_ab_test')}
                  disabled={loading}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  创建A/B测试
                </Button>
                
                <Button 
                  variant="outline"
                  disabled={loading}
                >
                  查看测试结果
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 用户分析标签页 */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                用户行为分析
              </CardTitle>
              <CardDescription>
                AI驱动的用户画像和个性化推荐
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={() => executeAction('analyze_user', { userId: 'demo_user' })}
                  disabled={loading}
                >
                  <Users className="h-4 w-4 mr-2" />
                  分析用户行为
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => executeAction('optimize_conversion', { userId: 'demo_user' })}
                  disabled={loading}
                >
                  优化转化体验
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}