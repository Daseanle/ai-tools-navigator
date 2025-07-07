import { Suspense } from "react"
import type { Metadata } from "next"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"
import ToolTrialAffiliate from "@/components/tools/tool-trial-affiliate"
import LoadingSkeleton from "@/components/ui/loading-skeleton"

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    title: "AI工具试用与分销 - AI Navigator Pro",
    description: "免费试用顶级AI工具，加入分销计划轻松赚取佣金。一键试用ChatGPT、Claude等热门AI工具。",
    path: `/${params.lang}/trials`,
    locale: params.lang,
  })
}

export default function TrialsPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <Suspense fallback={<LoadingSkeleton variant="card" count={6} className="max-w-7xl mx-auto p-8" />}>
        <ToolTrialAffiliate />
      </Suspense>
    </div>
  )
}