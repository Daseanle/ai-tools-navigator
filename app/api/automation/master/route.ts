/**
 * 自动化系统API路由
 * 提供启动、监控和控制自动化系统的HTTP接口
 */

import { NextRequest, NextResponse } from 'next/server'
import { MasterAutomationController } from '@/lib/master-automation-controller'

let masterController: MasterAutomationController | null = null

// 获取或创建主控制器实例
function getMasterController(): MasterAutomationController {
  if (!masterController) {
    masterController = new MasterAutomationController()
  }
  return masterController
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    const controller = getMasterController()

    switch (action) {
      case 'status':
        return await handleStatusCheck(controller)
      
      case 'health':
        return await handleHealthCheck(controller)
      
      case 'metrics':
        return await handleMetricsRequest(controller)
      
      case 'schedule':
        return await handleScheduleRequest(controller)
      
      default:
        return NextResponse.json({
          error: 'Invalid action',
          availableActions: ['status', 'health', 'metrics', 'schedule']
        }, { status: 400 })
    }

  } catch (error) {
    console.error('自动化API错误:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    const controller = getMasterController()

    switch (action) {
      case 'start':
        return await handleStartAutomation(controller)
      
      case 'stop':
        return await handleStopAutomation(controller)
      
      case 'analyze_user':
        return await handleUserAnalysis(controller, params)
      
      case 'optimize_conversion':
        return await handleConversionOptimization(controller, params)
      
      case 'run_ab_test':
        return await handleABTestCreation(controller, params)
      
      case 'generate_content':
        return await handleContentGeneration(controller, params)
      
      case 'seo_analysis':
        return await handleSEOAnalysis(controller)
      
      case 'emergency_response':
        return await handleEmergencyResponse(controller, params)
      
      default:
        return NextResponse.json({
          error: 'Invalid action',
          availableActions: [
            'start', 'stop', 'analyze_user', 'optimize_conversion',
            'run_ab_test', 'generate_content', 'seo_analysis', 'emergency_response'
          ]
        }, { status: 400 })
    }

  } catch (error) {
    console.error('自动化API POST错误:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 状态检查处理器
async function handleStatusCheck(controller: MasterAutomationController) {
  const status = {
    isRunning: (controller as any).isRunning || false,
    lastHealthCheck: (controller as any).lastHealthCheck,
    activeSchedules: Array.from((controller as any).schedule?.entries() || []).map((entry: unknown) => {
      const [name, schedule] = entry as [string, any]
      return {
        name,
        enabled: (schedule as any).enabled,
        lastRun: (schedule as any).lastRun,
        nextRun: (schedule as any).nextRun,
        priority: (schedule as any).priority
      }
    }),
    systemInfo: {
      nodeVersion: process.version,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    }
  }

  return NextResponse.json(status)
}

// 健康检查处理器
async function handleHealthCheck(controller: MasterAutomationController) {
  try {
    const healthStatus = await controller.performHealthCheck()
    return NextResponse.json({
      status: 'success',
      health: healthStatus,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 指标请求处理器
async function handleMetricsRequest(controller: MasterAutomationController) {
  try {
    const metrics = await controller.generatePerformanceReport()
    return NextResponse.json({
      status: 'success',
      metrics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Metrics collection failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 调度请求处理器
async function handleScheduleRequest(controller: MasterAutomationController) {
  const schedules = Array.from((controller as any).schedule?.entries() || []).map((entry: unknown) => {
    const [name, schedule] = entry as [any, any]
    return {
      taskName: name,
      frequency: (schedule as any).frequency,
      enabled: (schedule as any).enabled,
      lastRun: (schedule as any).lastRun,
      nextRun: (schedule as any).nextRun,
      priority: (schedule as any).priority,
      dependencies: (schedule as any).dependencies
    }
  })

  return NextResponse.json({
    status: 'success',
    schedules,
    totalTasks: schedules.length,
    activeTasks: schedules.filter(s => s.enabled).length
  })
}

// 启动自动化处理器
async function handleStartAutomation(controller: MasterAutomationController) {
  try {
    await controller.startAutomationControl()
    return NextResponse.json({
      status: 'success',
      message: '自动化系统启动成功',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to start automation',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 停止自动化处理器
async function handleStopAutomation(controller: MasterAutomationController) {
  try {
    await controller.stopAutomationControl()
    return NextResponse.json({
      status: 'success',
      message: '自动化系统已停止',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to stop automation',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 用户分析处理器
async function handleUserAnalysis(controller: MasterAutomationController, params: any) {
  const { userId } = params

  if (!userId) {
    return NextResponse.json({
      error: 'userId is required'
    }, { status: 400 })
  }

  try {
    // 获取用户分析器
    const userAnalyzer = (controller as any).userAnalyzer
    
    const [userProfile, recommendations] = await Promise.all([
      userAnalyzer.analyzeUserBehavior(userId),
      userAnalyzer.generatePersonalizedRecommendations(userId)
    ])

    return NextResponse.json({
      status: 'success',
      userId,
      userProfile,
      recommendations: recommendations.slice(0, 5), // 返回前5个推荐
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'User analysis failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 转化优化处理器
async function handleConversionOptimization(controller: MasterAutomationController, params: any) {
  const { userId } = params

  if (!userId) {
    return NextResponse.json({
      error: 'userId is required'
    }, { status: 400 })
  }

  try {
    const abTester = (controller as any).abTester
    const optimizedExperience = await abTester.optimizeConversionsRealTime(userId)

    return NextResponse.json({
      status: 'success',
      userId,
      optimizedExperience,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Conversion optimization failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// A/B测试创建处理器
async function handleABTestCreation(controller: MasterAutomationController, params: any) {
  try {
    const abTester = (controller as any).abTester
    const experiments = await abTester.generateIntelligentExperiments()
    const launchResult = await abTester.executeAutomatedExperiments(experiments.slice(0, 3))

    return NextResponse.json({
      status: 'success',
      experimentsGenerated: experiments.length,
      launchResult,
      experiments: experiments.slice(0, 3).map((exp: any) => ({
        name: exp.name,
        hypothesis: exp.hypothesis,
        variants: exp.variants.length,
        duration: exp.duration
      })),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'A/B test creation failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 内容生成处理器
async function handleContentGeneration(controller: MasterAutomationController, params: any) {
  const { topics = [] } = params

  try {
    const contentSystem = (controller as any).contentSystem
    const result = await contentSystem.generateAndPublishContent(topics)

    return NextResponse.json({
      status: 'success',
      contentGenerated: result.generated,
      contentPublished: result.published,
      content: result.content?.slice(0, 3) || [],
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Content generation failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// SEO分析处理器
async function handleSEOAnalysis(controller: MasterAutomationController) {
  try {
    const seoMonitor = (controller as any).seoMonitor
    const analysis = await seoMonitor.comprehensiveSEOAnalysis()

    return NextResponse.json({
      status: 'success',
      currentMetrics: analysis.currentMetrics,
      opportunities: analysis.opportunities.slice(0, 10),
      competitorGaps: analysis.competitorGaps.slice(0, 5),
      actionPlan: analysis.actionPlan,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'SEO analysis failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 紧急响应处理器
async function handleEmergencyResponse(controller: MasterAutomationController, params: any) {
  const { alertType, details } = params

  if (!alertType) {
    return NextResponse.json({
      error: 'alertType is required'
    }, { status: 400 })
  }

  try {
    await controller.handleEmergency(alertType, details)

    return NextResponse.json({
      status: 'success',
      message: `紧急响应已触发: ${alertType}`,
      alertType,
      details,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Emergency response failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}