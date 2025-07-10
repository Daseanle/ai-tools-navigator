'use client'

import { memo } from 'react'
import UnifiedToolCard from './unified-tool-card'
import type { Tool } from '@/types'

interface ToolCardProps {
  tool: Tool
  viewMode?: 'compact' | 'full'
  showFavorite?: boolean
  onFavoriteClick?: (tool: Tool) => void
  className?: string
}

// 优化的工具卡片组件 - 使用 React.memo 避免不必要的重渲染
const ToolCard = memo<ToolCardProps>(({ tool, viewMode = 'full', showFavorite = true, className, ...props }) => {
  return (
    <UnifiedToolCard 
      tool={tool} 
      compact={viewMode === 'compact'}
      showBookmark={showFavorite}
      className={className}
      {...props} 
    />
  )
}, (prevProps, nextProps) => {
  // 自定义比较函数 - 只在关键属性变化时重新渲染
  return (
    prevProps.tool.id === nextProps.tool.id &&
    prevProps.tool.name === nextProps.tool.name &&
    prevProps.tool.rating === nextProps.tool.rating &&
    prevProps.tool.users_count === nextProps.tool.users_count &&
    prevProps.tool.upvotes_count === nextProps.tool.upvotes_count &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.showFavorite === nextProps.showFavorite &&
    prevProps.className === nextProps.className
  )
})

ToolCard.displayName = 'ToolCard'

export default ToolCard
export { ToolCard }
export { default as UnifiedToolCard } from './unified-tool-card'