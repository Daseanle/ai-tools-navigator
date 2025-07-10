"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  Heart, 
  Star,
  ExternalLink,
  Clock,
  Users,
  Zap
} from 'lucide-react'
import { IntelligentRecommendationEngine, RecommendationResult } from '@/lib/intelligent-recommendation'
import ToolCard from '@/components/ui/tool-card'

interface IntelligentRecommendationsProps {
  userId?: string
  currentPage?: string
  searchQuery?: string
  className?: string
}

export function IntelligentRecommendations({ 
  userId, 
  currentPage, 
  searchQuery,
  className = "" 
}: IntelligentRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([])
  const [loading, setLoading] = useState(true)
  const [engine] = useState(() => new IntelligentRecommendationEngine())

  useEffect(() => {
    loadRecommendations()
  }, [userId, currentPage, searchQuery])

  const loadRecommendations = async () => {
    setLoading(true)
    
    try {
      const context = {
        userId,
        currentTool: currentPage?.includes('/tools/') ? currentPage.split('/').pop() : undefined,
        searchQuery,
        timeContext: {
          isWorkingHours: new Date().getHours() >= 9 && new Date().getHours() <= 18,
          dayOfWeek: new Date().toLocaleDateString('zh-CN', { weekday: 'long' }),
          season: 'winter'
        },
        sessionContext: {
          pagesViewed: [currentPage || '/'],
          timeSpent: 0,
          source: 'direct'
        }
      }

      const results = await engine.generateRecommendations(
        userId || 'anonymous',
        context,
        12
      )
      
      setRecommendations(results)
    } catch (error) {
      console.error('加载推荐失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationIcon = (category: string) => {
    const icons = {
      'trending': TrendingUp,
      'collaborative': Users,
      'content-based': Brain,
      'search-based': Zap,
      'category-based': Star
    }
    return icons[category as keyof typeof icons] || Brain
  }

  const getRecommendationColor = (category: string) => {
    const colors = {
      'trending': 'text-orange-400 bg-orange-500/10',
      'collaborative': 'text-blue-400 bg-blue-500/10',
      'content-based': 'text-purple-400 bg-purple-500/10',
      'search-based': 'text-green-400 bg-green-500/10',
      'category-based': 'text-yellow-400 bg-yellow-500/10'
    }
    return colors[category as keyof typeof colors] || 'text-gray-400 bg-gray-500/10'
  }

  const sampleTools = [
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      description: '强大的AI对话助手，支持文本生成、翻译、编程等多种任务',
      image: '/placeholder.jpg',
      category: 'AI对话',
      pricing: 'freemium',
      rating: 4.8,
      tags: ['AI', '对话', '写作', '编程'],
      featured: true
    },
    {
      id: 'midjourney',
      name: 'Midjourney',
      description: '领先的AI图像生成工具，创作令人惊艳的艺术作品',
      image: '/placeholder.jpg',
      category: 'AI绘画',
      pricing: 'paid',
      rating: 4.9,
      tags: ['AI', '绘画', '设计', '艺术'],
      featured: true
    },
    {
      id: 'claude',
      name: 'Claude',
      description: 'Anthropic开发的AI助手，专注于有用、无害、诚实的对话',
      image: '/placeholder.jpg',
      category: 'AI对话',
      pricing: 'freemium',
      rating: 4.7,
      tags: ['AI', '对话', '分析', '写作'],
      featured: false
    },
    {
      id: 'github-copilot',
      name: 'GitHub Copilot',
      description: 'AI编程助手，帮助开发者更快地编写代码',
      image: '/placeholder.jpg',
      category: 'AI编程',
      pricing: 'paid',
      rating: 4.6,
      tags: ['AI', '编程', '开发', 'VSCode'],
      featured: false
    }
  ]

  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/20">
            <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">智能推荐</h2>
            <p className="text-sm text-neutral-400">正在分析您的偏好...</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 animate-pulse">
              <div className="w-full h-32 bg-neutral-700 rounded-lg mb-4" />
              <div className="h-4 bg-neutral-700 rounded mb-2" />
              <div className="h-3 bg-neutral-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/20">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">智能推荐</h2>
            <p className="text-sm text-neutral-400">基于您的使用偏好和行为分析</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadRecommendations}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors"
        >
          刷新推荐
        </motion.button>
      </div>

      {/* 推荐分类标签 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from(new Set(recommendations.map(r => r.category))).map(category => {
          const Icon = getRecommendationIcon(category)
          const colors = getRecommendationColor(category)
          const count = recommendations.filter(r => r.category === category).length
          
          return (
            <div key={category} className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${colors}`}>
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium capitalize">
                {category === 'trending' && '热门推荐'}
                {category === 'collaborative' && '相似用户'}
                {category === 'content-based' && '兴趣匹配'}
                {category === 'search-based' && '搜索相关'}
                {category === 'category-based' && '分类推荐'}
              </span>
              <span className="text-xs opacity-75">({count})</span>
            </div>
          )
        })}
      </div>

      {/* 推荐工具网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {recommendations.slice(0, 8).map((rec, index) => {
          // 使用示例工具数据
          const sampleTool = sampleTools[index % sampleTools.length]
          const tool = {
            id: (parseInt(rec.toolId) || index).toString(),
            slug: sampleTool.name.toLowerCase().replace(/\s+/g, '-'),
            name: sampleTool.name,
            tagline: sampleTool.description,
            description: sampleTool.description,
            logo_url: sampleTool.image,
            website_url: '#',
            rating: sampleTool.rating,
            rating_count: 0,
            visits: 0,
            users_count: 0,
            upvotes_count: 0,
            pricing_type: sampleTool.pricing as any,
            featured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category_id: '1',
            category: {
              id: '1',
              name: sampleTool.category,
              slug: sampleTool.category.toLowerCase(),
              tools_count: 0,
              featured: false,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            tags: sampleTool.tags.map((tag, i) => ({
              id: i.toString(),
              name: tag,
              slug: tag.toLowerCase()
            }))
          }
          const Icon = getRecommendationIcon(rec.category)
          
          return (
            <motion.div
              key={rec.toolId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <ToolCard 
                tool={tool}
                className="hover:scale-105 transition-transform duration-300"
              />
              
              {/* 推荐标签 */}
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg">
                <Icon className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-purple-400">
                  {Math.round(rec.confidence * 100)}%
                </span>
              </div>
              
              {/* 推荐原因 */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-xs text-neutral-300 space-y-1">
                  {rec.reasons.slice(0, 2).map((reason, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-purple-400 rounded-full" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* 推荐统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">推荐精度</p>
              <p className="text-lg font-semibold text-white">
                {Math.round(recommendations.reduce((acc, r) => acc + r.confidence, 0) / recommendations.length * 100) || 0}%
              </p>
            </div>
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">匹配工具</p>
              <p className="text-lg font-semibold text-white">{recommendations.length}</p>
            </div>
            <Heart className="w-5 h-5 text-red-400" />
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">更新时间</p>
              <p className="text-lg font-semibold text-white">刚刚</p>
            </div>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  )
}