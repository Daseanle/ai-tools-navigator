import { Suspense } from "react"
import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { getHotTools, getCategories, getFeaturedTools } from "@/lib/api"
import HeroSection from "@/components/sections/hero-section"
import HomePageSkeleton from "@/components/skeletons/home-page-skeleton"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"

// 动态导入重组件以优化首屏加载
const CategorySection = dynamic(() => import("@/components/sections/category-section"), {
  loading: () => <div className="h-32 skeleton rounded-2xl" />,
  ssr: false,
})

const FeaturesSection = dynamic(() => import("@/components/sections/features-section"), {
  loading: () => <div className="h-64 skeleton rounded-2xl" />,
  ssr: false,
})

const HotToolsSection = dynamic(() => import("@/components/sections/hot-tools-section"), {
  loading: () => <div className="h-96 skeleton rounded-2xl" />,
  ssr: false,
})

const CTASection = dynamic(() => import("@/components/sections/cta-section"), {
  loading: () => <div className="h-64 skeleton rounded-2xl" />,
  ssr: false,
})

const StatsSection = dynamic(() => import("@/components/sections/stats-section"), {
  loading: () => <div className="h-32 skeleton rounded-2xl" />,
  ssr: false,
})

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    title: "AI Navigator Pro - 你的AI工具决策中心",
    description: "探索、评测、精通。为你找到解决问题的最佳AI工具。发现ChatGPT、Midjourney等热门AI工具，提升工作效率。",
    path: `/${params.lang}`,
    locale: params.lang,
  })
}

export default async function HomePage({ params }: PageProps) {
  // 并行获取数据以优化性能
  const [hotTools, categories, featuredTools] = await Promise.allSettled([
    getHotTools(8),
    getCategories(),
    getFeaturedTools(6),
  ])

  const hotToolsData = hotTools.status === "fulfilled" ? hotTools.value : []
  const categoriesData = categories.status === "fulfilled" ? categories.value : []
  const featuredToolsData = featuredTools.status === "fulfilled" ? featuredTools.value : []

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section - 关键内容，立即渲染 */}
          <HeroSection />

          {/* Stats Section - 展示网站统计 */}
          <StatsSection />

          {/* Category Section - 分类导航 */}
          <CategorySection categories={categoriesData} />

          {/* Hot Tools Section - 热门工具 */}
          <HotToolsSection tools={hotToolsData} />

          {/* Features Section - 特性介绍 */}
          <FeaturesSection />

          {/* CTA Section - 行动号召 */}
          <CTASection />
        </div>
      </main>
    </Suspense>
  )
}

// 启用静态生成
const nextDynamic = "force-static"
export const revalidate = 3600 // 1小时重新验证
