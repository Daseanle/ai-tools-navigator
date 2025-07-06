import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"
import UserFavorites from "@/components/sections/user-favorites"
import LoadingSkeleton from "@/components/ui/loading-skeleton"

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    title: "我的收藏 - AI工具智能收藏",
    description: "管理您收藏的AI工具，快速找到最喜欢的工具",
    path: `/${params.lang}/dashboard/favorites`,
    locale: params.lang,
  })
}

export default async function FavoritesPage({ params }: PageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect(`/${params.lang}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">智能收藏</h1>
          <p className="text-lg text-neutral-400">管理您收藏的AI工具，快速访问最喜欢的工具</p>
        </div>

        {/* 收藏工具列表 */}
        <Suspense fallback={<LoadingSkeleton variant="card" count={8} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" />}>
          <UserFavorites userId={session.user.id} />
        </Suspense>
      </div>
    </div>
  )
}