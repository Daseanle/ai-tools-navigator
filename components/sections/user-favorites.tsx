"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Heart, Search, Filter, Grid, List, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Tool } from "@/types"
import ToolCard from "@/components/ui/tool-card"

interface UserFavoritesProps {
  userId: string
}

export default function UserFavorites({ userId }: UserFavoritesProps) {
  const [favorites, setFavorites] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchFavorites()
  }, [userId])

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          tool_id,
          created_at,
          tools (
            id,
            name,
            slug,
            tagline,
            description,
            logo_url,
            website_url,
            rating,
            users_count,
            upvotes_count,
            pricing_type,
            created_at,
            updated_at,
            tool_categories (
              category:categories (*)
            ),
            tool_tags (
              tag:tags (*)
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const favoriteTools = data?.map(item => {
        const tool = item.tools as any
        return {
          ...tool,
          category: tool.tool_categories?.[0]?.category,
          tags: tool.tool_tags?.map((tt: any) => tt.tag) || [],
          favorited_at: item.created_at
        }
      }) || []

      setFavorites(favoriteTools)
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (toolId: string) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('tool_id', toolId)

      if (error) throw error

      setFavorites(prev => prev.filter(tool => tool.id !== toolId))
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  const filteredFavorites = favorites.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.tagline.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || tool.category?.slug === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(favorites.map(tool => tool.category?.slug).filter(Boolean)))

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-64 bg-neutral-800/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <Heart className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-white mb-2">还没有收藏的工具</h3>
        <p className="text-neutral-400 mb-6">开始探索并收藏您喜欢的AI工具吧！</p>
        <a
          href="/tools"
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
        >
          开始探索
        </a>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          {/* 搜索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="搜索收藏的工具..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 bg-neutral-800/50 border border-neutral-700 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 分类筛选 */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-neutral-800/50 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">所有分类</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {favorites.find(tool => tool.category?.slug === category)?.category?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* 视图切换 */}
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-neutral-800/50 text-neutral-400 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-neutral-800/50 text-neutral-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
          </button>

          <div className="text-sm text-neutral-400 ml-4">
            共 {filteredFavorites.length} 个收藏
          </div>
        </div>
      </div>

      {/* 工具列表 */}
      {filteredFavorites.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-400">没有找到匹配的工具</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }
        >
          {filteredFavorites.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <ToolCard tool={tool} />
              
              {/* 移除收藏按钮 */}
              <button
                onClick={() => removeFavorite(tool.id)}
                className="absolute top-3 right-3 p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                title="取消收藏"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* 收藏时间 */}
              <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 rounded text-xs text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity">
                收藏于 {new Date((tool as any).favorited_at || tool.created_at || Date.now()).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
