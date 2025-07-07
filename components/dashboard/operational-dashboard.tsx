"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  MousePointer,
  Star,
  MessageSquare,
  Target,
  Zap,
  Globe,
  Smartphone,
  Calendar,
  Download,
  Share2,
  Filter
} from "lucide-react"
import { AnalyticsManager, analytics } from "@/lib/analytics"
import { PaymentManager } from "@/lib/payment"

interface DashboardMetrics {
  overview: {
    totalRevenue: number
    monthlyRevenue: number
    activeUsers: number
    newSignups: number
    conversionRate: number
    revenueGrowth: number
  }
  traffic: {
    totalViews: number
    uniqueVisitors: number
    bounceRate: number
    avgSessionDuration: number
    topPages: Array<{ page: string; views: number; conversionRate: number }>
    trafficSources: Array<{ source: string; visitors: number; percentage: number }>
  }
  monetization: {
    membershipRevenue: number
    contentRevenue: number
    affiliateRevenue: number
    adRevenue: number
    apiRevenue: number
    enterpriseRevenue: number
    revenueBySource: Array<{ source: string; amount: number; growth: number }>
  }
  userBehavior: {
    popularTools: Array<{ name: string; views: number; conversions: number }>
    searchQueries: Array<{ query: string; count: number; ctr: number }>
    categories: Array<{ name: string; engagement: number; timeSpent: number }>
  }
  performance: {
    pageLoadTime: number
    apiResponseTime: number
    uptime: number
    errorRate: number
    performanceScore: number
  }
}

