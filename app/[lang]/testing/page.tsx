import { Suspense } from "react"
import type { Metadata } from "next"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"
import UserTestingInvite from "@/components/testing/user-testing-invite"
import LoadingSkeleton from "@/components/ui/loading-skeleton"

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    title: "用户测试计划 - AI Navigator Pro",
    description: "加入我们的用户测试计划，抢先体验新功能，获得丰厚奖励。帮助我们打造更好的AI工具平台。",
    path: `/${params.lang}/testing`,
    locale: params.lang,
  })
}

export default function TestingPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <Suspense fallback={<LoadingSkeleton variant="card" count={4} className="max-w-7xl mx-auto p-8" />}>
        <UserTestingInvite />
      </Suspense>
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
