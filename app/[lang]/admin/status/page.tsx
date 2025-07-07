"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Monitor,
  Database,
  Globe,
  BarChart3
} from 'lucide-react'

interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
    temperature: number
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  disk: {
    used: number
    total: number
    percentage: number
  }
  network: {
    upload: number
    download: number
    latency: number
  }
  database: {
    connections: number
    queryTime: number
    size: number
  }
  uptime: number
  responseTime: number
  errorRate: number
  activeUsers: number
}

interface ServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'error'
  uptime: number
  lastCheck: string
  responseTime?: number
  errorCount?: number
}

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error'
  service: string
  message: string
}

const mockServices: ServiceStatus[] = [
  {
    name: '自动化系统',
    status: 'healthy',
    uptime: 99.8,
    lastCheck: '30秒前',
    responseTime: 120,
    errorCount: 0
  },
  {
    name: '内容生成器',
    status: 'healthy',
    uptime: 99.5,
    lastCheck: '1分钟前',
    responseTime: 250,
    errorCount: 0
  },
  {
    name: '工具爬取器',
    status: 'warning',
    uptime: 97.8,
    lastCheck: '2分钟前',
    responseTime: 450,
    errorCount: 2
  },
  {
    name: 'SEO优化器',
    status: 'healthy',
    uptime: 99.9,
    lastCheck: '45秒前',
    responseTime: 180,
    errorCount: 0
  },
  {
    name: '数据库',
    status: 'healthy',
    uptime: 99.99,
    lastCheck: '15秒前',
    responseTime: 85,
    errorCount: 0
  },
  {
    name: 'API网关',
    status: 'healthy',
    uptime: 99.7,
    lastCheck: '20秒前',
    responseTime: 95,
    errorCount: 0
  }
]

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-15T14:30:25Z',
    level: 'info',
    service: '内容生成器',
    message: '成功生成新文章: "ChatGPT全面评测"'
  },
  {
    id: '2',
    timestamp: '2024-01-15T14:28:15Z',
    level: 'warning',
    service: '工具爬取器',
    message: 'Product Hunt API响应时间超过5秒'
  },
  {
    id: '3',
    timestamp: '2024-01-15T14:25:42Z',
    level: 'info',
    service: '自动化系统',
    message: '定时任务执行完成: SEO优化'
  },
  {
    id: '4',
    timestamp: '2024-01-15T14:20:18Z',
    level: 'error',
    service: '工具爬取器',
    message: '爬取GitHub失败: 网络连接超时'
  },
  {
    id: '5',
    timestamp: '2024-01-15T14:15:33Z',
    level: 'info',
    service: 'SEO优化器',
    message: '完成关键词研究和分析'
  }
]

