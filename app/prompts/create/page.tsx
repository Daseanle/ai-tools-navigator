/**
 * Prompt创建页面
 */
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PromptGeneratorInterface from '@/components/prompts/prompt-generator'

export default function PromptCreatePage() {
  const [activeTab, setActiveTab] = useState<'generator' | 'batch' | 'optimizer'>('generator')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🚀 Prompt 创作中心
          </h1>
          <p className="text-gray-600 mt-2">智能创建、优化和管理你的AI提示词</p>
        </div>

        {/* 功能导航 */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-2 shadow-sm border">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('generator')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'generator' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">🤖</span>
                智能生成
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'batch' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">📦</span>
                批量创建
              </button>
              <button
                onClick={() => setActiveTab('optimizer')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'optimizer' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">🔧</span>
                优化器
              </button>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        {activeTab === 'generator' && <PromptGeneratorInterface />}
        
        {activeTab === 'batch' && <BatchGeneratorInterface />}
        
        {activeTab === 'optimizer' && <PromptOptimizerInterface />}
      </div>
    </div>
  )
}

// 批量生成界面
function BatchGeneratorInterface() {
  const [batchRequests, setBatchRequests] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<any>(null)

  const addBatchRequest = () => {
    setBatchRequests(prev => [...prev, {
      id: Date.now(),
      category: 'writing',
      purpose: '',
      targetAudience: '',
      difficulty: 'intermediate'
    }])
  }

  const removeBatchRequest = (id: number) => {
    setBatchRequests(prev => prev.filter(req => req.id !== id))
  }

  const updateBatchRequest = (id: number, field: string, value: string) => {
    setBatchRequests(prev => prev.map(req => 
      req.id === id ? { ...req, [field]: value } : req
    ))
  }

  const generateBatch = async () => {
    if (batchRequests.length === 0) {
      showNotification('请添加至少一个生成请求', 'error')
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/prompts/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: batchRequests.map(req => ({
            category: req.category,
            purpose: req.purpose,
            targetAudience: req.targetAudience,
            difficulty: req.difficulty
          }))
        })
      })

      const result = await response.json()

      if (result.success) {
        setResults(result.data)
        showNotification('🎉 批量生成完成！', 'success')
      } else {
        showNotification(`生成失败：${result.error}`, 'error')
      }
    } catch (error) {
      console.error('批量生成失败:', error)
      showNotification('网络错误，请稍后重试', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const showNotification = (message: string, type: 'success' | 'error') => {
    // 简单的通知实现
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            批量生成配置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {batchRequests.map((request, index) => (
              <div key={request.id} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">请求 #{index + 1}</h4>
                  <button
                    onClick={() => removeBatchRequest(request.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">分类</label>
                    <select
                      value={request.category}
                      onChange={(e) => updateBatchRequest(request.id, 'category', e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="writing">写作助手</option>
                      <option value="coding">编程开发</option>
                      <option value="marketing">营销推广</option>
                      <option value="business">商业分析</option>
                      <option value="education">教育培训</option>
                      <option value="creativity">创意设计</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">难度</label>
                    <select
                      value={request.difficulty}
                      onChange={(e) => updateBatchRequest(request.id, 'difficulty', e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">初级</option>
                      <option value="intermediate">中级</option>
                      <option value="advanced">高级</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-1">用途</label>
                  <input
                    type="text"
                    value={request.purpose}
                    onChange={(e) => updateBatchRequest(request.id, 'purpose', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="描述这个Prompt的用途..."
                  />
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-1">目标用户</label>
                  <input
                    type="text"
                    value={request.targetAudience}
                    onChange={(e) => updateBatchRequest(request.id, 'targetAudience', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="目标用户群体..."
                  />
                </div>
              </div>
            ))}
            
            <div className="flex gap-3">
              <button
                onClick={addBatchRequest}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ➕ 添加请求
              </button>
              
              <button
                onClick={generateBatch}
                disabled={isGenerating || batchRequests.length === 0}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? '生成中...' : '🚀 批量生成'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              生成结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{results.total_generated}</div>
                <div className="text-sm text-gray-600">成功生成</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{Math.round(results.statistics.avg_quality)}</div>
                <div className="text-sm text-gray-600">平均质量</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{results.statistics.categories.length}</div>
                <div className="text-sm text-gray-600">涉及分类</div>
              </div>
            </div>
            
            <div className="space-y-4">
              {results.prompts.map((prompt: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{prompt.title}</h4>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{prompt.estimatedQuality}分</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{prompt.description}</p>
                  <div className="bg-white p-3 rounded border max-h-32 overflow-y-auto">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap">{prompt.content.substring(0, 300)}...</pre>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Prompt优化器界面
function PromptOptimizerInterface() {
  const [originalPrompt, setOriginalPrompt] = useState('')
  const [optimizedPrompt, setOptimizedPrompt] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)

  const optimizePrompt = async () => {
    if (!originalPrompt.trim()) {
      showNotification('请输入要优化的Prompt', 'error')
      return
    }

    setIsOptimizing(true)
    
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
        setOptimizedPrompt(result.data.optimized_prompt)
        showNotification('🔧 优化完成！', 'success')
      } else {
        showNotification(`优化失败：${result.error}`, 'error')
      }
    } catch (error) {
      console.error('优化失败:', error)
      showNotification('网络错误，请稍后重试', 'error')
    } finally {
      setIsOptimizing(false)
    }
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🔧</span>
            Prompt 优化器
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">原始 Prompt</label>
              <textarea
                value={originalPrompt}
                onChange={(e) => setOriginalPrompt(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-40 resize-none"
                placeholder="请输入你想要优化的Prompt..."
              />
            </div>
            
            <button
              onClick={optimizePrompt}
              disabled={isOptimizing || !originalPrompt.trim()}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isOptimizing ? '优化中...' : '🚀 开始优化'}
            </button>
          </div>
        </CardContent>
      </Card>

      {optimizedPrompt && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              优化结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <pre className="whitespace-pre-wrap text-sm text-gray-800">{optimizedPrompt}</pre>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(optimizedPrompt)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📋 复制优化结果
                </button>
                <button
                  onClick={() => setOriginalPrompt(optimizedPrompt)}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  🔄 继续优化
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}