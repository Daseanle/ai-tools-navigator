import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getToolsByCategory, getCategories } from "@/lib/api"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"
import ToolsGrid from "@/components/sections/tools-grid"
import LoadingSkeleton from "@/components/ui/loading-skeleton"

interface PageProps {
  params: { lang: string; slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const categories = await getCategories()
  const category = categories.find((c) => c.slug === params.slug)

  if (!category) {
    return generatePageMetadata({
      title: "分类未找到",
      description: "请求的分类不存在",
      path: `/${params.lang}/categories/${params.slug}`,
      locale: params.lang,
    })
  }

  return generatePageMetadata({
    title: `${category.name} - AI工具分类`,
    description: `浏览 ${category.name} 分类下的所有AI工具，${category.description || ""}`,
    path: `/${params.lang}/categories/${params.slug}`,
    locale: params.lang,
  })
}

export async function generateStaticParams() {
  try {
    const categories = await getCategories()
    const langs = ['zh', 'en']
    
    return langs.flatMap(lang => 
      categories.map(category => ({
        lang,
        slug: category.slug
      }))
    )
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const [tools, categories] = await Promise.allSettled([getToolsByCategory(params.slug), getCategories()])

  const toolsData = tools.status === "fulfilled" ? tools.value : []
  const categoriesData = categories.status === "fulfilled" ? categories.value : []
  const category = categoriesData.find((c) => c.slug === params.slug)

  if (!category) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 分类标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-2xl mb-4">
            <span className="text-3xl">{category.icon || "📁"}</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">{category.name}</h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            {category.description || `探索 ${category.name} 分类下的AI工具`}
          </p>
          <div className="mt-4 text-sm text-neutral-500">共 {category.tools_count || toolsData.length} 个工具</div>
        </div>

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