export default function SystemStatus() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: {
      usage: 45,
      cores: 8,
      temperature: 65
    },
    memory: {
      used: 12.5,
      total: 32,
      percentage: 39
    },
    disk: {
      used: 285,
      total: 500,
      percentage: 57
    },
    network: {
      upload: 2.5,
      download: 15.8,
      latency: 25
    },
    database: {
      connections: 45,
      queryTime: 125,
      size: 2.8
    },
    uptime: 99.8,
    responseTime: 145,
    errorRate: 0.2,
    activeUsers: 1247
  })

  const [services, setServices] = useState<ServiceStatus[]>(mockServices)
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedLogLevel, setSelectedLogLevel] = useState<string>('all')

  // 刷新系统状态
  const refreshStatus = async () => {
    setIsRefreshing(true)
    // 模拟刷新
    setTimeout(() => {
      setIsRefreshing(false)
    }, 2000)
  }

  // 自动刷新
  useEffect(() => {
    const interval = setInterval(() => {
      // 模拟实时数据更新
      setMetrics(prev => ({
        ...prev,
        cpu: {
          ...prev.cpu,
          usage: Math.max(10, Math.min(90, prev.cpu.usage + (Math.random() - 0.5) * 10))
        }
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // 状态指示器
  const StatusIndicator = ({ status }: { status: 'healthy' | 'warning' | 'error' }) => {
    const config = {
      healthy: { color: 'bg-green-500', text: 'text-green-400', label: '正常' },
      warning: { color: 'bg-yellow-500', text: 'text-yellow-400', label: '警告' },
      error: { color: 'bg-red-500', text: 'text-red-400', label: '错误' }
    }
    
    const { color, text, label } = config[status]
    
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
        <span className={`text-sm ${text}`}>{label}</span>
      </div>
    )
  }

  // 进度条组件
  const ProgressBar = ({ value, max, label, color, unit = '%' }: {
    value: number
    max: number
    label: string
    color: string
    unit?: string
  }) => {
    const percentage = (value / max) * 100
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">{label}</span>
          <span className="text-white">{value}{unit}</span>
        </div>
        <div className="w-full bg-neutral-800 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }

  // 指标卡片
  const MetricCard = ({ title, value, unit, icon: Icon, trend, color }: {
    title: string
    value: number | string
    unit?: string
    icon: any
    trend?: number
    color: string
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass rounded-xl p-6 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${
            trend >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-white mb-1">
          {value}{unit}
        </div>
        <div className="text-sm text-neutral-400">{title}</div>
      </div>
    </motion.div>
  )

  // 日志级别标签
  const LogLevelBadge = ({ level }: { level: string }) => {
    const config = {
      info: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'INFO' },
      warning: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'WARN' },
      error: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'ERROR' }
    }
    
    const { color, label } = config[level as keyof typeof config] || config.info
    
    return (
      <span className={`px-2 py-1 text-xs rounded border ${color}`}>
        {label}
      </span>
    )
  }

  // 筛选日志
  const filteredLogs = logs.filter(log => 
    selectedLogLevel === 'all' || log.level === selectedLogLevel
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">系统状态监控</h1>
          <p className="text-neutral-400">实时系统性能和服务状态监控</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={refreshStatus}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl transition-all duration-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? '刷新中...' : '刷新状态'}
        </motion.button>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="系统在线率"
          value={metrics.uptime}
          unit="%"
          icon={Activity}
          trend={0.1}
          color="bg-green-500/20"
        />
        <MetricCard
          title="响应时间"
          value={metrics.responseTime}
          unit="ms"
          icon={Clock}
          trend={-2}
          color="bg-blue-500/20"
        />
        <MetricCard
          title="错误率"
          value={metrics.errorRate}
          unit="%"
          icon={AlertTriangle}
          trend={-15}
          color="bg-yellow-500/20"
        />
        <MetricCard
          title="活跃用户"
          value={metrics.activeUsers}
          icon={Globe}
          trend={8}
          color="bg-purple-500/20"
        />
      </div>

      {/* 系统资源 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 系统性能 */}
        <motion.div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">系统性能</h3>
            <Monitor className="w-5 h-5 text-neutral-400" />
          </div>
          
          <div className="space-y-6">
            <ProgressBar
              value={metrics.cpu.usage}
              max={100}
              label={`CPU使用率 (${metrics.cpu.cores}核)`}
              color="bg-blue-500"
            />
            
            <ProgressBar
              value={metrics.memory.percentage}
              max={100}
              label={`内存使用 (${metrics.memory.used}GB/${metrics.memory.total}GB)`}
              color="bg-green-500"
            />
            
            <ProgressBar
              value={metrics.disk.percentage}
              max={100}
              label={`磁盘使用 (${metrics.disk.used}GB/${metrics.disk.total}GB)`}
              color="bg-orange-500"
            />
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{metrics.cpu.temperature}°C</div>
                <div className="text-sm text-neutral-400">CPU温度</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{metrics.network.latency}ms</div>
                <div className="text-sm text-neutral-400">网络延迟</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 网络和数据库 */}
        <motion.div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">网络和数据库</h3>
            <Database className="w-5 h-5 text-neutral-400" />
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">↓{metrics.network.download}</div>
                <div className="text-sm text-neutral-400">MB/s 下载</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">↑{metrics.network.upload}</div>
                <div className="text-sm text-neutral-400">MB/s 上传</div>
              </div>
            </div>
            
            <div className="border-t border-neutral-700 pt-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between">
                  <span className="text-neutral-400">数据库连接</span>
                  <span className="text-white">{metrics.database.connections}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">平均查询时间</span>
                  <span className="text-white">{metrics.database.queryTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">数据库大小</span>
                  <span className="text-white">{metrics.database.size}GB</span>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-neutral-800 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${(metrics.database.connections / 100) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* 服务状态 */}
      <motion.div className="glass rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">服务状态</h3>
          <Settings className="w-5 h-5 text-neutral-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <motion.div
              key={service.name}
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-neutral-800/50 rounded-lg hover:bg-neutral-800/70 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white">{service.name}</h4>
                <StatusIndicator status={service.status} />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">在线率</span>
                  <span className="text-white">{service.uptime}%</span>
                </div>
                {service.responseTime && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">响应时间</span>
                    <span className="text-white">{service.responseTime}ms</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-400">最后检查</span>
                  <span className="text-white">{service.lastCheck}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 系统日志 */}
      <motion.div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">系统日志</h3>
          <div className="flex items-center gap-4">
            <select
              value={selectedLogLevel}
              onChange={(e) => setSelectedLogLevel(e.target.value)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">全部级别</option>
              <option value="info">信息</option>
              <option value="warning">警告</option>
              <option value="error">错误</option>
            </select>
            <BarChart3 className="w-5 h-5 text-neutral-400" />
          </div>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <LogLevelBadge level={log.level} />
                  <span className="text-sm font-medium text-blue-400">{log.service}</span>
                </div>
                <span className="text-xs text-neutral-400">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-neutral-300">{log.message}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}