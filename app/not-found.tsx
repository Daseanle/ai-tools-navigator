import Link from "next/link"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-8xl mb-8">🤖</div>
        <h1 className="text-4xl font-bold text-white mb-4">页面未找到</h1>
        <p className="text-neutral-400 mb-8">抱歉，你访问的页面不存在或已被移除</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/zh"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Link>
          <Link
            href="/zh/search"
            className="inline-flex items-center px-6 py-3 bg-neutral-800/50 hover:bg-neutral-700/50 text-white font-semibold rounded-xl transition-colors border border-neutral-700/50"
          >
            <Search className="w-4 h-4 mr-2" />
            搜索工具
          </Link>
        </div>
      </div>
    </div>
  )
}
