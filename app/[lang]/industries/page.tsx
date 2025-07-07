import { Suspense } from "react"
import type { Metadata } from "next"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"
import IndustrySolutionsPage from "@/components/industry/industry-solutions-page"
import LoadingSkeleton from "@/components/ui/loading-skeleton"

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    title: "行业AI解决方案 - AI Navigator Pro",
    description: "为不同行业量身定制的AI工具解决方案，助力企业数字化转型，提升运营效率。覆盖企业服务、教育培训、医疗健康、金融服务等多个领域。",
    path: `/${params.lang}/industries`,
    locale: params.lang,
  })
}

export default function IndustriesPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <Suspense fallback={<LoadingSkeleton variant="card" count={6} className="max-w-7xl mx-auto p-8" />}>
        <IndustrySolutionsPage />
      </Suspense>
    </div>
  )
}