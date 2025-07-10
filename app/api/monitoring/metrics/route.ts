import { NextResponse } from 'next/server'

// 模拟获取 Web Vitals 数据
async function getWebVitalsMetrics() {
  return [
    {
      name: 'Largest Contentful Paint',
      value: '2.1',
      unit: 's',
      status: 'good',
      trend: 'stable'
    },
    {
      name: 'First Input Delay',
      value: '89',
      unit: 'ms',
      status: 'good',
      trend: 'down'
    },
    {
      name: 'Cumulative Layout Shift',
      value: '0.08',
      unit: '',
      status: 'good',
      trend: 'stable'
    },
    {
      name: 'First Contentful Paint',
      value: '1.2',
      unit: 's',
      status: 'good',
      trend: 'up'
    },
    {
      name: 'Time to Interactive',
      value: '2.8',
      unit: 's',
      status: 'warning',
      trend: 'stable'
    },
    {
      name: 'Total Blocking Time',
      value: '145',
      unit: 'ms',
      status: 'warning',
      trend: 'up'
    }
  ]
}

// 获取数据库性能指标
async function getDatabaseMetrics() {
  // 模拟数据库指标
  return [
    {
      name: '数据库连接',
      value: '正常',
      unit: '',
      status: 'good',
      trend: 'stable'
    },
    {
      name: '响应时间',
      value: '45',
      unit: 'ms',
      status: 'good',
      trend: 'down'
    },
    {
      name: '活跃连接数',
      value: '5',
      unit: '',
      status: 'good',
      trend: 'stable'
    },
    {
      name: '缓存命中率',
      value: '95',
      unit: '%',
      status: 'good',
      trend: 'stable'
    },
    {
      name: '慢查询数量',
      value: '2',
      unit: '',
      status: 'warning',
      trend: 'stable'
    },
    {
      name: '索引使用率',
      value: '89',
      unit: '%',
      status: 'good',
      trend: 'up'
    }
  ]
}

// 获取服务器性能指标
async function getServerMetrics() {
  // 模拟服务器指标
  return [
    {
      name: 'CPU 使用率',
      value: '23',
      unit: '%',
      status: 'good',
      trend: 'stable'
    },
    {
      name: '内存使用率',
      value: '67',
      unit: '%',
      status: 'good',
      trend: 'up'
    },
    {
      name: '磁盘使用率',
      value: '34',
      unit: '%',
      status: 'good',
      trend: 'stable'
    },
    {
      name: '网络吞吐量',
      value: '125',
      unit: 'MB/s',
      status: 'good',
      trend: 'stable'
    },
    {
      name: '响应时间',
      value: '245',
      unit: 'ms',
      status: 'good',
      trend: 'down'
    },
    {
      name: '错误率',
      value: '0.2',
      unit: '%',
      status: 'good',
      trend: 'stable'
    }
  ]
}

// 获取业务指标
async function getBusinessMetrics() {
  // 模拟业务指标
  return [
    {
      name: '工具总数',
      value: 1250,
      unit: '',
      status: 'good',
      trend: 'up'
    },
    {
      name: '注册用户',
      value: 3420,
      unit: '',
      status: 'good',
      trend: 'up'
    },
    {
      name: '今日活跃用户',
      value: '234',
      unit: '',
      status: 'good',
      trend: 'up'
    },
    {
      name: '页面浏览量',
      value: '12.5',
      unit: 'K',
      status: 'good',
      trend: 'up'
    },
    {
      name: '转化率',
      value: '3.2',
      unit: '%',
      status: 'good',
      trend: 'stable'
    },
    {
      name: '平均会话时长',
      value: '4.2',
      unit: 'min',
      status: 'good',
      trend: 'up'
    }
  ]
}

export async function GET() {
  try {
    const [webVitals, database, server, business] = await Promise.all([
      getWebVitalsMetrics(),
      getDatabaseMetrics(),
      getServerMetrics(),
      getBusinessMetrics()
    ])

    return NextResponse.json({
      webVitals,
      database,
      server,
      business,
      lastUpdate: new Date().toISOString()
    })
  } catch (error) {
    console.error('Monitoring API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}

// 健康检查接口
export async function POST() {
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      services: {
        api: 'online',
        database: 'online',
        storage: 'online'
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}