export default function OperationalDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [timeRange])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // 模拟加载综合运营数据
      const data: DashboardMetrics = {
        overview: {
          totalRevenue: 1248600,
          monthlyRevenue: 186900,
          activeUsers: 12450,
          newSignups: 890,
          conversionRate: 0.058,
          revenueGrowth: 0.23
        },
        traffic: {
          totalViews: 89650,
          uniqueVisitors: 34580,
          bounceRate: 0.34,
          avgSessionDuration: 285,
          topPages: [
            { page: '/', views: 18920, conversionRate: 0.072 },
            { page: '/tools', views: 15680, conversionRate: 0.045 },
            { page: '/membership', views: 4560, conversionRate: 0.156 },
            { page: '/prompts', views: 3890, conversionRate: 0.089 },
            { page: '/trials', views: 2950, conversionRate: 0.134 }
          ],
          trafficSources: [
            { source: '直接访问', visitors: 14580, percentage: 42.1 },
            { source: '百度', visitors: 9260, percentage: 26.8 },
            { source: '微信', visitors: 5180, percentage: 15.0 },
            { source: 'Google', visitors: 3450, percentage: 10.0 },
            { source: '其他', visitors: 2110, percentage: 6.1 }
          ]
        },
        monetization: {
          membershipRevenue: 78900,
          contentRevenue: 34500,
          affiliateRevenue: 28600,
          adRevenue: 22800,
          apiRevenue: 15200,
          enterpriseRevenue: 6900,
          revenueBySource: [
            { source: '会员订阅', amount: 78900, growth: 0.18 },
            { source: '内容付费', amount: 34500, growth: 0.25 },
            { source: '分销佣金', amount: 28600, growth: 0.32 },
            { source: '广告收入', amount: 22800, growth: 0.15 },
            { source: 'API服务', amount: 15200, growth: 0.45 },
            { source: '企业服务', amount: 6900, growth: 0.12 }
          ]
        },
        userBehavior: {
          popularTools: [
            { name: 'ChatGPT', views: 8950, conversions: 346 },
            { name: 'Midjourney', views: 6780, conversions: 289 },
            { name: 'Claude', views: 4560, conversions: 168 },
            { name: 'GitHub Copilot', views: 3890, conversions: 145 },
            { name: 'Notion AI', views: 2950, conversions: 112 }
          ],
          searchQueries: [
            { query: 'AI写作工具', count: 1250, ctr: 0.71 },
            { query: 'ChatGPT替代品', count: 890, ctr: 0.68 },
            { query: '免费AI工具', count: 650, ctr: 0.65 },
            { query: 'AI绘画软件', count: 580, ctr: 0.72 },
            { query: 'AI编程助手', count: 420, ctr: 0.69 }
          ],
          categories: [
            { name: 'AI写作', engagement: 0.78, timeSpent: 180 },
            { name: 'AI绘画', engagement: 0.82, timeSpent: 220 },
            { name: 'AI编程', engagement: 0.75, timeSpent: 195 },
            { name: '生产力工具', engagement: 0.70, timeSpent: 165 }
          ]
        },
        performance: {
          pageLoadTime: 1.2,
          apiResponseTime: 0.18,
          uptime: 99.8,
          errorRate: 0.02,
          performanceScore: 94
        }
      }
      
      setMetrics(data)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !metrics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-800 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-neutral-800 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">运营数据中心</h1>
          <p className="text-neutral-400">实时监控平台运营状况和商业化表现</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="7d">近7天</option>
            <option value="30d">近30天</option>
            <option value="90d">近90天</option>
          </select>
          
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>导出报告</span>
          </button>
        </div>
      </div>

      {/* 核心指标概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8" />
            <div className="text-right">
              <div className="text-sm opacity-90">月收入</div>
              <div className="text-2xl font-bold">¥{(metrics.overview.monthlyRevenue / 100).toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+{(metrics.overview.revenueGrowth * 100).toFixed(1)}% 环比增长</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8" />
            <div className="text-right">
              <div className="text-sm opacity-90">活跃用户</div>
              <div className="text-2xl font-bold">{metrics.overview.activeUsers.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+{metrics.overview.newSignups} 新用户</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8" />
            <div className="text-right">
              <div className="text-sm opacity-90">转化率</div>
              <div className="text-2xl font-bold">{(metrics.overview.conversionRate * 100).toFixed(1)}%</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">高于行业平均</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8" />
            <div className="text-right">
              <div className="text-sm opacity-90">性能得分</div>
              <div className="text-2xl font-bold">{metrics.performance.performanceScore}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">{metrics.performance.uptime}% 在线率</span>
          </div>
        </motion.div>
      </div>

      {/* 详细数据区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* 流量分析 */}
        <div className="bg-neutral-900 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">流量分析</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{metrics.traffic.totalViews.toLocaleString()}</div>
              <div className="text-neutral-400 text-sm">总浏览量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{metrics.traffic.uniqueVisitors.toLocaleString()}</div>
              <div className="text-neutral-400 text-sm">独立访客</div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-semibold">热门页面</h4>
            {metrics.traffic.topPages.map((page, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                <div>
                  <div className="text-white font-medium">{page.page}</div>
                  <div className="text-neutral-400 text-sm">{page.views.toLocaleString()} 浏览</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-semibold">{(page.conversionRate * 100).toFixed(1)}%</div>
                  <div className="text-neutral-400 text-xs">转化率</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 收入分析 */}
        <div className="bg-neutral-900 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">收入分析</h3>
          
          <div className="mb-6">
            <div className="text-3xl font-bold text-green-400 mb-2">
              ¥{(metrics.monetization.membershipRevenue + metrics.monetization.contentRevenue + 
                  metrics.monetization.affiliateRevenue + metrics.monetization.adRevenue +
                  metrics.monetization.apiRevenue + metrics.monetization.enterpriseRevenue).toLocaleString()}
            </div>
            <div className="text-neutral-400">本月总收入</div>
          </div>

          <div className="space-y-3">
            {metrics.monetization.revenueBySource.map((source, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                <div>
                  <div className="text-white font-medium">{source.source}</div>
                  <div className="text-green-400 text-sm">+{(source.growth * 100).toFixed(0)}% 增长</div>
                </div>
                <div className="text-white font-bold">
                  ¥{source.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 用户行为分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* 热门工具 */}
        <div className="bg-neutral-900 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">热门AI工具</h3>
          <div className="space-y-4">
            {metrics.userBehavior.popularTools.map((tool, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{tool.name}</div>
                  <div className="text-neutral-400 text-sm">{tool.views.toLocaleString()} 浏览</div>
                </div>
                <div className="text-blue-400 font-semibold">
                  {tool.conversions}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 搜索关键词 */}
        <div className="bg-neutral-900 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">热门搜索</h3>
          <div className="space-y-4">
            {metrics.userBehavior.searchQueries.map((query, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{query.query}</div>
                  <div className="text-neutral-400 text-sm">{query.count} 次搜索</div>
                </div>
                <div className="text-green-400 font-semibold">
                  {(query.ctr * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 分类表现 */}
        <div className="bg-neutral-900 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">分类表现</h3>
          <div className="space-y-4">
            {metrics.userBehavior.categories.map((category, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{category.name}</span>
                  <span className="text-purple-400">{(category.engagement * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                    style={{ width: `${category.engagement * 100}%` }}
                  />
                </div>
                <div className="text-neutral-400 text-sm">
                  平均停留 {category.timeSpent}秒
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 性能监控 */}
      <div className="bg-neutral-900 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6">系统性能监控</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {metrics.performance.pageLoadTime}s
            </div>
            <div className="text-neutral-400 text-sm">页面加载时间</div>
            <div className="text-green-400 text-xs mt-1">优秀</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {metrics.performance.apiResponseTime}s
            </div>
            <div className="text-neutral-400 text-sm">API响应时间</div>
            <div className="text-green-400 text-xs mt-1">优秀</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {metrics.performance.uptime}%
            </div>
            <div className="text-neutral-400 text-sm">系统可用率</div>
            <div className="text-green-400 text-xs mt-1">优秀</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {(metrics.performance.errorRate * 100).toFixed(2)}%
            </div>
            <div className="text-neutral-400 text-sm">错误率</div>
            <div className="text-green-400 text-xs mt-1">良好</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">
              {metrics.performance.performanceScore}
            </div>
            <div className="text-neutral-400 text-sm">性能得分</div>
            <div className="text-green-400 text-xs mt-1">优秀</div>
          </div>
        </div>
      </div>
    </div>
  )
}