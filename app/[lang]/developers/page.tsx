import { Suspense } from "react"
import type { Metadata } from "next"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"
import DeveloperMarketplace from "@/components/developer/developer-marketplace"
import LoadingSkeleton from "@/components/ui/loading-skeleton"

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    title: "开发者中心 - AI Navigator Pro",
    description: "丰富的API接口和专业的开发服务。快速集成AI功能，找到专业开发者，助力您的AI项目成功。",
    path: `/${params.lang}/developers`,
    locale: params.lang,
  })
}

export default function DevelopersPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <Suspense fallback={<LoadingSkeleton variant="card" count={6} className="max-w-7xl mx-auto p-8" />}>
        <DeveloperMarketplace />
      </Suspense>
    </div>
  )
}