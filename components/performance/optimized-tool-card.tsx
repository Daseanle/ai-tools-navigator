'use client'

import { memo, useMemo } from 'react'
import { OptimizedImage } from '@/components/performance/optimized-image'
import { useSearchWorker } from '@/hooks/use-web-worker'
import { cn } from '@/lib/utils'
import type { Tool } from '@/types'

interface OptimizedToolCardProps {
  tool: Tool
  priority?: boolean
  viewMode?: 'compact' | 'full'
  onFavorite?: (toolId: number) => void
  isFavorite?: boolean
}

// 优化的工具卡片组件
const OptimizedToolCard = memo<OptimizedToolCardProps>(({
  tool,
  priority = false,
  viewMode = 'full',
  onFavorite,
  isFavorite = false
}) => {
  // 计算显示评分
  const displayRating = useMemo(() => {
    return Math.round((tool.rating || 0) * 10) / 10
  }, [tool.rating])

  // 格式化用户数量
  const formatUserCount = useMemo(() => {
    const count = tool.users_count || 0
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }, [tool.users_count])

  // 处理收藏
  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onFavorite?.(tool.id)
  }

  // 紧凑模式
  if (viewMode === 'compact') {
    return (
      <div className="tool-card compact contain-layout will-change-transform">
        <div className="flex items-center space-x-3">
          <OptimizedImage
            src={tool.logo_url || '/placeholder.svg'}
            alt={tool.name}
            width={40}
            height={40}
            className="rounded-lg flex-shrink-0"
            priority={priority}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{tool.name}</h3>
            <p className="text-xs text-gray-600 truncate">{tool.tagline}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-amber-500">⭐ {displayRating}</span>
            <button
              onClick={handleFavorite}
              className={cn(
                'p-1 rounded transition-colors',
                isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              )}
              aria-label={isFavorite ? '取消收藏' : '添加收藏'}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 完整模式
  return (
    <div className="tool-card gpu-accelerated contain-layout">
      <div className="relative">
        <OptimizedImage
          src={tool.logo_url || '/placeholder.svg'}
          alt={tool.name}
          width={280}
          height={160}
          className="w-full h-40 object-cover rounded-lg"
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* 收藏按钮 */}
        <button
          onClick={handleFavorite}
          className={cn(
            'absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm transition-all',
            isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
          )}
          aria-label={isFavorite ? '取消收藏' : '添加收藏'}
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>

        {/* 价格标签 */}
        {tool.pricing_type && (
          <div className="absolute bottom-2 left-2">
            <span className={cn(
              'px-2 py-1 text-xs font-medium rounded',
              tool.pricing_type === 'free' ? 'bg-green-100 text-green-800' :
              tool.pricing_type === 'freemium' ? 'bg-blue-100 text-blue-800' :
              'bg-orange-100 text-orange-800'
            )}>
              {tool.pricing_type === 'free' ? '免费' :
               tool.pricing_type === 'freemium' ? '免费增值' : '付费'}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="font-semibold text-lg line-clamp-1">{tool.name}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{tool.tagline}</p>
        
        {/* 统计信息 */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {displayRating}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              {formatUserCount}
            </span>
          </div>

          {/* 分类标签 */}
          {tool.category && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
              {tool.category.name}
            </span>
          )}
        </div>

        {/* 标签 */}
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tool.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded"
              >
                {tag.name}
              </span>
            ))}
            {tool.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-50 text-gray-500 rounded">
                +{tool.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // 优化的比较函数
  return (
    prevProps.tool.id === nextProps.tool.id &&
    prevProps.tool.rating === nextProps.tool.rating &&
    prevProps.tool.users_count === nextProps.tool.users_count &&
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.viewMode === nextProps.viewMode
  )
})

OptimizedToolCard.displayName = 'OptimizedToolCard'

export default OptimizedToolCard