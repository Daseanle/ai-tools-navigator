"use client"

import React, { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Star, Bookmark, ExternalLink, Users, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useFavorites } from "@/hooks/use-favorites"
import { useToast } from "@/hooks/use-toast"
import type { Tool } from "@/types"

interface UnifiedToolCardProps {
  tool: Tool
  compact?: boolean
  className?: string
  showBookmark?: boolean
  priority?: boolean
  variant?: 'default' | 'optimized'
}

function UnifiedToolCard({
  tool,
  compact = false,
  className = "",
  showBookmark = true,
  priority = false,
  variant = 'default',
}: UnifiedToolCardProps) {
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
          description: favorite ? `已从收藏中移除 ${tool.name}` : `已将 ${tool.name} 加入收藏`,
        })
      } catch (error) {
        console.error('Toggle favorite error:', error)
        toast({
          title: "操作失败",
          description: "收藏操作失败，请重试",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [tool.id, tool.name, favorite, isLoading, toggleFavorite, toast]
  )

  const handleImageError = useCallback(() => {
    setImageError(true)
  }, [])

  const handleExternalLink = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const baseClasses = compact
    ? "group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg hover:shadow-gray-200/30 dark:hover:shadow-gray-900/20 transition-all duration-300 h-full flex flex-col"
    : "group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-gray-200/30 dark:hover:shadow-gray-900/20 transition-all duration-300 h-full flex flex-col"

  const imageUrl = tool.logo_url || (tool as any).logo || '/images/default-tool-icon.svg'
  const websiteUrl = tool.website_url || (tool as any).website

  const compactContent = (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 relative">
            {!imageError ? (
              <Image
                src={imageUrl}
                alt={tool.name}
                width={32}
                height={32}
                className="rounded-lg ring-1 ring-gray-200/50 dark:ring-gray-700/50 object-cover"
                onError={handleImageError}
                priority={priority}
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {tool.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
              {tool.name}
            </h3>
            {tool.tagline && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {tool.tagline}
              </p>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleExternalLink}
              className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 opacity-0 group-hover:opacity-100"
              title="访问工具网站"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          
          {showBookmark && (
            <button
              onClick={handleBookmark}
              disabled={isLoading}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                favorite
                  ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                  : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600/50"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              title={favorite ? "取消收藏" : "添加收藏"}
            >
              <Bookmark className={`w-3 h-3 ${favorite ? "fill-current" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto">
        <div className="flex items-center space-x-3">
          {tool.rating && (
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{tool.rating}</span>
            </div>
          )}
          {tool.users_count && (
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{tool.users_count}</span>
            </div>
          )}
        </div>
        
        {tool.pricing_type && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            tool.pricing_type === 'free' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : tool.pricing_type === 'freemium'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
          }`}>
            {tool.pricing_type}
          </div>
        )}
      </div>
    </>
  )

  const fullContent = (
    <>
      {/* Top buttons container */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleExternalLink}
            className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 opacity-0 group-hover:opacity-100"
            title="访问工具网站"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        
        {showBookmark && (
          <button
            onClick={handleBookmark}
            disabled={isLoading}
            className={`p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 ${
              favorite
                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600/50"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            title={favorite ? "取消收藏" : "添加收藏"}
          >
            <Bookmark className={`w-4 h-4 ${favorite ? "fill-current" : ""}`} />
          </button>
        )}
      </div>

      {/* Tool Logo */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          {!imageError ? (
            <Image
              src={imageUrl}
              alt={tool.name}
              width={60}
              height={60}
              className="rounded-2xl ring-1 ring-gray-200/50 dark:ring-gray-700/50 object-cover"
              onError={handleImageError}
              priority={priority}
            />
          ) : (
            <div className="w-15 h-15 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {tool.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tool Info */}
      <div className="text-center mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
          {tool.name}
        </h3>
        {tool.tagline && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {tool.tagline}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="flex-1 mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
          {tool.description}
        </p>
      </div>

      {/* Tags */}
      {tool.tags && tool.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {tool.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium"
            >
              {typeof tag === 'string' ? tag : tag.name}
            </span>
          ))}
          {tool.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 rounded-full text-xs">
              +{tool.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center space-x-4">
          {tool.rating && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {tool.rating}
              </span>
            </div>
          )}
          {tool.users_count && (
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {tool.users_count}
              </span>
            </div>
          )}
        </div>
        
        {tool.pricing_type && (
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            tool.pricing_type === 'free' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : tool.pricing_type === 'freemium'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
          }`}>
            {tool.pricing_type}
          </div>
        )}
      </div>
    </>
  )

  const content = compact ? compactContent : fullContent

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`${baseClasses} ${className}`}
    >
      <Link href={`/${lang}/tools/${tool.slug}`} className="block h-full">
        {content}
      </Link>
    </motion.div>
  )
}

// 保持向后兼容性
export { UnifiedToolCard as ToolCard }
export { UnifiedToolCard as OptimizedToolCard }
export default UnifiedToolCard