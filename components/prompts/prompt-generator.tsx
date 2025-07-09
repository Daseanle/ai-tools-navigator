/**
 * Prompt生成器界面组件
 */
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PromptGeneratorFormData {
  category: string
  purpose: string
  targetAudience: string
  industry: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  language: 'zh' | 'en'
  aiModel: string[]
  tone: string
  outputFormat: string
}

interface GeneratedPrompt {
  id: string
  title: string
  description: string
  content: string
  estimatedQuality: number
  usageExamples: string[]
  tips: string[]
  variations: string[]
}

export default function PromptGeneratorInterface() {
  const [formData, setFormData] = useState<PromptGeneratorFormData>({
    category: 'writing',
    purpose: '',
    targetAudience: '',
    industry: '',
    difficulty: 'intermediate',
    language: 'zh',
    aiModel: ['ChatGPT'],
    tone: '专业友好',
    outputFormat: '结构化'
  })

  const [categories, setCategories] = useState<any[]>([])
  const [difficulties, setDifficulties] = useState<any[]>([])
  const [aiModels, setAiModels] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 加载配置数据
  useEffect(() => {
    loadConfiguration()
  }, [])

  const loadConfiguration = async () => {
    try {
      const response = await fetch('/api/prompts/generate?action=categories')
      const result = await response.json()
      
      if (result.success) {
        setCategories(result.data.categories)
        setDifficulties(result.data.difficulties)
        setAiModels(result.data.ai_models)
      }
    } catch (error) {
      console.error('加载配置失败:', error)
    }
  }

  const generatePrompt = async () => {
    if (!formData.purpose || !formData.targetAudience) {
      showNotification('请填写用途和目标用户', 'error')
      return
    }

    setIsGenerating(true)
    setGeneratedPrompt(null)

    try {
      const response = await fetch('/api/prompts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setGeneratedPrompt(result.data.prompt)
        showNotification('🎉 Prompt生成成功！', 'success')
      } else {
        showNotification(`生成失败：${result.error}`, 'error')
      }
    } catch (error) {
      console.error('生成失败:', error)
      showNotification('网络错误，请稍后重试', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const optimizePrompt = async (originalPrompt: string) => {
    try {
      const response = await fetch('/api/prompts/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          originalPrompt,
          optimizationGoals: ['提高准确性', '增强易用性', '优化结构']
        })
      })

      const result = await response.json()

      if (result.success) {
        setGeneratedPrompt(prev => prev ? {
          ...prev,
          content: result.data.optimized_prompt
        } : null)
        showNotification('🔧 Prompt优化完成！', 'success')
      } else {
        showNotification(`优化失败：${result.error}`, 'error')
      }
    } catch (error) {
      console.error('优化失败:', error)
      showNotification('优化失败，请稍后重试', 'error')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showNotification('📋 已复制到剪贴板', 'success')
  }

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`
    notification.textContent = message
    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove()
      }
    }, 3000)
  }

  const handleAiModelChange = (model: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      aiModel: checked 
        ? [...prev.aiModel, model]
        : prev.aiModel.filter(m => m !== model)
    }))
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🤖 AI Prompt 生成器
        </h1>
        <p className="text-gray-600 mt-2">智能创建高质量的AI提示词模板</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：生成表单 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                Prompt 配置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 基础配置 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">分类</label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">难度级别</label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  >
                    {difficulties.map(diff => (
                      <option key={diff.id} value={diff.id}>{diff.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 核心需求 */}
              <div>
                <label className="block text-sm font-medium mb-2">用途描述 *</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                  placeholder="请描述你希望这个Prompt能帮助你完成什么任务..."
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">目标用户 *</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例如：营销人员、程序员、学生、创业者..."
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                />
              </div>

              {/* 高级选项 */}
              <div>
                <button
                  type="button"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <span>{showAdvanced ? '▼' : '▶'}</span>
                  高级选项
                </button>
              </div>

              {showAdvanced && (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">行业领域</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例如：电商、教育、金融、科技..."
                        value={formData.industry}
                        onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">语气风格</label>
                      <select 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.tone}
                        onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
                      >
                        <option value="专业友好">专业友好</option>
                        <option value="正式严谨">正式严谨</option>
                        <option value="轻松活泼">轻松活泼</option>
                        <option value="温暖亲切">温暖亲切</option>
                        <option value="创新前沿">创新前沿</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">支持的AI模型</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {aiModels.map(model => (
                        <label key={model} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.aiModel.includes(model)}
                            onChange={(e) => handleAiModelChange(model, e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">{model}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">输出格式</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="例如：结构化、列表式、对话式、报告式..."
                      value={formData.outputFormat}
                      onChange={(e) => setFormData(prev => ({ ...prev, outputFormat: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* 生成按钮 */}
              <button
                onClick={generatePrompt}
                disabled={isGenerating || !formData.purpose || !formData.targetAudience}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    AI正在生成中...
                  </span>
                ) : (
                  '🚀 生成 Prompt'
                )}
              </button>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：生成结果 */}
        <div className="space-y-6">
          {generatedPrompt && (
            <>
              {/* 基本信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    生成结果
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{generatedPrompt.title}</h3>
                    <p className="text-gray-600 text-sm">{generatedPrompt.description}</p>
                  </div>

                  <div className="flex items-center gap-4 py-3 px-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{generatedPrompt.estimatedQuality}</div>
                      <div className="text-xs text-gray-600">质量评分</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{generatedPrompt.variations.length}</div>
                      <div className="text-xs text-gray-600">变体数量</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{generatedPrompt.usageExamples.length}</div>
                      <div className="text-xs text-gray-600">使用示例</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(generatedPrompt.content)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      📋 复制
                    </button>
                    <button
                      onClick={() => optimizePrompt(generatedPrompt.content)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      🔧 优化
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Prompt内容 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📝</span>
                    Prompt 内容
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg border max-h-80 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">{generatedPrompt.content}</pre>
                  </div>
                </CardContent>
              </Card>

              {/* 使用技巧 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    使用技巧
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {generatedPrompt.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                        <span className="text-yellow-600 font-bold text-sm">{index + 1}.</span>
                        <span className="text-sm text-gray-700">{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!generatedPrompt && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-lg font-semibold mb-2">等待生成</h3>
                <p className="text-gray-600 text-sm">填写左侧表单，点击生成按钮即可创建专业的Prompt</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}