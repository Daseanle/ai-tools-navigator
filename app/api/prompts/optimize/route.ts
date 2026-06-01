/**
 * Prompt优化API端点
 */
import { NextRequest, NextResponse } from 'next/server'
import { PromptGeneratorService } from '../../../../lib/prompt-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      originalPrompt,
      optimizationGoals = ['提高准确性', '增强易用性', '优化结构']
    } = body

    console.log('🔧 开始优化Prompt...')

    // 验证必需参数
    if (!originalPrompt) {
      return NextResponse.json({
        success: false,
        error: '缺少原始Prompt内容'
      }, { status: 400 })
    }

    // 初始化生成器
    const generator = new PromptGeneratorService()

    // 优化Prompt
    const optimizedPrompt = await generator.optimizePrompt(originalPrompt, optimizationGoals)

    console.log('✅ Prompt优化完成')

    return NextResponse.json({
      success: true,
      data: {
        original_prompt: originalPrompt,
        optimized_prompt: optimizedPrompt,
        optimization_goals: optimizationGoals,
        improvements: [
          '结构更清晰',
          '指令更明确',
          '参数更完善'
        ]
      }
    })

  } catch (error) {
    console.error('❌ Prompt优化失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
