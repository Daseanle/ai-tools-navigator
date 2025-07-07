"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bot, 
  TrendingUp, 
  FileText, 
  Settings, 
  Activity, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Zap,
  Target,
  BarChart3,
  Users,
  Globe,
  Cpu,
  Database,
  Wifi
} from 'lucide-react'
import { AutomationManager } from '@/lib/automation-manager'
import { AIContentGenerator } from '@/lib/ai-content-generator'
import { ToolCrawler } from '@/lib/tool-crawler'

// 状态接口定义
interface SystemStatus {
  automation: {
    running: boolean
    tasksInQueue: number
    activeTasks: number
    completedToday: number
    errorRate: number
  }
  contentGeneration: {
    articlesGenerated: number
    pendingReview: number
    published: number
    averageQuality: number
  }
  toolCrawling: {
    totalSources: number
    activeSources: number
    toolsCrawledToday: number
    successRate: number
  }
  performance: {
    pageSpeed: number
    uptime: number
    errorRate: number
    lastOptimized: string
  }
}

export default function AdminDashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    automation: {
      running: true,
      tasksInQueue: 12,
      activeTasks: 3,
      completedToday: 45,
      errorRate: 2.1
    },
    contentGeneration: {
      articlesGenerated: 156,
      pendingReview: 8,
      published: 148,
      averageQuality: 87.5
    },
    toolCrawling: {
      totalSources: 15,
      activeSources: 12,
      toolsCrawledToday: 89,
      successRate: 94.2
    },
    performance: {
      pageSpeed: 95,
      uptime: 99.8,
      errorRate: 0.2,
      lastOptimized: '2小时前'
    }
  })

  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)

  // 刷新系统状态
  const refreshStatus = async () => {
    setIsLoading(true)
    // 这里调用真实的API获取状态
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  // 控制自动化系统
  const toggleAutomation = async (action: 'start' | 'stop' | 'restart') => {
    setIsLoading(true)
    // 这里调用真实的API控制系统
    setTimeout(() => {
      setSystemStatus(prev => ({
        ...prev,
        automation: {
          ...prev.automation,
          running: action !== 'stop'
        }
      }))
      setIsLoading(false)
    }, 1000)
  }

  // 系统概览卡片
  const OverviewCard = ({ title, value, change, icon: Icon, color }: {
    title: string
    value: string | number
    change?: number
    icon: any
    color: string
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )

  // 系统状态指示器
  const StatusIndicator = ({ status, label }: { status: 'running' | 'stopped' | 'error', label: string }) => {
    const config = {
      running: { color: 'bg-green-500', text: 'text-green-400', icon: CheckCircle },
      stopped: { color: 'bg-red-500', text: 'text-red-400', icon: AlertCircle },
      error: { color: 'bg-yellow-500', text: 'text-yellow-400', icon: AlertCircle }
    }
    
    const { color, text, icon: Icon } = config[status]
    
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
        <Icon className={`w-4 h-4 ${text}`} />
        <span className="text-sm text-neutral-300">{label}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      {/* 头部 */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">AI自动化管理后台</h1>
            <p className="text-neutral-400">全自动化网站运营系统控制中心</p>
          </div>
          
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshStatus}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? '刷新中...' : '刷新状态'}
            </motion.button>
            
            <div className="flex items-center gap-2">
              <StatusIndicator 
                status={systemStatus.automation.running ? 'running' : 'stopped'} 
                label={systemStatus.automation.running ? '系统运行中' : '系统已停止'}
              />
            </div>
          </div>
        </div>

        {/* 系统概览 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <OverviewCard
            title="活跃任务"
            value={systemStatus.automation.activeTasks}
            change={12}
            icon={Activity}
            color="bg-blue-500/20"
          />
          <OverviewCard
            title="今日完成"
            value={systemStatus.automation.completedToday}
            change={8}
            icon={CheckCircle}
            color="bg-green-500/20"
          />
          <OverviewCard
            title="生成内容"
            value={systemStatus.contentGeneration.articlesGenerated}
            change={15}
            icon={FileText}
            color="bg-purple-500/20"
          />
          <OverviewCard
            title="爬取工具"
            value={systemStatus.toolCrawling.toolsCrawledToday}
            change={6}
            icon={Bot}
            color="bg-orange-500/20"
          />
        </div>

        {/* 控制面板 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 自动化系统控制 */}
          <motion.div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">自动化系统</h3>
              <Settings className="w-5 h-5 text-neutral-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">系统状态</span>
                <StatusIndicator 
                  status={systemStatus.automation.running ? 'running' : 'stopped'} 
                  label={systemStatus.automation.running ? '运行中' : '已停止'}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">错误率</span>
                <span className="text-sm text-white">{systemStatus.automation.errorRate}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">队列任务</span>
                <span className="text-sm text-white">{systemStatus.automation.tasksInQueue}</span>
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => toggleAutomation('start')}
                  disabled={systemStatus.automation.running}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 rounded-lg text-sm transition-colors"
                >
                  启动
                </button>
                <button
                  onClick={() => toggleAutomation('stop')}
                  disabled={!systemStatus.automation.running}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 rounded-lg text-sm transition-colors"
                >
                  停止
                </button>
                <button
                  onClick={() => toggleAutomation('restart')}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                >
                  重启
                </button>
              </div>
            </div>
          </motion.div>

          {/* 内容生成状态 */}
          <motion.div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">内容生成</h3>
              <FileText className="w-5 h-5 text-neutral-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">平均质量</span>
                <span className="text-sm text-white">{systemStatus.contentGeneration.averageQuality}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">待审核</span>
                <span className="text-sm text-white">{systemStatus.contentGeneration.pendingReview}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">已发布</span>
                <span className="text-sm text-white">{systemStatus.contentGeneration.published}</span>
              </div>
              
              <div className="w-full bg-neutral-800 rounded-full h-2 mt-4">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemStatus.contentGeneration.averageQuality}%` }}
                />
              </div>
            </div>
          </motion.div>

          {/* 工具爬取状态 */}
          <motion.div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">工具爬取</h3>
              <Bot className="w-5 h-5 text-neutral-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">成功率</span>
                <span className="text-sm text-white">{systemStatus.toolCrawling.successRate}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">活跃源</span>
                <span className="text-sm text-white">{systemStatus.toolCrawling.activeSources}/{systemStatus.toolCrawling.totalSources}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">今日爬取</span>
                <span className="text-sm text-white">{systemStatus.toolCrawling.toolsCrawledToday}</span>
              </div>
              
              <div className="w-full bg-neutral-800 rounded-full h-2 mt-4">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemStatus.toolCrawling.successRate}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* 性能监控 */}
        <motion.div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">系统性能监控</h3>
            <BarChart3 className="w-5 h-5 text-neutral-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{systemStatus.performance.pageSpeed}</div>
              <div className="text-sm text-neutral-400">页面速度分</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{systemStatus.performance.uptime}%</div>
              <div className="text-sm text-neutral-400">系统可用性</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{systemStatus.performance.errorRate}%</div>
              <div className="text-sm text-neutral-400">错误率</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">{systemStatus.performance.lastOptimized}</div>
              <div className="text-sm text-neutral-400">最后优化</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}