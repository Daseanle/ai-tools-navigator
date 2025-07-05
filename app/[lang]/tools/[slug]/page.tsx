import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getToolBySlug } from "@/lib/api"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"
import ToolDetail from "@/components/sections/tool-detail"
import LoadingSkeleton from "@/components/ui/loading-skeleton"

interface PageProps {
  params: { lang: string; slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const tool = await getToolBySlug(params.slug)

  if (!tool) {
    return generatePageMetadata({
      title: "工具未找到",
      description: "请求的工具不存在",
      path: `/${params.lang}/tools/${params.slug}`,
      locale: params.lang,
    })
  }

  return generatePageMetadata({
    title: `${tool.name} - ${tool.tagline || "AI工具"}`,
    description: tool.description || tool.tagline || `${tool.name} 是一个优秀的AI工具`,
    path: `/${params.lang}/tools/${params.slug}`,
    locale: params.lang,
    keywords: tool.keywords || [],
  })
}

export default async function ToolPage({ params }: PageProps) {
  const tool = await getToolBySlug(params.slug)

  if (!tool) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <Suspense fallback={<LoadingSkeleton variant="card" className="max-w-4xl mx-auto p-8" />}>
        <ToolDetail tool={tool} />
      </Suspense>
    </div>
  )
}
