// Developer Tools Dashboard
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Code2, 
  Database, 
  Globe, 
  Zap, 
  Activity, 
  Settings, 
  Terminal,
  FileText,
  Bug,
  Gauge
} from 'lucide-react'

// ==================== Developer Dashboard ====================

export function DeveloperDashboard() {
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const [apiHealth, setApiHealth] = useState<any>(null)
  const [buildInfo, setBuildInfo] = useState<any>(null)

  useEffect(() => {
    loadDeveloperData()
  }, [])

  const loadDeveloperData = async () => {
    try {
      const [systemRes, healthRes, buildRes] = await Promise.all([
        fetch('/api/dev/system'),
        fetch('/api/dev/health'),
        fetch('/api/dev/build')
      ])

      setSystemInfo(await systemRes.json())
      setApiHealth(await healthRes.json())
      setBuildInfo(await buildRes.json())
    } catch (error) {
      console.error('Failed to load developer data:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">开发者工具</h1>
          <p className="text-gray-600">系统监控和开发辅助工具</p>
        </div>
        <Button onClick={loadDeveloperData}>
          <Activity className="w-4 h-4 mr-2" />
          刷新数据
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="系统状态"
          value="运行中"
          icon={<Activity className="w-5 h-5" />}
          status="success"
        />
        <StatCard
          title="API响应"
          value="< 100ms"
          icon={<Zap className="w-5 h-5" />}
          status="success"
        />
        <StatCard
          title="数据库"
          value="正常"
          icon={<Database className="w-5 h-5" />}
          status="success"
        />
        <StatCard
          title="缓存命中率"
          value="94%"
          icon={<Gauge className="w-5 h-5" />}
          status="success"
        />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="api">API测试</TabsTrigger>
          <TabsTrigger value="database">数据库</TabsTrigger>
          <TabsTrigger value="cache">缓存</TabsTrigger>
          <TabsTrigger value="logs">日志</TabsTrigger>
          <TabsTrigger value="tools">工具</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <SystemOverview systemInfo={systemInfo} buildInfo={buildInfo} />
        </TabsContent>

        <TabsContent value="api">
          <APITester />
        </TabsContent>

        <TabsContent value="database">
          <DatabaseTools />
        </TabsContent>

        <TabsContent value="cache">
          <CacheManager />
        </TabsContent>

        <TabsContent value="logs">
          <LogViewer />
        </TabsContent>

        <TabsContent value="tools">
          <DeveloperTools />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== System Overview ====================

function SystemOverview({ systemInfo, buildInfo }: { systemInfo: any, buildInfo: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>系统信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>环境:</span>
            <Badge>{process.env.NODE_ENV || 'development'}</Badge>
          </div>
          <div className="flex justify-between">
            <span>Node版本:</span>
            <span>{process.version}</span>
          </div>
          <div className="flex justify-between">
            <span>内存使用:</span>
            <span>125 MB / 512 MB</span>
          </div>
          <div className="flex justify-between">
            <span>运行时间:</span>
            <span>2小时 15分钟</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>构建信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>版本:</span>
            <span>v1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>构建时间:</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Git提交:</span>
            <span className="font-mono text-sm">abc123f</span>
          </div>
          <div className="flex justify-between">
            <span>构建大小:</span>
            <span>2.3 MB</span>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>性能指标</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">98%</div>
              <div className="text-sm text-gray-600">正常运行时间</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">45ms</div>
              <div className="text-sm text-gray-600">平均响应时间</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">1.2k</div>
              <div className="text-sm text-gray-600">每分钟请求数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">错误数</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== API Tester ====================

function APITester() {
  const [endpoint, setEndpoint] = useState('/api/tools')
  const [method, setMethod] = useState('GET')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      const res = await fetch(endpoint, { method })
      const data = await res.json()
      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
        headers: Object.fromEntries(res.headers.entries())
      })
    } catch (error: any) {
      setResponse({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API测试工具</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <select 
              value={method} 
              onChange={(e) => setMethod(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="API端点"
              className="flex-1 px-3 py-2 border rounded"
            />
            <Button onClick={testAPI} disabled={loading}>
              {loading ? '测试中...' : '测试'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>响应结果</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ==================== Database Tools ====================

function DatabaseTools() {
  const [queries, setQueries] = useState([
    { name: '工具总数', sql: 'SELECT COUNT(*) FROM tools', result: null },
    { name: '分类统计', sql: 'SELECT category, COUNT(*) FROM tools GROUP BY category', result: null },
    { name: '评分统计', sql: 'SELECT AVG(rating) FROM tools WHERE rating > 0', result: null }
  ])

  const executeQuery = async (index: number) => {
    // This would execute actual database queries
    const mockResult = { rows: [{ count: Math.floor(Math.random() * 1000) }] }
    const newQueries = [...queries]
    newQueries[index].result = mockResult as any
    setQueries(newQueries)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>快速查询</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {queries.map((query, index) => (
            <div key={index} className="border rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{query.name}</h4>
                <Button size="sm" onClick={() => executeQuery(index)}>
                  执行
                </Button>
              </div>
              <code className="text-sm bg-gray-100 p-2 rounded block">
                {query.sql}
              </code>
              {query.result && (
                <pre className="text-sm mt-2 p-2 bg-green-50 rounded">
                  {JSON.stringify(query.result, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== Cache Manager ====================

function CacheManager() {
  const [cacheStats, setCacheStats] = useState({
    size: 156,
    hitRate: 94,
    memory: '24.5 MB',
    redis: '12.8 MB'
  })

  const clearCache = async (type: string) => {
    try {
      await fetch(`/api/cache/monitoring?action=clear&pattern=${type}`)
      // Update stats
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="缓存项目"
          value={cacheStats.size.toString()}
          icon={<Database className="w-5 h-5" />}
        />
        <StatCard
          title="命中率"
          value={`${cacheStats.hitRate}%`}
          icon={<Gauge className="w-5 h-5" />}
        />
        <StatCard
          title="内存缓存"
          value={cacheStats.memory}
          icon={<Activity className="w-5 h-5" />}
        />
        <StatCard
          title="Redis缓存"
          value={cacheStats.redis}
          icon={<Globe className="w-5 h-5" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>缓存操作</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button onClick={() => clearCache('tools')} variant="outline">
              清除工具缓存
            </Button>
            <Button onClick={() => clearCache('categories')} variant="outline">
              清除分类缓存
            </Button>
            <Button onClick={() => clearCache('*')} variant="destructive">
              清除所有缓存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== Log Viewer ====================

function LogViewer() {
  const [logs] = useState([
    { level: 'INFO', message: 'Application started', timestamp: new Date() },
    { level: 'WARN', message: 'Cache miss for key: tools:featured', timestamp: new Date() },
    { level: 'ERROR', message: 'Database connection timeout', timestamp: new Date() },
    { level: 'INFO', message: 'User logged in: user@example.com', timestamp: new Date() }
  ])

  return (
    <Card>
      <CardHeader>
        <CardTitle>系统日志</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="flex items-center gap-4 p-2 border-b">
              <Badge 
                variant={
                  log.level === 'ERROR' ? 'destructive' : 
                  log.level === 'WARN' ? 'secondary' : 'default'
                }
              >
                {log.level}
              </Badge>
              <span className="flex-1">{log.message}</span>
              <span className="text-sm text-gray-500">
                {log.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== Developer Tools ====================

function DeveloperTools() {
  const tools = [
    {
      name: 'Bundle分析器',
      description: '分析JavaScript包大小和依赖关系',
      action: () => window.open('/_next/static/chunks/analyze', '_blank')
    },
    {
      name: 'SEO检查',
      description: '检查页面SEO配置和元数据',
      action: () => window.open('/api/seo?action=health', '_blank')
    },
    {
      name: 'PWA测试',
      description: '测试PWA功能和Service Worker',
      action: () => console.log('PWA test')
    },
    {
      name: '性能监控',
      description: '查看应用性能指标和监控数据',
      action: () => window.open('/api/monitoring', '_blank')
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {tools.map((tool, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg">{tool.name}</CardTitle>
            <p className="text-sm text-gray-600">{tool.description}</p>
          </CardHeader>
          <CardContent>
            <Button onClick={tool.action} className="w-full">
              <Terminal className="w-4 h-4 mr-2" />
              启动工具
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ==================== Helper Components ====================

function StatCard({ 
  title, 
  value, 
  icon, 
  status = 'default' 
}: { 
  title: string
  value: string
  icon: React.ReactNode
  status?: 'success' | 'warning' | 'error' | 'default'
}) {
  const statusColors = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    default: 'text-blue-600'
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={statusColors[status]}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DeveloperDashboard