"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Star, Bookmark, ExternalLink, Users, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useFavorites } from "@/hooks/use-favorites"
import { useToast } from "@/hooks/use-toast"
import type { Tool } from "@/types"

interface OptimizedToolCardProps {
  tool: Tool
  compact?: boolean
  className?: string
  showBookmark?: boolean
  priority?: boolean
}

export default function OptimizedToolCard({
  tool,
  compact = false,
  className = "",
  showBookmark = true,
  priority = false,
}: OptimizedToolCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { isFavorite, toggleFavorite } = useFavorites()
  const { toast } = useToast()
  const params = useParams()
  const lang = params.lang as string || 'zh'

  const favorite = isFavorite(tool.id)

  const handleBookmark = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (isLoading) return

      setIsLoading(true)
      try {
        await toggleFavorite(tool.id)
        toast({
          title: favorite ? "已取消收藏" : "已添加收藏",
          description: favorite ? `已从收藏中移除 ${tool.name}` : `已将 ${tool.name} 添加到收藏`,
          duration: 2000,
        })
      } catch (error) {
        toast({
          title: "操作失败",
          description: "请稍后重试",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [tool.id, tool.name, favorite, toggleFavorite, toast, isLoading],
  )

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative card-hover ${className}`}
    >
      <Link
        href={`/${lang}/tools/${tool.slug}`}
        className="block bg-neutral-900/80 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 h-full"
      >
        {/* 收藏按钮 */}
        {showBookmark && (
          <button
            onClick={handleBookmark}
            disabled={isLoading}
            className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 z-10 ${
              favorite
                ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                : "bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700/50 hover:text-yellow-400"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Bookmark
              size={16}
              className={`transition-all duration-300 ${
                favorite ? "fill-current scale-110" : ""
              } ${isLoading ? "animate-pulse" : ""}`}
            />
          </button>
        )}

        <div className="flex items-start gap-4 h-full">
          {/* Logo */}
          <div
            className={`${
              compact ? "w-10 h-10" : "w-14 h-14"
            } bg-neutral-800/50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-300`}
          >
            {!imageError && tool.logo_url ? (
              <Image
                src={tool.logo_url || "/placeholder.svg"}
                alt={`${tool.name} logo`}
                width={compact ? 40 : 56}
                height={compact ? 40 : 56}
                className="object-contain p-2"
                onError={() => setImageError(true)}
                priority={priority}
                loading={priority ? "eager" : "lazy"}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold text-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                {tool.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col h-full">
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white text-lg truncate group-hover:text-blue-400 transition-colors duration-300">
                  {tool.name}
                </h3>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {/* 直接访问工具网站按钮 */}
                  {tool.website_url && (
                    <a
                      href={tool.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors opacity-0 group-hover:opacity-100 duration-200 border border-blue-500/20"
                      title="访问工具网站"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  
                  {tool.rating && (
                    <div className="flex items-center ml-2">
                      <Star size={14} className="text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-sm text-neutral-300 font-medium">{tool.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {tool.tagline && !compact && (
                <p className="text-neutral-400 text-sm leading-relaxed line-clamp-2 mb-3">{tool.tagline}</p>
              )}

              {/* Tags */}
              {tool.tags && tool.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {tool.tags.slice(0, compact ? 2 : 3).map((tag) => (
                    <span
                      key={typeof tag === "string" ? tag : tag.name}
                      className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20 font-medium"
                    >
                      {typeof tag === "string" ? tag : tag.name}
                    </span>
                  ))}
                  {tool.tags.length > (compact ? 2 : 3) && (
                    <span className="px-2 py-1 bg-neutral-800/50 text-neutral-400 text-xs rounded-full border border-neutral-700/50">
                      +{tool.tags.length - (compact ? 2 : 3)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800/50">
              <div className="flex items-center space-x-4 text-sm text-neutral-400">
                {tool.users_count && (
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{tool.users_count.toLocaleString()}</span>
                  </div>
                )}

                {tool.category && (
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span className="truncate max-w-20">{tool.category}</span>
                  </div>
                )}
              </div>

              <div className="text-neutral-400 group-hover:text-blue-400 transition-colors duration-300 text-sm">
                查看详情
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
