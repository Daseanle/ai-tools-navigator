import { Suspense } from "react"
import type { Metadata } from "next"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"
import PromptMarket from "@/components/prompts/prompt-market"
import LoadingSkeleton from "@/components/ui/loading-skeleton"

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    title: "Prompt 市场 - AI Navigator Pro",
    description: "发现、购买、分享优质 AI Prompt。专业的 Prompt 交易平台，助您提升 AI 效率。",
    path: `/${params.lang}/prompts`,
    locale: params.lang,
  })
}

export default function PromptsPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <Suspense fallback={<LoadingSkeleton variant="card" count={6} className="max-w-7xl mx-auto p-8" />}>
        <PromptMarket />
      </Suspense>
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
