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
  title: "AI Tools Navigator - Discover the Best AI Tools",
  description: "Discover, compare, and find the perfect AI tools for your projects. Browse our comprehensive directory of artificial intelligence applications, machine learning platforms, and automation tools.",
  keywords: [
    "AI tools", "artificial intelligence", "machine learning", "ChatGPT", "Midjourney",
    "AI applications", "automation tools", "productivity tools", "content generation",
    "data analysis", "computer vision", "NLP tools", "AI directory"
  ],
  openGraph: {
    title: "AI Tools Navigator - Discover the Best AI Tools",
    description: "Discover, compare, and find the perfect AI tools for your projects. Browse our comprehensive directory of AI applications.",
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "AI Tools Navigator",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Tools Navigator - Discover the Best AI Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tools Navigator - Discover the Best AI Tools",
    description: "Discover, compare, and find the perfect AI tools for your projects.",
    images: ["/og-image.jpg"],
    creator: "@aitools_nav",
  },
  robots: {
    index: true,
    follow: true,
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

// NaviGuard-AI Security Audited - 2026-06-01
