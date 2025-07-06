"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Star, Download, Heart, Eye, Tag, Crown, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { promptCategories, samplePrompts, type PromptItem, PromptMarketService } from "@/lib/prompt-market"

export default function PromptMarket() {
  const [prompts, setPrompts] = useState<PromptItem[]>(samplePrompts)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("featured")
  const params = useParams()
  const lang = params.lang as string || 'zh'

  const filterPrompts = () => {
    let filtered = samplePrompts

    // 分类筛选
    if (selectedCategory !== "all") {
      filtered = filtered.filter(prompt => prompt.category.id === selectedCategory)
    }

    // 价格筛选
    if (selectedFilter === "free") {
      filtered = filtered.filter(prompt => prompt.pricing.type === "free")
    } else if (selectedFilter === "paid") {
      filtered = filtered.filter(prompt => prompt.pricing.type === "paid")
    } else if (selectedFilter === "premium") {
      filtered = filtered.filter(prompt => prompt.pricing.type === "premium")
    }

    // 搜索筛选
    if (searchQuery) {
      filtered = filtered.filter(prompt => 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags.some(tag => tag.includes(searchQuery))
      )
    }

    // 排序
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => b.stats.downloads - a.stats.downloads)
        break
      case "rating":
        filtered.sort((a, b) => b.stats.averageRating - a.stats.averageRating)
        break
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "price-low":
        filtered.sort((a, b) => a.pricing.price - b.pricing.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.pricing.price - a.pricing.price)
        break
    }

    setPrompts(filtered)
  }

  useEffect(() => {
    filterPrompts()
  }, [searchQuery, selectedCategory, selectedFilter, sortBy])

  const getPriceTag = (prompt: PromptItem) => {
    if (prompt.pricing.type === "free") {
      return <span className="text-green-400 font-semibold">免费</span>
    } else if (prompt.pricing.type === "premium") {
      return (
        <div className="flex items-center space-x-1">
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 font-semibold">¥{prompt.pricing.price}</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center space-x-2">
          {prompt.pricing.originalPrice && (
            <span className="text-neutral-500 line-through text-sm">¥{prompt.pricing.originalPrice}</span>
          )}
          <span className="text-blue-400 font-semibold">¥{prompt.pricing.price}</span>
        </div>
      )
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Prompt 市场</h1>
        <p className="text-xl text-neutral-400 mb-6">发现、购买、分享优质 AI Prompt</p>
        
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
            {promptCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-800 text-neutral-300 hover:text-white"
                }`}
              >
                {category.icon} {category.name} ({category.promptCount})
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
                      {prompt.category.icon} {prompt.category.name}
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
                  src={prompt.author.avatar || "/placeholder.svg?height=32&width=32"}
                  alt={prompt.author.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="text-white text-sm font-medium">{prompt.author.name}</span>
                    {prompt.author.verified && <Zap className="w-3 h-3 text-blue-400" />}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-neutral-400 text-xs">{prompt.author.rating}</span>
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
                    <span>{prompt.stats.downloads}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>{prompt.stats.averageRating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{prompt.stats.views}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-3 h-3" />
                  <span>{prompt.stats.favorites}</span>
                </div>
              </div>

              {/* 价格和操作 */}
              <div className="flex items-center justify-between">
                <div>{getPriceTag(prompt)}</div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors">
                    <Heart className="w-4 h-4 text-neutral-400 hover:text-red-400 transition-colors" />
                  </button>
                  <Link
                    href={`/${lang}/prompts/${prompt.id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    查看详情
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

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
        <button className="mt-6 px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
          立即加入创作者计划
        </button>
      </div>
    </div>
  )
}