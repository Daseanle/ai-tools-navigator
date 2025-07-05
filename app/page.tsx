import { Suspense } from "react"
import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { getHotTools, getCategories } from "@/lib/api"
import HeroSection from "@/components/sections/hero-section"
import HomePageSkeleton from "@/components/skeletons/home-page-skeleton"

// Lazy load heavy components
const CategorySection = dynamic(() => import("@/components/sections/category-section"), {
  loading: () => <div className="h-32 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />,
})

const FeaturesSection = dynamic(() => import("@/components/sections/features-section"), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />,
})

const HotToolsSection = dynamic(() => import("@/components/sections/hot-tools-section"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />,
})

const CTASection = dynamic(() => import("@/components/sections/cta-section"), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />,
})

export const metadata: Metadata = {
  title: "AI Navigator - 发现最佳AI工具",
  description: "探索、评测、精通。为你找到解决问题的最佳AI工具。发现ChatGPT、Midjourney等热门AI工具。",
  keywords: ["AI工具", "ChatGPT", "Midjourney", "AI导航", "人工智能", "AI应用"],
  openGraph: {
    title: "AI Navigator - 发现最佳AI工具",
    description: "探索、评测、精通。为你找到解决问题的最佳AI工具。",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Navigator - 发现最佳AI工具",
    description: "探索、评测、精通。为你找到解决问题的最佳AI工具。",
  },
  alternates: {
    canonical: "/",
  },
}

export default async function HomePage() {
  // Parallel data fetching for better performance
  const [hotTools, categories] = await Promise.all([getHotTools(8), getCategories()])

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroSection />

          <CategorySection categories={categories} />

          <FeaturesSection />

          <HotToolsSection tools={hotTools} />

          <CTASection />
        </div>
      </main>
    </Suspense>
  )
}
