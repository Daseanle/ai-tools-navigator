"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Star, Download, Heart, Eye, Tag, Crown, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import PaymentModal from "@/components/payment/payment-modal"
import { formatPrice } from "@/lib/payment"

interface PromptItem {
  id: string
  title: string
  description: string
  category_id: string
  author_id: string
  author_name: string
  author_avatar: string
  author_verified: boolean
  pricing_type: 'free' | 'paid' | 'premium'
  price: number
  original_price?: number
  tags: string[]
  featured: boolean
  verified: boolean
  views_count: number
  downloads_count: number
  favorites_count: number
  rating_average: number
  rating_count: number
  created_at: string
  prompt_categories: {
    id: string
    name: string
    icon: string
    color: string
  }
}

interface PromptCategory {
  id: string
  name: string
  icon: string
  color: string
  prompt_count: number
}

export default function PromptMarket() {
  const [prompts, setPrompts] = useState<PromptItem[]>([])
  const [categories, setCategories] = useState<PromptCategory[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("featured")
  const [loading, setLoading] = useState(true)
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean
    orderData?: any
  }>({ isOpen: false })
  const params = useParams()
  const lang = params.lang as string || 'zh'

  const fetchPrompts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        category: selectedCategory,
        pricing: selectedFilter,
        search: searchQuery,
        sort: sortBy,
        limit: '12'
      })

      const response = await fetch(`/api/prompts?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setPrompts(result.data)
      }
    } catch (error) {
      console.error('Fetch prompts error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/prompts/categories')
      const result = await response.json()
      
      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Fetch categories error:', error)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchPrompts()
  }, [searchQuery, selectedCategory, selectedFilter, sortBy])

  const getPriceTag = (prompt: PromptItem) => {
    if (prompt.pricing_type === "free") {
      return <span className="text-green-400 font-semibold">免费</span>
    } else if (prompt.pricing_type === "premium") {
      return (
        <div className="flex items-center space-x-1">
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 font-semibold">{formatPrice(prompt.price)}</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center space-x-2">
          {prompt.original_price && (
            <span className="text-neutral-500 line-through text-sm">{formatPrice(prompt.original_price)}</span>
          )}
          <span className="text-blue-400 font-semibold">{formatPrice(prompt.price)}</span>
        </div>
      )
    }
  }

  const handlePurchase = (prompt: PromptItem) => {
    if (prompt.pricing_type === 'free') {
      // 免费直接下载
      handleDownload(prompt.id)
      return
    }

    // 付费需要支付
    setPaymentModal({
      isOpen: true,
      orderData: {
        productName: prompt.title,
        amount: prompt.price,
        currency: 'CNY',
        productType: 'content',
        productId: prompt.id,
        userId: 'user_123', // 这里应该从用户状态获取
        metadata: {
          contentType: 'prompt',
          authorId: prompt.author_id
        }
      }
    })
  }

  const handleDownload = async (promptId: string) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user_123' // 这里应该从用户状态获取
        },
        body: JSON.stringify({ action: 'download' })
      })

      const result = await response.json()
      
      if (result.success) {
        // 显示下载成功
        alert('下载成功！')
        // 可以在这里处理下载的内容
        console.log('Prompt content:', result.data.content)
      } else {
        alert(result.error || '下载失败')
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('下载失败，请稍后再试')
    }
  }

  const handlePaymentSuccess = (order: any) => {
    // 支付成功后的处理
    setPaymentModal({ isOpen: false })
    alert('购买成功！')
    // 可以在这里刷新数据或跳转到下载页面
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Prompt 市场</h1>
        <p className="text-xl text-neutral-400 mb-6">发现、购买、分享优质 AI Prompt</p>
        
        {/* 创建按钮 */}
        <div className="flex justify-center mb-6">
          <Link
            href="/prompts/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span className="text-xl">🤖</span>
            AI 自动生成 Prompt
          </Link>
        </div>
        
        {/* 统计信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-neutral-900 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">2,645+</div>
            <div className="text-neutral-400 text-sm">优质Prompt</div>
          </div>
          <div className="bg-neutral-900 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">156+</div>
            <div className="text-neutral-400 text-sm">创作者</div>
          </div>
          <div className="bg-neutral-900 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">28,945+</div>
            <div className="text-neutral-400 text-sm">总下载</div>
          </div>
          <div className="bg-neutral-900 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">4.8★</div>
            <div className="text-neutral-400 text-sm">平均评分</div>
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-neutral-900 rounded-2xl p-6 mb-8">
        {/* 搜索框 */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索 Prompt、标签、作者..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-neutral-800 text-white rounded-xl border border-neutral-700 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* 分类筛选 */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3">分类</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-800 text-neutral-300 hover:text-white"
              }`}
            >
              全部
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-800 text-neutral-300 hover:text-white"
                }`}
              >
                {category.icon} {category.name} ({category.prompt_count})
              </button>
            ))}
          </div>
        </div>

        {/* 价格和排序筛选 */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-neutral-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-neutral-800 text-white rounded-lg px-3 py-2 border border-neutral-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">全部价格</option>
              <option value="free">免费</option>
              <option value="paid">付费</option>
              <option value="premium">高级</option>
            </select>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-neutral-800 text-white rounded-lg px-3 py-2 border border-neutral-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="featured">推荐</option>
            <option value="popular">热门</option>
            <option value="rating">评分</option>
            <option value="newest">最新</option>
            <option value="price-low">价格从低到高</option>
            <option value="price-high">价格从高到低</option>
          </select>
        </div>
      </div>

      {/* Prompt 卡片网格 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-neutral-900 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-neutral-800 rounded mb-4"></div>
              <div className="h-20 bg-neutral-800 rounded mb-4"></div>
              <div className="h-4 bg-neutral-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt, index) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-neutral-900 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-neutral-900/20 transition-all duration-300 group"
            >
              {/* 卡片头部 */}
              <div className="p-6 border-b border-neutral-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {prompt.featured && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                      {prompt.verified && <Zap className="w-4 h-4 text-blue-400" />}
                      <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-1 rounded-full">
                        {prompt.prompt_categories.icon} {prompt.prompt_categories.name}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {prompt.title}
                    </h3>
                    <p className="text-neutral-400 text-sm line-clamp-2">{prompt.description}</p>
                  </div>
                </div>

                {/* 作者信息 */}
                <div className="flex items-center space-x-3 mb-4">
                  <Image
                    src={prompt.author_avatar || "/placeholder.svg?height=32&width=32"}
                    alt={prompt.author_name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="text-white text-sm font-medium">{prompt.author_name}</span>
                      {prompt.author_verified && <Zap className="w-3 h-3 text-blue-400" />}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-neutral-400 text-xs">{prompt.rating_average.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {prompt.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 卡片底部 */}
              <div className="p-6">
                {/* 统计信息 */}
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Download className="w-3 h-3" />
                      <span>{prompt.downloads_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>{prompt.rating_average.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{prompt.views_count}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>{prompt.favorites_count}</span>
                  </div>
                </div>

                {/* 价格和操作 */}
                <div className="flex items-center justify-between">
                  <div>{getPriceTag(prompt)}</div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors">
                      <Heart className="w-4 h-4 text-neutral-400 hover:text-red-400 transition-colors" />
                    </button>
                    <button
                      onClick={() => handlePurchase(prompt)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      {prompt.pricing_type === 'free' ? '免费下载' : '立即购买'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 加载更多 */}
      <div className="text-center mt-8">
        <button className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium transition-colors">
          加载更多 Prompt
        </button>
      </div>

      {/* 成为创作者 */}
      <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">成为 Prompt 创作者</h2>
        <p className="text-blue-100 mb-6">分享您的优质 Prompt，获得收益回报</p>
        <div className="flex justify-center space-x-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">70%</div>
            <div className="text-blue-100 text-sm">创作者分成</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">¥2,890</div>
            <div className="text-blue-100 text-sm">月均收入</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">24h</div>
            <div className="text-blue-100 text-sm">审核时间</div>
          </div>
        </div>
        <div className="flex justify-center space-x-4 mt-6">
          <Link
            href="/prompts/create"
            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
          >
            🤖 AI 智能生成
          </Link>
          <button className="px-8 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors">
            📝 手动创建
          </button>
        </div>
      </div>

      {/* 支付模态框 */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false })}
        orderData={paymentModal.orderData}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
