/**
 * AI Prompt自动生成器
 * 基于用户需求智能创建高质量Prompt
 */

import { OpenAI } from 'openai'
import { getSupabaseServerClient } from './supabase'

export interface PromptGenerationRequest {
  category: string        // 分类：writing, coding, marketing, business, education, creativity
  purpose: string         // 用途描述
  targetAudience: string  // 目标用户
  industry?: string       // 行业领域
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  language: 'zh' | 'en'
  aiModel: string[]      // 适用的AI模型
  tone?: string          // 语气风格
  outputFormat?: string  // 期望的输出格式
}

export interface GeneratedPrompt {
  id: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  content: string
  category: string
  tags: string[]
  industry: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  aiModels: string[]
  language: string
  estimatedQuality: number  // AI评估的质量分数
  usageExamples: string[]   // 使用示例
  tips: string[]           // 使用技巧
  variations: string[]     // 变体建议
  createdAt: string
}

export class PromptGeneratorService {
  private openai: OpenAI
  private supabase: any

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://ai-navigator.com",
        "X-Title": "AI Navigator - Prompt Generator"
      }
    })
    
    this.supabase = getSupabaseServerClient()
  }

  /**
   * 智能生成Prompt
   */
  async generatePrompt(request: PromptGenerationRequest): Promise<GeneratedPrompt> {
    console.log('🤖 开始生成Prompt...', request)

    try {
      // 1. 生成核心Prompt内容
      const promptContent = await this.generatePromptContent(request)
      
      // 2. 生成标题和描述
      const metadata = await this.generatePromptMetadata(promptContent, request)
      
      // 3. 生成使用示例和技巧
      const examples = await this.generateUsageExamples(promptContent, request)
      
      // 4. 质量评估
      const quality = await this.assessPromptQuality(promptContent, request)
      
      // 5. 生成变体建议
      const variations = await this.generatePromptVariations(promptContent, request)

      const generatedPrompt: GeneratedPrompt = {
        id: `generated_${Date.now()}`,
        title: metadata.title,
        titleEn: metadata.titleEn,
        description: metadata.description,
        descriptionEn: metadata.descriptionEn,
        content: promptContent,
        category: request.category,
        tags: metadata.tags,
        industry: request.industry ? [request.industry] : [],
        difficulty: request.difficulty,
        aiModels: request.aiModel,
        language: request.language,
        estimatedQuality: quality.score,
        usageExamples: examples.examples,
        tips: examples.tips,
        variations: variations,
        createdAt: new Date().toISOString()
      }

      console.log('✅ Prompt生成完成', {
        title: generatedPrompt.title,
        quality: generatedPrompt.estimatedQuality,
        variations: generatedPrompt.variations.length
      })

      return generatedPrompt

    } catch (error) {
      console.error('❌ Prompt生成失败:', error)
      throw error
    }
  }

  /**
   * 生成Prompt核心内容
   */
  private async generatePromptContent(request: PromptGenerationRequest): Promise<string> {
    const systemPrompt = `你是世界顶级的Prompt工程师，专门创造高效、精准的AI提示词。

任务：为用户需求创建一个专业的Prompt模板

用户需求分析：
- 分类：${request.category}
- 用途：${request.purpose}
- 目标用户：${request.targetAudience}
- 行业：${request.industry || '通用'}
- 难度：${request.difficulty}
- 语言：${request.language}
- AI模型：${request.aiModel.join(', ')}
- 语气风格：${request.tone || '专业友好'}
- 输出格式：${request.outputFormat || '结构化'}

请创建一个高质量的Prompt，要求：

1. **角色设定清晰** - 明确AI的专业身份和能力
2. **任务描述具体** - 详细说明要完成的任务
3. **输入格式明确** - 清楚标识用户需要提供的信息
4. **输出要求详细** - 具体说明期望的输出格式和结构
5. **质量控制标准** - 包含评判标准和质量要求
6. **实用性强** - 能直接使用，覆盖常见场景

请使用以下结构：
- 角色设定和专业背景
- 具体任务描述
- 输入参数模板（用[]标记变量）
- 详细的输出要求
- 质量标准和约束条件
- 示例格式（如需要）

生成专业、实用、高效的Prompt内容：`

    const response = await this.openai.chat.completions.create({
      model: "openai/gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `请为以下需求生成Prompt：${request.purpose}` }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    return response.choices[0].message.content || ''
  }

  /**
   * 生成Prompt元数据（标题、描述、标签）
   */
  private async generatePromptMetadata(content: string, request: PromptGenerationRequest) {
    const metadataPrompt = `基于以下Prompt内容，生成合适的标题、描述和标签：

Prompt内容：
${content.substring(0, 800)}

分类：${request.category}
目标用户：${request.targetAudience}
用途：${request.purpose}

请生成：
1. 中文标题（简洁有力，10-20字）
2. 英文标题（对应翻译）
3. 中文描述（突出价值和用途，50-100字）
4. 英文描述（对应翻译）
5. 标签（3-5个相关标签）

返回JSON格式：
{
  "title": "中文标题",
  "titleEn": "English Title",
  "description": "中文描述",
  "descriptionEn": "English Description",
  "tags": ["标签1", "标签2", "标签3"]
}`

    try {
      const response = await this.openai.chat.completions.create({
        model: "openai/gpt-4",
        messages: [{ role: "user", content: metadataPrompt }],
        temperature: 0.5,
        max_tokens: 800
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return result
    } catch (error) {
      console.error('元数据生成失败:', error)
      return {
        title: `${request.category}专业助手`,
        titleEn: `Professional ${request.category} Assistant`,
        description: `专为${request.targetAudience}设计的${request.purpose}解决方案`,
        descriptionEn: `Professional ${request.purpose} solution for ${request.targetAudience}`,
        tags: [request.category, '专业工具', 'AI助手']
      }
    }
  }

  /**
   * 生成使用示例和技巧
   */
  private async generateUsageExamples(content: string, request: PromptGenerationRequest) {
    const examplesPrompt = `基于以下Prompt，生成实用的使用示例和技巧：

Prompt内容：
${content.substring(0, 1000)}

请生成：
1. 3个具体的使用示例（展示如何使用这个Prompt）
2. 5个使用技巧（如何获得更好的结果）

返回JSON格式：
{
  "examples": [
    "示例1：具体场景下的使用方法",
    "示例2：另一个场景的应用",
    "示例3：进阶使用技巧"
  ],
  "tips": [
    "技巧1：如何提高效果",
    "技巧2：常见问题避免",
    "技巧3：个性化调整",
    "技巧4：结果优化",
    "技巧5：高级应用"
  ]
}`

    try {
      const response = await this.openai.chat.completions.create({
        model: "openai/gpt-4",
        messages: [{ role: "user", content: examplesPrompt }],
        temperature: 0.6,
        max_tokens: 1200
      })

      return JSON.parse(response.choices[0].message.content || '{}')
    } catch (error) {
      console.error('示例生成失败:', error)
      return {
        examples: [
          '根据具体需求填入相应参数',
          '调整语气和风格匹配目标用户',
          '结合行业特点进行个性化修改'
        ],
        tips: [
          '提供详细的背景信息能获得更好的结果',
          '使用具体的例子而不是抽象描述',
          '明确指定输出格式和长度要求',
          '多次迭代优化以达到最佳效果',
          '根据反馈调整Prompt参数'
        ]
      }
    }
  }

  /**
   * 评估Prompt质量
   */
  private async assessPromptQuality(content: string, request: PromptGenerationRequest) {
    const qualityPrompt = `作为Prompt工程专家，请评估以下Prompt的质量：

Prompt内容：
${content.substring(0, 1200)}

评估维度：
1. 清晰度（指令是否明确）
2. 完整性（是否包含必要信息）
3. 实用性（是否易于使用）
4. 专业性（是否符合行业标准）
5. 创新性（是否有独特价值）

请给出：
1. 总体质量分数（1-100分）
2. 各维度评分
3. 改进建议

返回JSON格式：
{
  "score": 85,
  "dimensions": {
    "clarity": 90,
    "completeness": 85,
    "usability": 80,
    "professionalism": 90,
    "innovation": 75
  },
  "suggestions": ["改进建议1", "改进建议2"]
}`

    try {
      const response = await this.openai.chat.completions.create({
        model: "openai/gpt-4",
        messages: [{ role: "user", content: qualityPrompt }],
        temperature: 0.3,
        max_tokens: 800
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return result
    } catch (error) {
      console.error('质量评估失败:', error)
      return {
        score: 75,
        dimensions: {
          clarity: 75,
          completeness: 75,
          usability: 75,
          professionalism: 75,
          innovation: 75
        },
        suggestions: ['继续优化Prompt结构', '增加更多使用示例']
      }
    }
  }

  /**
   * 生成Prompt变体
   */
  private async generatePromptVariations(content: string, request: PromptGenerationRequest): Promise<string[]> {
    const variationsPrompt = `基于以下原始Prompt，生成3个有用的变体版本：

原始Prompt：
${content.substring(0, 800)}

请生成：
1. 简化版本（适合初学者）
2. 增强版本（更详细的要求）
3. 专业版本（行业特定）

每个变体都应该保持核心功能，但适合不同的使用场景。

返回JSON数组格式：
[
  "变体1：简化版本的完整内容",
  "变体2：增强版本的完整内容", 
  "变体3：专业版本的完整内容"
]`

    try {
      const response = await this.openai.chat.completions.create({
        model: "openai/gpt-4",
        messages: [{ role: "user", content: variationsPrompt }],
        temperature: 0.7,
        max_tokens: 1500
      })

      return JSON.parse(response.choices[0].message.content || '[]')
    } catch (error) {
      console.error('变体生成失败:', error)
      return [
        '简化版：基础功能版本',
        '增强版：详细要求版本',
        '专业版：行业定制版本'
      ]
    }
  }

  /**
   * 保存生成的Prompt到数据库
   */
  async saveGeneratedPrompt(prompt: GeneratedPrompt, authorId: string): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('generated_prompts')
        .insert([{
          title: prompt.title,
          title_en: prompt.titleEn,
          description: prompt.description,
          description_en: prompt.descriptionEn,
          content: prompt.content,
          category: prompt.category,
          tags: prompt.tags,
          industry: prompt.industry,
          difficulty: prompt.difficulty,
          ai_models: prompt.aiModels,
          language: prompt.language,
          estimated_quality: prompt.estimatedQuality,
          usage_examples: prompt.usageExamples,
          tips: prompt.tips,
          variations: prompt.variations,
          author_id: authorId,
          status: 'draft',
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) {
        console.error('保存Prompt失败:', error)
        throw error
      }

      console.log('✅ Prompt已保存到数据库')
      return data[0].id

    } catch (error) {
      console.error('数据库保存失败:', error)
      throw error
    }
  }

  /**
   * 批量生成多个Prompt
   */
  async batchGeneratePrompts(requests: PromptGenerationRequest[]): Promise<GeneratedPrompt[]> {
    const results: GeneratedPrompt[] = []
    
    for (const request of requests) {
      try {
        const prompt = await this.generatePrompt(request)
        results.push(prompt)
        
        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.error(`批量生成失败 - ${request.purpose}:`, error)
      }
    }
    
    return results
  }

  /**
   * 优化现有Prompt
   */
  async optimizePrompt(originalPrompt: string, optimizationGoals: string[]): Promise<string> {
    const optimizePrompt = `作为Prompt优化专家，请改进以下Prompt：

原始Prompt：
${originalPrompt}

优化目标：
${optimizationGoals.join('\n')}

请提供优化后的版本，确保：
1. 保持原有功能
2. 提升效果和准确性
3. 增强易用性
4. 修复可能的问题

返回优化后的完整Prompt：`

    try {
      const response = await this.openai.chat.completions.create({
        model: "openai/gpt-4",
        messages: [{ role: "user", content: optimizePrompt }],
        temperature: 0.5,
        max_tokens: 2000
      })

      return response.choices[0].message.content || originalPrompt
    } catch (error) {
      console.error('Prompt优化失败:', error)
      return originalPrompt
    }
  }
}