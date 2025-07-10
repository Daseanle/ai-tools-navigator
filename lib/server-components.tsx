// Advanced Server Components with Data Streaming
import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'
import { ErrorBoundary } from '@/components/error-boundary'
import { ToolCardSkeleton } from '@/components/skeletons/tool-card-skeleton'

// ==================== Server Component Factory ====================

export interface ServerComponentConfig {
  cache?: {
    tags?: string[]
    revalidate?: number | false
    ttl?: number
  }
  streaming?: boolean
  errorFallback?: React.ComponentType<any>
}

export function createServerComponent<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  config: ServerComponentConfig = {}
) {
  const WrappedComponent = async (props: T) => {
    const ComponentWithCache = config.cache 
      ? unstable_cache(
          async () => <Component {...props} />,
          [`server-component-${Component.name}`],
          {
            tags: config.cache.tags,
            revalidate: config.cache.revalidate ?? 3600
          }
        )
      : () => <Component {...props} />

    if (config.streaming) {
      return (
        <Suspense fallback={<ComponentSkeleton />}>
          <ErrorBoundary 
            level="component"
            fallback={config.errorFallback}
          >
            <ComponentWithCache />
          </ErrorBoundary>
        </Suspense>
      )
    }

    return <ComponentWithCache />
  }

  WrappedComponent.displayName = `ServerComponent(${Component.displayName || Component.name})`
  return WrappedComponent
}

// ==================== Data Fetching Patterns ====================

export class ServerDataFetcher {
  // Parallel data fetching
  static async fetchParallel<T extends Record<string, Promise<any>>>(
    queries: T
  ): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
    const keys = Object.keys(queries) as (keyof T)[]
    const promises = Object.values(queries)
    
    const results = await Promise.allSettled(promises)
    
    const data = {} as { [K in keyof T]: Awaited<T[K]> }
    keys.forEach((key, index) => {
      const result = results[index]
      if (result.status === 'fulfilled') {
        data[key] = result.value
      } else {
        console.error(`Failed to fetch ${String(key)}:`, result.reason)
        data[key] = null as any
      }
    })
    
    return data
  }

  // Streaming data fetcher
  static async* fetchStream<T>(
    fetcher: () => AsyncGenerator<T, void, unknown>
  ): AsyncGenerator<T, void, unknown> {
    try {
      for await (const chunk of fetcher()) {
        yield chunk
      }
    } catch (error) {
      console.error('Stream fetch error:', error)
      throw error
    }
  }

  // Cached data fetcher
  static createCachedFetcher<T>(
    fetcher: () => Promise<T>,
    cacheKey: string,
    options: {
      tags?: string[]
      revalidate?: number
      ttl?: number
    } = {}
  ) {
    return unstable_cache(
      fetcher,
      [cacheKey],
      {
        tags: options.tags,
        revalidate: options.revalidate ?? 3600
      }
    )
  }
}

// ==================== Optimized Tool Components ====================

// Server-side tool list with streaming
export async function ToolListServer({ 
  category, 
  page = 1, 
  limit = 20 
}: {
  category?: string
  page?: number
  limit?: number
}) {
  const { tools, totalCount } = await ServerDataFetcher.fetchParallel({
    tools: fetchTools({ category, page, limit }),
    totalCount: fetchToolsCount({ category })
  })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools?.map((tool) => (
          <Suspense key={tool.id} fallback={<ToolCardSkeleton />}>
            <ToolCardServer tool={tool} />
          </Suspense>
        ))}
      </div>
      
      {totalCount > limit && (
        <Suspense fallback={<div className="h-12 bg-gray-200 animate-pulse rounded" />}>
          <PaginationServer 
            currentPage={page}
            totalItems={totalCount}
            itemsPerPage={limit}
          />
        </Suspense>
      )}
    </div>
  )
}

// Individual tool card as server component
export async function ToolCardServer({ tool }: { tool: any }) {
  const enhancedTool = await enhanceToolData(tool)
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <img 
          src={enhancedTool.logo_url} 
          alt={enhancedTool.name}
          className="w-12 h-12 rounded-lg"
          loading="lazy"
        />
        <div>
          <h3 className="font-semibold text-lg">{enhancedTool.name}</h3>
          <p className="text-gray-600 text-sm">{enhancedTool.tagline}</p>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4 line-clamp-3">
        {enhancedTool.description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-yellow-500">★</span>
          <span className="text-sm font-medium">{enhancedTool.rating}</span>
          <span className="text-gray-500 text-sm">
            ({enhancedTool.rating_count})
          </span>
        </div>
        
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {enhancedTool.pricing_type}
        </span>
      </div>
    </div>
  )
}

// ==================== Component Skeletons ====================

function ComponentSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
}

// ==================== Data Fetching Functions ====================

async function fetchTools({ category, page, limit }: {
  category?: string
  page: number
  limit: number
}) {
  // Simulate database query
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // This would be replaced with actual Supabase query
  return Array.from({ length: limit }, (_, i) => ({
    id: `tool-${page}-${i}`,
    name: `Tool ${page}-${i}`,
    tagline: `AI Tool ${page}-${i}`,
    description: `Description for tool ${page}-${i}`,
    logo_url: `https://picsum.photos/64/64?random=${page}-${i}`,
    rating: 4.5,
    rating_count: 100,
    pricing_type: 'freemium'
  }))
}

async function fetchToolsCount({ category }: { category?: string }) {
  // Simulate count query
  return 500
}

async function enhanceToolData(tool: any) {
  // Add additional computed data
  return {
    ...tool,
    popularity_score: calculatePopularityScore(tool),
    trending: isTrending(tool),
    recommended: isRecommended(tool)
  }
}

function calculatePopularityScore(tool: any): number {
  return (tool.rating * 0.3) + (Math.min(tool.visits || 0, 10000) / 10000 * 0.7)
}

function isTrending(tool: any): boolean {
  // Simple trending logic based on recent activity
  return tool.rating > 4.0 && (tool.visits || 0) > 1000
}

function isRecommended(tool: any): boolean {
  return tool.rating > 4.5 && tool.featured
}

// ==================== Pagination Server Component ====================

export async function PaginationServer({
  currentPage,
  totalItems,
  itemsPerPage
}: {
  currentPage: number
  totalItems: number
  itemsPerPage: number
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  return (
    <div className="flex justify-center items-center gap-2">
      {/* Pagination logic */}
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages} ({totalItems} items)
      </span>
    </div>
  )
}

// ==================== Export Wrapped Components ====================

export const OptimizedToolList = createServerComponent(ToolListServer, {
  cache: {
    tags: ['tools', 'categories'],
    revalidate: 1800 // 30 minutes
  },
  streaming: true
})

export const OptimizedToolCard = createServerComponent(ToolCardServer, {
  cache: {
    tags: ['tools'],
    revalidate: 3600 // 1 hour
  },
  streaming: false
})