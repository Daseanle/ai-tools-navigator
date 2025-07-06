import { Suspense } from "react"
import type { Metadata } from "next"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"
import UserSettings from "@/components/sections/user-settings"
import LoadingSkeleton from "@/components/ui/loading-skeleton"

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    title: "个人设置 - 账户管理",
    description: "管理您的账户设置、偏好配置和隐私选项",
    path: `/${params.lang}/dashboard/settings`,
    locale: params.lang,
  })
}

export default function SettingsPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">个人设置</h1>
          <p className="text-lg text-neutral-400">管理您的账户信息、偏好设置和隐私配置</p>
        </div>

        {/* 设置内容 */}
        <Suspense fallback={<LoadingSkeleton variant="card" count={4} className="space-y-6" />}>
          <UserSettings />
        </Suspense>
      </div>
    </div>
  )
}