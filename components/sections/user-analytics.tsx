"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, Heart, Clock, Star, Award, Calendar, Target } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface UserAnalyticsProps {
  userId: string
}

interface AnalyticsData {
  totalFavorites: number
  totalRatings: number
  avgRating: number
  favoriteCategories: Array<{ name: string; count: number; percentage: number }>
  monthlyActivity: Array<{ month: string; favorites: number; ratings: number }>
  topTools: Array<{ name: string; category: string; rating: number }>
  recentActivity: Array<{ type: string; tool: string; date: string }>
}

export default function UserAnalytics({ userId }: UserAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    fetchAnalytics()
  }, [userId, timeRange])

  const fetchAnalytics = async () => {
    try {
      // 获取收藏统计
      const { data: favoritesData } = await supabase
        .from('user_favorites')
        .select(`
          created_at,
          tools (
            name,
            tool_categories (
              category:categories (name)
            )
          )
        `)
        .eq('user_id', userId)

      // 获取评分统计
      const { data: ratingsData } = await supabase
        .from('user_ratings')
        .select('rating, created_at, tools (name)')
        .eq('user_id', userId)

      // 处理数据
      const totalFavorites = favoritesData?.length || 0
      const totalRatings = ratingsData?.length || 0
      const avgRating = ratingsData?.reduce((sum, r) => sum + r.rating, 0) / totalRatings || 0

      // 收藏分类统计
      const categoryStats: Record<string, number> = {}
      favoritesData?.forEach(fav => {
        const categoryName = fav.tools?.tool_categories?.[0]?.category?.name || '其他'
        categoryStats[categoryName] = (categoryStats[categoryName] || 0) + 1
      })

      const favoriteCategories = Object.entries(categoryStats)
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / totalFavorites) * 100) || 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // 月度活动统计
      const monthlyActivity = generateMonthlyActivity(favoritesData, ratingsData)

      // 顶级工具
      const topTools = (ratingsData || [])
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
        .map(r => ({
          name: r.tools?.name || '未知',
          category: '工具',
          rating: r.rating
        }))

      // 最近活动
      const recentActivity = [
        ...(favoritesData || []).map(f => ({
          type: 'favorite',
          tool: f.tools?.name || '未知工具',
          date: f.created_at
        })),
        ...(ratingsData || []).map(r => ({
          type: 'rating',
          tool: r.tools?.name || '未知工具',
          date: r.created_at
        }))
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)

      setAnalytics({
        totalFavorites,
        totalRatings,
        avgRating,
        favoriteCategories,
        monthlyActivity,
        topTools,
        recentActivity
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyActivity = (favorites: any[], ratings: any[]) => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月']
    return months.map(month => ({
      month,
      favorites: Math.floor(Math.random() * 10), // 模拟数据
      ratings: Math.floor(Math.random() * 5)
    }))
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-neutral-800/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-16">
        <BarChart3 className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-white mb-2">暂无分析数据</h3>
        <p className="text-neutral-400">开始使用AI工具来查看您的数据分析</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 时间范围选择 */}
      <div className="flex justify-end">
        <div className="flex bg-neutral-800/50 rounded-xl p-1">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {range === 'week' ? '本周' : range === 'month' ? '本月' : '本年'}
            </button>
          ))}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6"
        >
          <Heart className="w-8 h-8 text-blue-400 mb-4" />
          <div className="text-2xl font-bold text-white mb-1">{analytics.totalFavorites}</div>
          <div className="text-sm text-blue-300">收藏工具</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl p-6"
        >
          <Star className="w-8 h-8 text-green-400 mb-4" />
          <div className="text-2xl font-bold text-white mb-1">{analytics.totalRatings}</div>
          <div className="text-sm text-green-300">评价次数</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-2xl p-6"
        >
          <Award className="w-8 h-8 text-yellow-400 mb-4" />
          <div className="text-2xl font-bold text-white mb-1">{analytics.avgRating.toFixed(1)}</div>
          <div className="text-sm text-yellow-300">平均评分</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-6"
        >
          <TrendingUp className="w-8 h-8 text-purple-400 mb-4" />
          <div className="text-2xl font-bold text-white mb-1">
            {analytics.favoriteCategories.length}
          </div>
          <div className="text-sm text-purple-300">活跃分类</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 收藏分类分布 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-neutral-800/30 border border-neutral-700/50 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-400" />
            收藏分类分布
          </h3>
          <div className="space-y-4">
            {analytics.favoriteCategories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" style={{
                    backgroundColor: `hsl(${200 + index * 30}, 70%, 50%)`
                  }} />
                  <span className="text-neutral-300">{category.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">{category.count}</span>
                  <span className="text-neutral-400 text-sm">({category.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 月度活动趋势 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-neutral-800/30 border border-neutral-700/50 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-400" />
            活动趋势
          </h3>
          <div className="space-y-4">
            {analytics.monthlyActivity.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="text-neutral-300">{month.month}</span>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm text-neutral-400">{month.favorites} 收藏</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm text-neutral-400">{month.ratings} 评价</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 最近活动 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-800/30 border border-neutral-700/50 rounded-2xl p-6 lg:col-span-2"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-purple-400" />
            最近活动
          </h3>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-neutral-700/30 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'favorite' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-neutral-300">
                    {activity.type === 'favorite' ? '收藏了' : '评价了'} {activity.tool}
                  </span>
                </div>
                <span className="text-neutral-500 text-sm">
                  {new Date(activity.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}