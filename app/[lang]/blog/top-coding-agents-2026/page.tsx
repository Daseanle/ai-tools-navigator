import type { Metadata } from "next"
import { generateMetadata as generatePageMetadata } from "@/lib/metadata"
import { Code, Terminal, Cpu, Zap, Star } from "lucide-react"

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    title: params.lang === 'zh' ? "2026年顶尖AI代码助手推荐" : "Top AI Coding Agents of 2026",
    description: params.lang === 'zh' ? "探索2026年最先进的AI代码开发工具，包括Cursor, DeepSeek, Claude等。" : "Explore the most advanced AI coding tools of 2026, including Cursor, DeepSeek, Claude, and more.",
    path: `/${params.lang}/blog/top-coding-agents-2026`,
    locale: params.lang,
    keywords: ["AI coding", "Cursor AI", "DeepSeek-V3", "GitHub Copilot", "Devin AI"]
  })
}

export default function BlogPage({ params }: PageProps) {
  const isZh = params.lang === 'zh'
  
  const tools = [
    {
      name: "Cursor",
      icon: <Terminal className="w-6 h-6 text-blue-400" />,
      desc: isZh ? "目前公认最强的AI代码编辑器，深度集成Claude 3.5。" : "The gold standard for AI code editors, deeply integrated with Claude 3.5.",
      rating: "5.0"
    },
    {
      name: "DeepSeek-V3",
      icon: <Cpu className="w-6 h-6 text-purple-400" />,
      desc: isZh ? "国产大模型之光，以极低的价格提供媲美GPT-4的编程能力。" : "The powerhouse from China, providing GPT-4 level coding at a fraction of the cost.",
      rating: "4.9"
    },
    {
      name: "GitHub Copilot",
      icon: <Code className="w-6 h-6 text-green-400" />,
      desc: isZh ? "老牌劲旅，生态最完善，支持多平台协作。" : "The industry veteran with the best ecosystem and multi-platform support.",
      rating: "4.7"
    },
    {
      name: "Claude 3.5 Sonnet",
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      desc: isZh ? "推理能力最强的模型，特别适合处理复杂算法。" : "The best reasoning model for complex algorithms and logic.",
      rating: "4.8"
    }
  ]

  return (
    <div className="min-h-screen bg-neutral-950 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-6">
            {isZh ? "代码进化的奇点：2026年顶尖AI代码助手盘点" : "The Coding Singularity: Best AI Coding Agents of 2026"}
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed">
            {isZh 
              ? "随着AGI时代的临近，编程已经从“写代码”变成了“与AI对话”。以下是今年改变游戏规则的4款工具。"
              : "As we approach the age of AGI, programming has shifted from writing code to conversing with AI. Here are the 4 tools changing the game this year."}
          </p>
        </div>

        <div className="space-y-8">
          {tools.map((tool, index) => (
            <div key={index} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:border-blue-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-neutral-800 rounded-xl">{tool.icon}</div>
                  <h2 className="text-2xl font-bold text-white">{tool.name}</h2>
                </div>
                <div className="flex items-center text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  <span className="font-bold">{tool.rating}</span>
                </div>
              </div>
              <p className="text-neutral-300 text-lg">{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
