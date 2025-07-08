'use client'

import { useState, useEffect } from 'react'

interface AutomationMetrics {
  systemHealth: 'healthy' | 'warning' | 'critical'
  uptime: number
  automationLevel: number
  healthScore: number
  metrics: {
    seo: {
      keywordsTracked: number
      avgPosition: number
      organicTraffic: number
    }
    userBehavior: {
      activeUsers: number
      conversionRate: number
      sessionDuration: number
    }
    recommendations: {
      accuracy: number
      ctr: number
      userSatisfaction: number
    }
    content: {
      pagesGenerated: number
      contentScore: number
    }
    competition: {
      competitorsMonitored: number
      changesDetected: number
    }
  }
  revenueOptimization: {
    monthlyRevenue: number
    growthRate: number
    automatedActions: number
  }
  tasks: {
    scheduled: number
    completed: number
    failed: number
    running: number
  }
  insights: string[]
  nextOptimization: string
}

export default function AutomationDashboard() {
  const [metrics, setMetrics] = useState<AutomationMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    fetchAutomationStatus()
    const interval = setInterval(fetchAutomationStatus, 30000) // 每30秒刷新

    return () => clearInterval(interval)
  }, [])

  const fetchAutomationStatus = async () => {
    try {
      const response = await fetch('/api/automation/status')
      const data = await response.json()
      
      if (data.success) {
        setMetrics(data.data)
        setLastUpdate(new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.error('获取自动化状态失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载自动化系统状态...</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">无法加载自动化系统状态</p>
          <button 
            onClick={fetchAutomationStatus}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getAutomationLevelColor = (level: number) => {
    if (level >= 95) return 'text-emerald-600'
    if (level >= 90) return 'text-green-600'
    if (level >= 80) return 'text-blue-600'
    if (level >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 头部状态 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI自动化营收系统</h1>
              <p className="text-gray-600 mt-1">
                最后更新: {lastUpdate} | 下次优化: {new Date(metrics.nextOptimization).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-full ${getHealthColor(metrics.systemHealth)}`}>
                <span className="font-semibold">
                  {metrics.systemHealth === 'healthy' ? '🟢 健康' : 
                   metrics.systemHealth === 'warning' ? '🟡 警告' : '🔴 严重'}
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{metrics.healthScore}%</div>
                <div className="text-sm text-gray-600">系统健康度</div>
              </div>
            </div>
          </div>
        </div>

        {/* 核心指标 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="ml-4">
                <div className={`text-2xl font-bold ${getAutomationLevelColor(metrics.automationLevel)}`}>
                  {metrics.automationLevel.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">自动化水平</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  ${metrics.revenueOptimization.monthlyRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">
                  +{metrics.revenueOptimization.growthRate.toFixed(1)}% 增长
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.metrics.userBehavior.activeUsers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">活跃用户</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.metrics.userBehavior.conversionRate.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-600">转化率</div>
              </div>
            </div>
          </div>
        </div>

        {/* 详细指标 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* SEO指标 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 SEO自动化</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">关键词跟踪</span>
                <span className="font-semibold">{metrics.metrics.seo.keywordsTracked}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">平均排名</span>
                <span className="font-semibold">{metrics.metrics.seo.avgPosition.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">有机流量</span>
                <span className="font-semibold">{metrics.metrics.seo.organicTraffic.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 推荐系统指标 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🧠 智能推荐</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">推荐准确率</span>
                <span className="font-semibold">{metrics.metrics.recommendations.accuracy.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">点击率</span>
                <span className="font-semibold">{metrics.metrics.recommendations.ctr.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">用户满意度</span>
                <span className="font-semibold">{metrics.metrics.recommendations.userSatisfaction.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* 内容生成指标 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">✍️ 内容自动化</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">自动生成页面</span>
                <span className="font-semibold">{metrics.metrics.content.pagesGenerated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">内容质量得分</span>
                <span className="font-semibold">{metrics.metrics.content.contentScore.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* 任务状态 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ 任务执行</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">计划任务</span>
                <span className="font-semibold">{metrics.tasks.scheduled}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">已完成</span>
                <span className="font-semibold text-green-600">{metrics.tasks.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">运行中</span>
                <span className="font-semibold text-blue-600">{metrics.tasks.running}</span>
              </div>
              {metrics.tasks.failed > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">失败</span>
                  <span className="font-semibold text-red-600">{metrics.tasks.failed}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 洞察和建议 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 系统洞察</h3>
          <div className="space-y-2">
            {metrics.insights.map((insight, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-800">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 自动化成就 */}
        {metrics.automationLevel >= 95 && (
          <div className="mt-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg shadow-sm p-6 text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">🎉 恭喜！达成完全自主盈利！</h2>
              <p className="text-lg">
                系统自动化水平已达到 {metrics.automationLevel.toFixed(1)}%，
                实现了接近完全不需要人工干预的自主营收优化！
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">${metrics.revenueOptimization.monthlyRevenue.toLocaleString()}</div>
                  <div className="text-sm opacity-90">月收入</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">+{metrics.revenueOptimization.growthRate.toFixed(1)}%</div>
                  <div className="text-sm opacity-90">增长率</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.revenueOptimization.automatedActions}</div>
                  <div className="text-sm opacity-90">自动化操作</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}