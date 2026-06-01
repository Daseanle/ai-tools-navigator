/**
 * SEO数据同步API端点 - Vercel Cron Job
 */
import { NextRequest, NextResponse } from 'next/server'
import { RealSEOManager } from '../../../../lib/real-seo-manager'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 开始SEO数据同步...')
    
    const seoManager = new RealSEOManager('ai-navigator.com')
    
    // 获取搜索控制台数据
    const searchConsoleData = await seoManager.getSearchConsoleData({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    })
    
    // 追踪关键词排名
    const keywordRankings = await seoManager.trackKeywordRankings([
      'AI工具', 'AI导航', 'ChatGPT工具', 'AI写作工具', 'AI绘画工具',
      '人工智能工具', 'AI助手', 'AI软件', 'AI平台', 'AI应用'
    ])
    
    // 技术SEO分析
    const technicalSEO = await seoManager.analyzeTechnicalSEO()
    
    // 生成SEO报告
    const seoReport = await seoManager.generateSEOReport()
    
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        searchConsole: searchConsoleData,
        keywordCount: keywordRankings.length,
        technicalIssues: technicalSEO?.issues?.length || 0,
        reportGenerated: !!seoReport
      }
    }
    
    console.log('✅ SEO数据同步完成', result.data)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ SEO数据同步失败:', error)
    
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
