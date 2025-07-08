/**
 * 自动化系统状态API端点
 */
import { NextRequest, NextResponse } from 'next/server'

interface AutomationStatus {
  systemHealth: 'healthy' | 'warning' | 'critical'
  uptime: number
  lastChecked: string
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
  automationLevel: number
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
}

export async function GET(request: NextRequest) {
  try {
    // 模拟从各个自动化系统收集状态数据
    const status: AutomationStatus = {
      systemHealth: Math.random() > 0.1 ? 'healthy' : 'warning',
      uptime: 99.5 + Math.random() * 0.5,
      lastChecked: new Date().toISOString(),
      metrics: {
        seo: {
          keywordsTracked: 150 + Math.floor(Math.random() * 50),
          avgPosition: 3.2 + (Math.random() - 0.5),
          organicTraffic: 45000 + Math.floor(Math.random() * 10000)
        },
        userBehavior: {
          activeUsers: 1200 + Math.floor(Math.random() * 300),
          conversionRate: 3.2 + Math.random() * 0.8,
          sessionDuration: 180 + Math.floor(Math.random() * 60)
        },
        recommendations: {
          accuracy: 85 + Math.random() * 10,
          ctr: 12.5 + Math.random() * 2.5,
          userSatisfaction: 88 + Math.random() * 7
        },
        content: {
          pagesGenerated: 25 + Math.floor(Math.random() * 10),
          contentScore: 82 + Math.random() * 13
        },
        competition: {
          competitorsMonitored: 5,
          changesDetected: Math.floor(Math.random() * 3)
        }
      },
      automationLevel: 92 + Math.random() * 6,
      revenueOptimization: {
        monthlyRevenue: 48000 + Math.floor(Math.random() * 8000),
        growthRate: 18 + Math.random() * 7,
        automatedActions: 156 + Math.floor(Math.random() * 50)
      },
      tasks: {
        scheduled: 8,
        completed: 7 + Math.floor(Math.random() * 2),
        failed: Math.floor(Math.random() * 2),
        running: Math.floor(Math.random() * 3)
      }
    }

    // 计算整体健康度评分
    const healthScore = calculateHealthScore(status)
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        ...status,
        healthScore,
        insights: generateInsights(status),
        nextOptimization: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ 获取自动化状态失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

function calculateHealthScore(status: AutomationStatus): number {
  const weights = {
    systemHealth: 0.3,
    automationLevel: 0.25,
    uptime: 0.2,
    taskSuccess: 0.15,
    revenueGrowth: 0.1
  }

  const healthPoints = status.systemHealth === 'healthy' ? 100 : 
                      status.systemHealth === 'warning' ? 70 : 30

  const taskSuccessRate = status.tasks.scheduled > 0 ? 
    (status.tasks.completed / status.tasks.scheduled) * 100 : 100

  const score = 
    (healthPoints * weights.systemHealth) +
    (status.automationLevel * weights.automationLevel) +
    (status.uptime * weights.uptime) +
    (taskSuccessRate * weights.taskSuccess) +
    (Math.min(status.revenueOptimization.growthRate * 5, 100) * weights.revenueGrowth)

  return Math.round(score)
}

function generateInsights(status: AutomationStatus): string[] {
  const insights: string[] = []

  if (status.automationLevel > 95) {
    insights.push('🎉 系统已达到超高自动化水平！')
  } else if (status.automationLevel > 90) {
    insights.push('🚀 系统自动化水平优秀，接近完全自主运行')
  }

  if (status.revenueOptimization.growthRate > 20) {
    insights.push('📈 收入增长率超预期，自动化策略效果显著')
  }

  if (status.metrics.userBehavior.conversionRate > 3.5) {
    insights.push('🎯 转化率表现优异，推荐系统运行良好')
  }

  if (status.metrics.seo.avgPosition < 3) {
    insights.push('🔍 SEO表现优秀，关键词排名持续提升')
  }

  if (status.tasks.failed > 0) {
    insights.push('⚠️ 部分自动化任务需要关注')
  }

  if (status.metrics.competition.changesDetected > 0) {
    insights.push('👀 检测到竞品变化，系统正在分析响应策略')
  }

  return insights
}

export async function POST(request: NextRequest) {
  return GET(request)
}