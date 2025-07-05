import { Suspense } from "react"
import type { Metadata } from "next"
import { getCategories } from "@/lib/api"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"
import CategoriesGrid from "@/components/sections/categories-grid"
import LoadingSkeleton from "@/components/ui/loading-skeleton"

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    title: "AI工具分类 - 按类别浏览AI工具",
    description: "按分类浏览AI工具，包括对话AI、图像生成、代码助手、文本处理等各个领域的专业工具。",
    path: `/${params.lang}/categories`,
    locale: params.lang,
  })
}

export default async function CategoriesPage({ params }: PageProps) {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">工具分类</h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">按类别探索AI工具，快速找到你需要的解决方案</p>
        </div>

        {/* 分类网格 */}
        <Suspense
          fallback={
            <LoadingSkeleton
              variant="card"
              count={8}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            />
          }
        >
          <CategoriesGrid categories={categories} />
        </Suspense>
      </div>
    </div>
  )
}
