'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ToolCard } from '@/components/ui/tool-card'
import type { Tool } from '@/types'

interface VirtualScrollProps {
  tools: Tool[]
  itemHeight: number
  containerHeight: number
  gap?: number
  columns?: number
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
}

export function VirtualScroll({
  tools,
  itemHeight,
  containerHeight,
  gap = 16,
  columns = 3,
  onLoadMore,
  hasMore = false,
  loading = false,
}: VirtualScrollProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeout = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)

  // 计算虚拟滚动参数
  const rowHeight = itemHeight + gap
  const totalRows = Math.ceil(tools.length / columns)
  const totalHeight = totalRows * rowHeight
  const viewportHeight = containerHeight
  const visibleRows = Math.ceil(viewportHeight / rowHeight)
  const startIndex = Math.floor(scrollTop / rowHeight)
  const endIndex = Math.min(startIndex + visibleRows + 1, totalRows)

  // 滚动处理
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    setScrollTop(scrollTop)
    setIsScrolling(true)

    // 清除之前的timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current)
    }

    // 设置新的timeout
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false)
    }, 150)

    // 无限滚动
    if (
      hasMore &&
      !loading &&
      onLoadMore &&
      scrollTop + viewportHeight >= totalHeight - rowHeight * 2
    ) {
      onLoadMore()
    }
  }, [hasMore, loading, onLoadMore, totalHeight, viewportHeight, rowHeight])

  // 获取可见项目
  const getVisibleItems = useCallback(() => {
    const items: Array<{ index: number; tool: Tool; style: React.CSSProperties }> = []
    
    for (let rowIndex = startIndex; rowIndex < endIndex; rowIndex++) {
      for (let colIndex = 0; colIndex < columns; colIndex++) {
        const toolIndex = rowIndex * columns + colIndex
        if (toolIndex >= tools.length) break
        
        const tool = tools[toolIndex]
        const style: React.CSSProperties = {
          position: 'absolute',
          top: rowIndex * rowHeight,
          left: `${(colIndex * 100) / columns}%`,
          width: `${100 / columns}%`,
          height: itemHeight,
          padding: gap / 2,
          boxSizing: 'border-box',
        }

        items.push({ index: toolIndex, tool, style })
      }
    }

    return items
  }, [startIndex, endIndex, columns, tools, rowHeight, itemHeight, gap])

  // 清理timeout
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [])

  const visibleItems = getVisibleItems()

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="relative overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        {/* 虚拟容器 */}
        <div
          className="relative"
          style={{ height: totalHeight }}
        >
          {/* 可见项目 */}
          {visibleItems.map(({ index, tool, style }) => (
            <div
              key={`${tool.id}-${index}`}
              style={style}
              className={`transition-opacity duration-150 ${
                isScrolling ? 'opacity-90' : 'opacity-100'
              }`}
            >
              <div className="h-full p-2">
                <ToolCard tool={tool} />
              </div>
            </div>
          ))}
        </div>

        {/* 加载更多指示器 */}
        {loading && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600">加载中...</span>
            </div>
          </div>
        )}
      </div>

      {/* 滚动条指示器 */}
      <div className="absolute right-0 top-0 w-1 h-full bg-gray-200 rounded-full">
        <div
          className="bg-blue-500 rounded-full transition-all duration-200"
          style={{
            height: `${(viewportHeight / totalHeight) * 100}%`,
            transform: `translateY(${(scrollTop / totalHeight) * containerHeight}px)`,
          }}
        />
      </div>
    </div>
  )
}

// 预设配置
export const VIRTUAL_SCROLL_CONFIGS = {
  mobile: {
    itemHeight: 280,
    containerHeight: 600,
    columns: 1,
    gap: 12,
  },
  tablet: {
    itemHeight: 320,
    containerHeight: 800,
    columns: 2,
    gap: 16,
  },
  desktop: {
    itemHeight: 360,
    containerHeight: 800,
    columns: 3,
    gap: 20,
  },
} as const

type VirtualScrollConfig = typeof VIRTUAL_SCROLL_CONFIGS[keyof typeof VIRTUAL_SCROLL_CONFIGS]

// 响应式虚拟滚动Hook
export function useVirtualScrollConfig() {
  const [config, setConfig] = useState<VirtualScrollConfig>(VIRTUAL_SCROLL_CONFIGS.desktop)

  useEffect(() => {
    const updateConfig = () => {
      const width = window.innerWidth
      if (width < 768) {
        setConfig(VIRTUAL_SCROLL_CONFIGS.mobile)
      } else if (width < 1024) {
        setConfig(VIRTUAL_SCROLL_CONFIGS.tablet)
      } else {
        setConfig(VIRTUAL_SCROLL_CONFIGS.desktop)
      }
    }

    updateConfig()
    window.addEventListener('resize', updateConfig)
    return () => window.removeEventListener('resize', updateConfig)
  }, [])

  return config
}