import { Suspense } from "react"
import type { Metadata } from "next"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"
import EnterpriseServices from "@/components/enterprise/enterprise-services"
import LoadingSkeleton from "@/components/ui/loading-skeleton"

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    title: "企业服务 - AI Navigator Pro",
    description: "专业的企业AI工具咨询和定制服务。帮助企业提升AI效率，降低成本，获得竞争优势。",
    path: `/${params.lang}/enterprise`,
    locale: params.lang,
  })
}

export default function EnterprisePage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <Suspense fallback={<LoadingSkeleton variant="card" count={4} className="max-w-7xl mx-auto p-8" />}>
        <EnterpriseServices />
      </Suspense>
    </div>
  )
}