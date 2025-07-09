/**
 * 批量Prompt生成API端点
 */
import { NextRequest, NextResponse } from 'next/server'
import { PromptGeneratorService, PromptGenerationRequest } from '../../../../lib/prompt-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      requests = [],
      authorId = 'system'
    } = body

    console.log('🚀 开始批量生成Prompt...', { count: requests.length })

    // 验证请求数组
    if (!Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json({
        success: false,
        error: '请提供有效的生成请求数组'
      }, { status: 400 })
    }

    // 限制批量数量
    if (requests.length > 10) {
      return NextResponse.json({
        success: false,
        error: '批量生成数量不能超过10个'
      }, { status: 400 })
    }

    // 验证每个请求的必需参数
    for (const req of requests) {
      if (!req.category || !req.purpose || !req.targetAudience) {
        return NextResponse.json({
          success: false,
          error: '每个请求都需要包含 category, purpose, targetAudience'
        }, { status: 400 })
      }
    }

    // 初始化生成器
    const generator = new PromptGeneratorService()

    // 批量生成
    const generatedPrompts = await generator.batchGeneratePrompts(requests)

    // 保存到数据库
    const savedPrompts = []
    for (const prompt of generatedPrompts) {
      try {
        const promptId = await generator.saveGeneratedPrompt(prompt, authorId)
        savedPrompts.push({
          id: promptId,
          title: prompt.title,
          quality: prompt.estimatedQuality
        })
      } catch (error) {
        console.error('保存失败:', error)
      }
    }

    console.log('✅ 批量生成完成', {
      requested: requests.length,
      generated: generatedPrompts.length,
      saved: savedPrompts.length
    })

    return NextResponse.json({
      success: true,
      data: {
        total_requested: requests.length,
        total_generated: generatedPrompts.length,
        total_saved: savedPrompts.length,
        prompts: generatedPrompts,
        saved_prompts: savedPrompts,
        statistics: {
          avg_quality: generatedPrompts.reduce((sum, p) => sum + p.estimatedQuality, 0) / generatedPrompts.length,
          categories: [...new Set(generatedPrompts.map(p => p.category))],
          difficulties: [...new Set(generatedPrompts.map(p => p.difficulty))],
          languages: [...new Set(generatedPrompts.map(p => p.language))]
        }
      }
    })

  } catch (error) {
    console.error('❌ 批量生成失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: '请检查OpenRouter API密钥配置和网络连接'
    }, { status: 500 })
  }
}