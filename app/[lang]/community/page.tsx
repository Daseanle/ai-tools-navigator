import { Suspense } from "react"
import type { Metadata } from "next"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"
import CommunityHub from "@/components/community/community-hub"
import LoadingSkeleton from "@/components/ui/loading-skeleton"

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    title: "AI社区 - AI Navigator Pro",
    description: "AI知识分享社区，优质内容创作者聚集地。分享经验、学习技巧、内容变现，一起探索AI的无限可能。",
    path: `/${params.lang}/community`,
    locale: params.lang,
  })
}

export default function CommunityPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <Suspense fallback={<LoadingSkeleton variant="card" count={6} className="max-w-7xl mx-auto p-8" />}>
        <CommunityHub />
      </Suspense>
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
