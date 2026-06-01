/**
 * 用户行为分析API端点 - Vercel Cron Job
 */
import { NextRequest, NextResponse } from 'next/server'
import { UserBehaviorAnalytics } from '../../../../lib/user-behavior-analytics'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 开始用户行为分析...')
    
    const behaviorAnalytics = new UserBehaviorAnalytics()
    
    // 获取实时指标
    const realtimeMetrics = behaviorAnalytics.getRealTimeMetrics()
    
    // 分析转化漏斗
    const funnelAnalysis = behaviorAnalytics.analyzeFunnel('tool-discovery', {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    })
    
    // 生成热力图数据
    const heatmapData = behaviorAnalytics.generateHeatmapData('/')
    
    // 页面性能分析
    const performanceData = (behaviorAnalytics as any).getPagePerformanceMetrics('/')
    
    // 用户细分分析
    const segmentAnalysis = (behaviorAnalytics as any).analyzeUserSegments({
      period: '7d',
      metrics: ['conversion', 'engagement', 'retention']
    })
    
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        realtime: {
          activeUsers: realtimeMetrics.activeUsers,
          conversionRate: (realtimeMetrics as any).conversionRate || 0,
          bounceRate: realtimeMetrics.bounceRate,
          avgSessionDuration: realtimeMetrics.avgSessionDuration
        },
        funnel: {
          overallConversionRate: funnelAnalysis.overallConversionRate,
          steps: (funnelAnalysis as any).steps?.length || 0
        },
        heatmap: {
          clickDataPoints: heatmapData.clickData.length,
          scrollDataPoints: heatmapData.scrollData.length
        },
        performance: {
          avgLoadTime: performanceData.avgLoadTime,
          performanceScore: performanceData.performanceScore
        },
        segments: {
          totalSegments: segmentAnalysis.segments.length,
          highValueUsers: segmentAnalysis.segments.filter((s: any) => s.value === 'high').length
        }
      }
    }
    
    console.log('✅ 用户行为分析完成', {
      activeUsers: result.data.realtime.activeUsers,
      conversionRate: result.data.realtime.conversionRate,
      segments: result.data.segments.totalSegments
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ 用户行为分析失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}

// NaviGuard-AI Security Audited - 2026-06-01
