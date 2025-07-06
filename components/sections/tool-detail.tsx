"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink, Star, Users, Calendar, Heart, Share2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import type { Tool } from "@/types"
import { useFavorites } from "@/hooks/use-favorites"

interface ToolDetailProps {
  tool: Tool
}

export default function ToolDetail({ tool }: ToolDetailProps) {
  const [imageError, setImageError] = useState(false)
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(tool.id)
  const params = useParams()
  const lang = params.lang as string || 'zh'

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tool.name,
          text: tool.tagline || tool.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("分享失败:", error)
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-3xl overflow-hidden"
      >
        {/* 工具头部 */}
        <div className="p-8 border-b border-neutral-800/50">
          <div className="flex items-start space-x-6">
            {/* Logo */}
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-neutral-800/50 flex-shrink-0">
              {!imageError && tool.logo_url ? (
                <Image
                  src={tool.logo_url || "/placeholder.svg"}
                  alt={`${tool.name} logo`}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold text-2xl">
                  {tool.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* 基本信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{tool.name}</h1>
                  <p className="text-lg text-neutral-300">{tool.tagline}</p>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleFavorite(tool.id).catch(console.error)}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      favorite ? "bg-red-500/20 text-red-400" : "bg-neutral-800/50 text-neutral-400 hover:text-red-400"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorite ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-xl bg-neutral-800/50 text-neutral-400 hover:text-white transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 统计信息 */}
              <div className="flex items-center space-x-6 text-sm text-neutral-400 mb-4">
                {tool.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white font-medium">{tool.rating}</span>
                    <span>({tool.upvotes_count || 0} 评价)</span>
                  </div>
                )}
                {tool.users_count && (
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{tool.users_count.toLocaleString()} 用户</span>
                  </div>
                )}
                {tool.created_at && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>发布于 {new Date(tool.created_at).getFullYear()}</span>
                  </div>
                )}
              </div>

              {/* 分类和标签 */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {tool.category && (
                  <Link
                    href={`/${lang}/categories/${tool.category.slug}`}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium hover:bg-blue-500/30 transition-colors"
                  >
                    {tool.category.name}
                  </Link>
                )}
                {tool.tags?.map((tag) => {
                  if (typeof tag === "string") {
                    return (
                      <span key={tag} className="px-3 py-1 bg-neutral-800/50 text-neutral-300 rounded-full text-sm">
                        {tag}
                      </span>
                    )
                  } else if (tag && typeof tag === "object" && "name" in tag) {
                    return (
                      <span key={tag.slug || tag.name} className="px-3 py-1 bg-neutral-800/50 text-neutral-300 rounded-full text-sm">
                        {tag.name}
                      </span>
                    )
                  }
                  return null
                })}
              </div>

              {/* 访问按钮 */}
              {tool.website_url && (
                <a
                  href={tool.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                >
                  访问工具
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 工具描述 */}
        {tool.description && (
          <div className="p-8">
            <h2 className="text-xl font-semibold text-white mb-4">工具介绍</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">{tool.description}</p>
            </div>
          </div>
        )}

        {/* 定价信息 */}
        {tool.pricing_type && (
          <div className="p-8 border-t border-neutral-800/50">
            <h2 className="text-xl font-semibold text-white mb-4">定价方式</h2>
            <div className="inline-flex items-center px-4 py-2 rounded-xl bg-neutral-800/50">
              <span className="text-neutral-300">
                {tool.pricing_type === "free" && "免费"}
                {tool.pricing_type === "freemium" && "免费增值"}
                {tool.pricing_type === "paid" && "付费"}
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
