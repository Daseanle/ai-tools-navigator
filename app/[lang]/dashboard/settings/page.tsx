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
          <UserSettings user={{
            id: "user-123",
            name: "用户",
            email: "user@example.com",
            avatar_url: "/avatars/default.png",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            membership: {
              type: 'free',
              is_active: true,
              features: ['basic_search', 'favorites'],
              limits: {
                favorites: 10,
                searches_per_day: 50,
                api_calls_per_month: 100,
                trial_tools: 3
              }
            },
            settings: {
              language: 'zh',
              theme: 'dark',
              notifications: {
                email: true,
                browser: true,
                new_tools: true,
                updates: false,
                marketing: false
              },
              privacy: {
                profile_public: false,
                usage_analytics: true,
                data_sharing: false
              },
              display: {
                grid_size: 'medium',
                show_ratings: true,
                show_pricing: true,
                auto_play_videos: false
              },
              search: {
                safe_search: true,
                include_beta: false,
                preferred_categories: []
              },
              ai: {
                enable_recommendations: true,
                enable_auto_tagging: true,
                enable_content_generation: false
              },
              accessibility: {
                high_contrast: false,
                reduced_motion: false,
                large_text: false,
                screen_reader: false
              }
            }
          }} />
        </Suspense>
      </div>
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
