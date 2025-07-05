import { Suspense } from "react"
import type { Metadata } from "next"
import { getHotTools, getCategories } from "@/lib/api"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"
import ToolsGrid from "@/components/sections/tools-grid"
import ToolsFilter from "@/components/sections/tools-filter"
import LoadingSkeleton from "@/components/ui/loading-skeleton"

interface PageProps {
  params: { lang: string }
  searchParams: { category?: string; sort?: string; pricing?: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    title: "AI工具大全 - 发现最新最热门的AI工具",
    description:
      "浏览完整的AI工具库，包含对话AI、图像生成、代码助手等各类工具。按分类、评分、价格筛选，找到最适合你的AI工具。",
    path: `/${params.lang}/tools`,
    locale: params.lang,
  })
}

export default async function ToolsPage({ params, searchParams }: PageProps) {
  const [tools, categories] = await Promise.allSettled([getHotTools(24), getCategories()])

  const toolsData = tools.status === "fulfilled" ? tools.value : []
  const categoriesData = categories.status === "fulfilled" ? categories.value : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">AI工具大全</h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">发现最新最热门的AI工具，提升你的工作效率</p>
        </div>

        {/* 筛选器 */}
        <Suspense fallback={<LoadingSkeleton variant="card" className="h-20 mb-8" />}>
          <ToolsFilter categories={categoriesData} />
        </Suspense>

        {/* 工具网格 */}
        <Suspense
          fallback={
            <LoadingSkeleton
              variant="card"
              count={12}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            />
          }
        >
          <ToolsGrid tools={toolsData} />
        </Suspense>
      </div>
    </div>
  )
}
