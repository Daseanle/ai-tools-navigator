import { Suspense } from "react"
import type { Metadata } from "next"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"
import UserAnalytics from "@/components/sections/user-analytics"
import LoadingSkeleton from "@/components/ui/loading-skeleton"

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    title: "数据分析 - AI工具使用分析",
    description: "查看您的AI工具使用数据和统计分析",
    path: `/${params.lang}/dashboard/analytics`,
    locale: params.lang,
  })
}

export default function AnalyticsPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">数据分析</h1>
          <p className="text-lg text-neutral-400">深入了解您的AI工具使用习惯和偏好分析</p>
        </div>

        {/* 数据分析内容 */}
        <Suspense fallback={<LoadingSkeleton variant="card" count={6} className="grid grid-cols-1 lg:grid-cols-2 gap-6" />}>
          <UserAnalytics userId="user-123" />
        </Suspense>
      </div>
    </div>
  )
}