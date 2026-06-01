/**
 * Prompt生成API端点
 */
import { NextRequest, NextResponse } from 'next/server'
import { PromptGeneratorService, PromptGenerationRequest } from '../../../../lib/prompt-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      category,
      purpose,
      targetAudience,
      industry,
      difficulty = 'intermediate',
      language = 'zh',
      aiModel = ['ChatGPT', 'Claude'],
      tone,
      outputFormat,
      authorId = 'system'
    } = body

    console.log('🚀 开始生成Prompt...', {
      category,
      purpose,
      targetAudience,
      difficulty
    })

    // 验证必需参数
    if (!category || !purpose || !targetAudience) {
      return NextResponse.json({
        success: false,
        error: '缺少必需参数：category, purpose, targetAudience'
      }, { status: 400 })
    }

    // 创建生成请求
    const generationRequest: PromptGenerationRequest = {
      category,
      purpose,
      targetAudience,
      industry,
      difficulty,
      language,
      aiModel,
      tone,
      outputFormat
    }

    // 初始化生成器
    const generator = new PromptGeneratorService()

    // 生成Prompt
    const generatedPrompt = await generator.generatePrompt(generationRequest)

    // 保存到数据库
    const promptId = await generator.saveGeneratedPrompt(generatedPrompt, authorId)

    console.log('✅ Prompt生成完成', {
      id: promptId,
      title: generatedPrompt.title,
      quality: generatedPrompt.estimatedQuality
    })

    return NextResponse.json({
      success: true,
      data: {
        id: promptId,
        prompt: generatedPrompt,
        generation_info: {
          category: generationRequest.category,
          difficulty: generationRequest.difficulty,
          language: generationRequest.language,
          ai_models: generationRequest.aiModel,
          quality_score: generatedPrompt.estimatedQuality,
          variations_count: generatedPrompt.variations.length,
          examples_count: generatedPrompt.usageExamples.length
        }
      }
    })

  } catch (error) {
    console.error('❌ Prompt生成失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: '请检查OpenRouter API密钥配置和网络连接'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    if (action === 'categories') {
      // 返回可用的分类
      return NextResponse.json({
        success: true,
        data: {
          categories: [
            { id: 'writing', name: '写作助手', nameEn: 'Writing', description: '文章、文案、创意写作等' },
            { id: 'coding', name: '编程开发', nameEn: 'Coding', description: '代码生成、调试、优化等' },
            { id: 'marketing', name: '营销推广', nameEn: 'Marketing', description: '广告文案、社媒营销等' },
            { id: 'business', name: '商业分析', nameEn: 'Business', description: '商业计划、市场分析等' },
            { id: 'education', name: '教育培训', nameEn: 'Education', description: '教学设计、课程开发等' },
            { id: 'creativity', name: '创意设计', nameEn: 'Creativity', description: '创意构思、设计理念等' }
          ],
          difficulties: [
            { id: 'beginner', name: '初级', description: '简单易用，适合新手' },
            { id: 'intermediate', name: '中级', description: '功能丰富，适合日常使用' },
            { id: 'advanced', name: '高级', description: '专业复杂，适合专家使用' }
          ],
          ai_models: [
            'ChatGPT', 'GPT-4', 'Claude', 'Gemini', 'PaLM', 'LLaMA', 'Mistral'
          ],
          languages: [
            { id: 'zh', name: '中文' },
            { id: 'en', name: 'English' }
          ]
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: '无效的操作参数'
    }, { status: 400 })

  } catch (error) {
    console.error('❌ 获取配置失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
