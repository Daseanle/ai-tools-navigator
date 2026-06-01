import { NextRequest, NextResponse } from 'next/server'
import { 
  initializeAutomation, 
  stopAutomation, 
  restartAutomation, 
  getSystemStatus, 
  updateConfig, 
  triggerContentGeneration, 
  triggerToolCrawling, 
  getDetailedStats, 
  healthCheck 
} from '@/lib/automation-init'

// GET - 获取系统状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    switch (action) {
      case 'status':
        return NextResponse.json(getSystemStatus())
        
      case 'stats':
        return NextResponse.json(getDetailedStats())
        
      case 'health':
        const health = await healthCheck()
        return NextResponse.json(health)
        
      default:
        return NextResponse.json(getSystemStatus())
    }
  } catch (error) {
    return NextResponse.json(
      { error: '获取系统状态失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST - 控制系统操作
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, config, ...params } = body
    
    switch (action) {
      case 'start':
        await initializeAutomation(config)
        return NextResponse.json({ success: true, message: '自动化系统启动成功' })
        
      case 'stop':
        await stopAutomation()
        return NextResponse.json({ success: true, message: '自动化系统停止成功' })
        
      case 'restart':
        await restartAutomation(config)
        return NextResponse.json({ success: true, message: '自动化系统重启成功' })
        
      case 'update-config':
        await updateConfig(config)
        return NextResponse.json({ success: true, message: '配置更新成功' })
        
      case 'generate-content':
        const contentResult = await triggerContentGeneration(params)
        return NextResponse.json({ success: true, data: contentResult })
        
      case 'crawl-tools':
        const crawlResult = await triggerToolCrawling(params.sourceId)
        return NextResponse.json({ success: true, data: crawlResult })
        
      default:
        return NextResponse.json(
          { error: '未知操作', action },
          { status: 400 }
        )
    }
  } catch (error) {
    return NextResponse.json(
      { error: '操作失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// PUT - 更新配置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    await updateConfig(body)
    return NextResponse.json({ success: true, message: '配置更新成功' })
  } catch (error) {
    return NextResponse.json(
      { error: '配置更新失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
