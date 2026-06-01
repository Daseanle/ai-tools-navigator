/**
 * 100%自动化内容生产API端点
 * 集成OpenAI GPT-4、自动发布、SEO优化等功能
 */
import { NextRequest, NextResponse } from 'next/server'
import { FullyAutomatedContentSystem } from '../../../../lib/fully-automated-content-system'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 开始100%自动化内容生产...')
    
    // 初始化完全自动化内容系统
    const contentSystem = new FullyAutomatedContentSystem({
      maxArticlesPerDay: 5,
      minWordCount: 1500,
      maxWordCount: 3000,
      includeImages: true,
      autoPublish: true,
      seoOptimization: true
    })
    
    // 获取查询参数
    const url = new URL(request.url)
    const topicsParam = url.searchParams.get('topics')
    const topics = topicsParam ? JSON.parse(topicsParam) : []
    
    // 执行完全自动化内容生产
    const result = await contentSystem.generateAndPublishContent(topics)
    
    // 返回结果
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      automation_level: '100%',
      data: {
        total_generated: result.generated,
        total_published: result.published,
        automation_features: [
          '✅ 智能主题发现',
          '✅ 关键词自动研究',
          '✅ GPT-4内容生成',
          '✅ SEO自动优化',
          '✅ AI图片生成',
          '✅ 自动数据库发布',
          '✅ 搜索引擎提交',
          '✅ 内链自动建设',
          '✅ 社交媒体推广'
        ],
        generated_content: result.content,
        performance_metrics: {
          avg_seo_score: result.content.reduce((sum, c) => sum + c.seoScore, 0) / result.content.length,
          avg_reading_time: result.content.reduce((sum, c) => sum + c.readingTime, 0) / result.content.length,
          total_keywords: result.content.reduce((sum, c) => sum + ((c as any).keywords?.length || 0), 0)
        }
      }
    }
    
    console.log('✅ 100%自动化内容生产完成', {
      generated: result.generated,
      published: result.published,
      automation_level: '100%'
    })
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ 100%自动化内容生产失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      automation_level: '0%'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topics, config } = body
    
    console.log('🚀 开始自定义100%自动化内容生产...')
    
    // 初始化完全自动化内容系统
    const contentSystem = new FullyAutomatedContentSystem({
      maxArticlesPerDay: config?.maxArticlesPerDay || 3,
      minWordCount: config?.minWordCount || 1500,
      maxWordCount: config?.maxWordCount || 3000,
      includeImages: config?.includeImages !== false,
      autoPublish: config?.autoPublish !== false,
      seoOptimization: config?.seoOptimization !== false
    })
    
    // 执行自定义自动化内容生产
    const result = await contentSystem.generateAndPublishContent(topics)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      automation_level: '100%',
      data: {
        generated: result.generated,
        published: result.published,
        content: result.content,
        config: config
      }
    })
    
  } catch (error) {
    console.error('❌ 自定义100%自动化内容生产失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
