import { Suspense } from "react"
import type { Metadata } from "next"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"
import AdvertisingPlatform from "@/components/advertising/advertising-platform"
import LoadingSkeleton from "@/components/ui/loading-skeleton"

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    title: "广告投放平台 - AI Navigator Pro",
    description: "精准的广告投放平台，触达高质量AI用户群体。自助投放，实时数据，按效果付费。",
    path: `/${params.lang}/advertising`,
    locale: params.lang,
  })
}

export default function AdvertisingPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <Suspense fallback={<LoadingSkeleton variant="card" count={6} className="max-w-7xl mx-auto p-8" />}>
        <AdvertisingPlatform />
      </Suspense>
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
