import type { Metadata } from "next"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"
import { Sparkles, Target, Zap } from "lucide-react"

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    title: "关于我们 - AI Navigator",
    description: "了解AI Navigator的使命、愿景和团队。我们致力于为用户提供最优质的AI工具发现和评测服务。",
    path: `/${params.lang}/about`,
    locale: params.lang,
  })
}

export default function AboutPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 页面标题 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-2xl mb-6">
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">关于 AI Navigator</h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">我们致力于成为你探索AI世界的最佳向导</p>
        </div>

        {/* 使命愿景 */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="glass rounded-2xl p-8">
            <div className="flex items-center mb-4">
              <Target className="w-6 h-6 text-blue-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">我们的使命</h2>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              让每个人都能轻松发现和使用最适合自己需求的AI工具，提升工作效率，释放创造潜能。
            </p>
          </div>

          <div className="glass rounded-2xl p-8">
            <div className="flex items-center mb-4">
              <Zap className="w-6 h-6 text-purple-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">我们的愿景</h2>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              成为全球最权威、最全面的AI工具发现平台，连接用户与最优秀的AI解决方案。
            </p>
          </div>
        </div>

        {/* 核心价值 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">核心价值</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🎯",
                title: "精准推荐",
                description: "基于用户需求和使用场景，提供最精准的工具推荐",
              },
              {
                icon: "🔍",
                title: "深度评测",
                description: "专业团队深度测试，提供真实可靠的工具评价",
              },
              {
                icon: "⚡",
                title: "实时更新",
                description: "持续跟踪AI工具发展，第一时间更新最新信息",
              },
            ].map((value, index) => (
              <div key={index} className="glass rounded-xl p-6 text-center">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-neutral-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 统计数据 */}
        <div className="glass rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">平台数据</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "收录工具", value: "1000+" },
              { label: "注册用户", value: "50万+" },
              { label: "月访问量", value: "100万+" },
              { label: "用户评价", value: "10万+" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{stat.value}</div>
                <div className="text-sm text-neutral-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 联系我们 */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">联系我们</h2>
          <p className="text-neutral-400 mb-6">有任何问题或建议，欢迎随时与我们联系</p>
          <div className="flex justify-center space-x-6">
            <a href="mailto:contact@ai-navigator.com" className="text-blue-400 hover:text-blue-300 transition-colors">
              contact@ai-navigator.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
