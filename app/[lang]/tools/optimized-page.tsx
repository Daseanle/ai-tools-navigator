import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import OptimizedToolCard from '@/components/performance/optimized-tool-card'
import { SkeletonGrid } from '@/components/ui/loading-spinner'
import { VirtualScroll } from '@/components/performance/virtual-scroll'

interface ToolsPageProps {
  params: {
    lang: string
  }
  searchParams: {
    category?: string
    search?: string
    sort?: string
    page?: string
  }
}

// 生成元数据
export async function generateMetadata({
  params,
  searchParams
}: ToolsPageProps): Promise<Metadata> {
  const { category, search } = searchParams
  
  let title = 'AI工具大全'
  let description = '发现最新最好用的AI工具，提升工作效率'
  
  if (category) {
    // 简化的分类获取
    title = `${category} - AI工具`
    description = `探索${category}类别下的优质AI工具`
  }
  
  if (search) {
    title = `搜索 "${search}" - AI工具`
    description = `搜索关于"${search}"的AI工具结果`
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    alternates: {
      canonical: `/tools${search ? `?search=${search}` : ''}${category ? `?category=${category}` : ''}`
    }
  }
}

// 获取工具数据 - 支持ISR
async function getTools(searchParams: ToolsPageProps['searchParams']) {
  try {
    const { category, search, sort = 'rating', page = '1' } = searchParams
    const limit = 24
    const offset = (parseInt(page) - 1) * limit

    console.log('Fetching tools with params:', { category, search, sort, page, limit, offset })

    // 直接从数据库查询而不是通过API
    const { supabase } = await import('@/lib/supabase')
    
    let query = supabase
      .from('tools')
      .select(`
        *,
        categories(name, slug, icon)
      `, { count: 'exact' })
      .eq('status', 'active') // 只获取活跃状态的工具

    // 分类过滤
    if (category) {
      query = query.eq('categories.slug', category)
    }

    // 搜索过滤
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tagline.ilike.%${search}%`)
    }

    // 排序
    const validSortFields = ['created_at', 'updated_at', 'name', 'rating', 'visits']
    const sortField = validSortFields.includes(sort) ? sort : 'rating'
    const sortOrder = sort === 'name' ? 'asc' : 'desc'
    query = query.order(sortField, { ascending: sortOrder === 'asc' })

    // 分页
    query = query.range(offset, offset + limit - 1)

    const { data: tools, error, count } = await query

    console.log('Tools query result:', { tools: tools?.length, error, count })

    if (error) {
      console.error('Get tools error:', error)
      return { tools: [], total: 0, page: parseInt(page), totalPages: 1 }
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return {
      tools: tools || [],
      total: count || 0,
      page: parseInt(page),
      totalPages
    }
  } catch (error) {
    console.error('Error fetching tools:', error)
    return { tools: [], total: 0, page: 1, totalPages: 1 }
  }
}

// 获取分类数据
async function getCategories() {
  try {
    console.log('Fetching categories...')
    
    // 直接从数据库查询而不是通过API
    const { supabase } = await import('@/lib/supabase')
    
    let query = supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    const { data: categories, error } = await query

    console.log('Categories query result:', { categories: categories?.length, error })

    if (error) {
      console.error('Get categories error:', error)
      return []
    }

    // 获取工具数量
    const { data: toolCounts, error: countError } = await supabase
      .from('tools')
      .select('category_id')
      .eq('status', 'active')

    if (countError) {
      console.error('Tool count query error:', countError)
    }

    const countMap = new Map()
    toolCounts?.forEach((item: any) => {
      const count = countMap.get(item.category_id) || 0
      countMap.set(item.category_id, count + 1)
    })

    const processedCategories = (categories || []).map(category => ({
      ...category,
      toolCount: countMap.get(category.id) || 0
    }))

    console.log('Processed categories:', processedCategories.length)

    return processedCategories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

// 工具列表组件
function ToolsList({ 
  tools, 
  viewMode = 'full' 
}: { 
  tools: any[]
  viewMode?: 'compact' | 'full' 
}) {
  if (viewMode === 'compact') {
    return (
      <div className="space-y-2">
        {tools.map((tool, index) => (
          <OptimizedToolCard
            key={tool.id}
            tool={tool}
            viewMode="compact"
            priority={index < 6}
          />
        ))}
      </div>
    )
  }

  // 使用虚拟滚动优化大列表性能
  if (tools.length > 50) {
    return (
      <VirtualScroll
        tools={tools}
        itemHeight={400}
        containerHeight={800}
        columns={3}
        gap={24}
      />
    )
  }

  return (
    <div className="tools-grid">
      {tools.map((tool, index) => (
        <OptimizedToolCard
          key={tool.id}
          tool={tool}
          priority={index < 6} // 前6个工具优先加载
        />
      ))}
    </div>
  )
}

// 过滤器组件
function ToolsFilters({ 
  categories, 
  currentCategory, 
  currentSort 
}: { 
  categories: any[]
  currentCategory?: string
  currentSort?: string 
}) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* 分类过滤器 */}
      <div className="flex flex-wrap gap-2">
        <a
          href="/tools"
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            !currentCategory 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          全部
        </a>
        {categories.slice(0, 8).map((category) => (
          <a
            key={category.id}
            href={`/tools?category=${category.slug}`}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              currentCategory === category.slug
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </a>
        ))}
      </div>

      {/* 排序选择器 */}
      <select 
        className="px-3 py-1 text-sm border border-gray-300 rounded"
        defaultValue={currentSort}
        onChange={(e) => {
          const url = new URL(window.location.href)
          url.searchParams.set('sort', e.target.value)
          window.location.href = url.toString()
        }}
      >
        <option value="rating">按评分排序</option>
        <option value="users_count">按用户数排序</option>
        <option value="created_at">按最新排序</option>
        <option value="name">按名称排序</option>
      </select>
    </div>
  )
}

// 主页面组件
export default async function ToolsPage({ params, searchParams }: ToolsPageProps) {
  // 并行获取数据
  const [toolsData, categories] = await Promise.all([
    getTools(searchParams),
    getCategories()
  ])

  const { tools, total, totalPages, page } = toolsData

  if (!tools || tools.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            没有找到相关工具
          </h2>
          <p className="text-gray-600 mb-8">
            尝试调整搜索条件或浏览其他分类
          </p>
          <a 
            href="/tools"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            浏览全部工具
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {searchParams.search ? `搜索结果："${searchParams.search}"` : 'AI工具大全'}
        </h1>
        <p className="text-gray-600">
          共找到 {total} 个工具
        </p>
      </div>

      {/* 过滤器 */}
      <Suspense fallback={<div className="h-12 bg-gray-100 rounded animate-pulse" />}>
        <ToolsFilters 
          categories={categories}
          currentCategory={searchParams.category}
          currentSort={searchParams.sort}
        />
      </Suspense>

      {/* 工具列表 */}
      <Suspense fallback={<SkeletonGrid count={12} />}>
        <ToolsList tools={tools} />
      </Suspense>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <div className="flex space-x-2">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
              const pageNum = i + 1
              const isCurrentPage = pageNum === page
              
              return (
                <a
                  key={pageNum}
                  href={`/tools?${new URLSearchParams({
                    ...searchParams,
                    page: pageNum.toString()
                  }).toString()}`}
                  className={`px-3 py-2 text-sm rounded transition-colors ${
                    isCurrentPage
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageNum}
                </a>
              )
            })}
          </div>
        </div>
      )}

      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            'name': 'AI工具大全',
            'description': '最全面的AI工具集合',
            'numberOfItems': total,
            'mainEntity': tools.slice(0, 10).map((tool: any) => ({
              '@type': 'SoftwareApplication',
              'name': tool.name,
              'description': tool.tagline,
              'applicationCategory': 'AI Tool',
              'operatingSystem': 'Web',
              'aggregateRating': tool.rating ? {
                '@type': 'AggregateRating',
                'ratingValue': tool.rating,
                'ratingCount': tool.users_count || 1
              } : undefined
            }))
          })
        }}
      />
    </div>
  )
}