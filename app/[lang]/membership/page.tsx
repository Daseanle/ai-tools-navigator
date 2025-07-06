import { Suspense } from "react"
import type { Metadata } from "next"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"
import MembershipPlans from "@/components/membership/membership-plans"
import LoadingSkeleton from "@/components/ui/loading-skeleton"

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    title: "会员计划 - AI Navigator Pro",
    description: "选择适合您的会员计划，享受高级功能和专业服务。透明定价，随时可取消。",
    path: `/${params.lang}/membership`,
    locale: params.lang,
  })
}

export default function MembershipPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <Suspense fallback={<LoadingSkeleton variant="card" count={4} className="max-w-7xl mx-auto p-8" />}>
        <MembershipPlans />
      </Suspense>
    </div>
  )
}