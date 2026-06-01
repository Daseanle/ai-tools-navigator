import { Suspense } from "react"
import type { Metadata } from "next"
import { searchTools } from "@/lib/api"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"
import SearchResults from "@/components/sections/search-results"
import OptimizedSearchBar from "@/components/ui/optimized-search-bar"
import LoadingSkeleton from "@/components/ui/loading-skeleton"

interface PageProps {
  params: { lang: string }
  searchParams: { q?: string }
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const query = searchParams.q || ""

  return generatePageMetadata({
    title: query ? `"${query}" 的搜索结果` : "搜索AI工具",
    description: query ? `搜索 "${query}" 相关的AI工具` : "搜索你需要的AI工具",
    path: `/${params.lang}/search`,
    locale: params.lang,
  })
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  const query = searchParams.q || ""
  const results = query ? await searchTools(query, 20) : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索栏 */}
        <div className="mb-8">
          <OptimizedSearchBar
            initialQuery={query}
            placeholder="搜索AI工具、功能或解决方案..."
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* 搜索结果 */}
        <Suspense
          fallback={
            <LoadingSkeleton
              variant="card"
              count={8}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            />
          }
        >
          <SearchResults query={query} results={results} />
        </Suspense>
      </div>
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
