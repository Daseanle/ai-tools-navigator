"use client"

import { motion } from "framer-motion"
import { Sparkles, TrendingUp, ArrowRight, Play } from "lucide-react"
import OptimizedSearchBar from "@/components/ui/optimized-search-bar"
import { containerVariants, itemVariants } from "@/lib/animations"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

export default function HeroSection() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const router = useRouter()
  const params = useParams()
  const lang = params.lang as string

  // 处理热门搜索点击
  const handleHotSearchClick = (term: string) => {
    router.push(`/${lang}/search?q=${encodeURIComponent(term)}`)
  }

  // 处理探索工具按钮点击
  const handleExploreClick = () => {
    router.push(`/${lang}/tools`)
  }

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative pt-24 sm:pt-32 pb-16 text-center overflow-hidden"
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div variants={itemVariants} className="space-y-6">
          {/* 标签 */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            发现最新AI工具
            <TrendingUp className="w-4 h-4 ml-2" />
          </motion.div>

          {/* 主标题 */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight"
          >
            发现{" "}
            <span className="relative">
              <span className="gradient-text">AI 工具</span>
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              />
            </span>{" "}
            的无限可能
          </motion.h1>

          {/* 副标题 */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-neutral-400 leading-relaxed max-w-3xl mx-auto"
          >
            探索、评测、精通。为你找到解决问题的最佳AI工具，提升工作效率，释放创造力。
            <br />
            <span className="text-blue-400 font-medium">已收录 1000+ 优质AI工具</span>
          </motion.p>
        </motion.div>

        {/* 搜索栏 */}
        <motion.div variants={itemVariants} className="pt-8">
          <OptimizedSearchBar placeholder="搜索AI工具、功能或解决方案..." className="max-w-2xl mx-auto" />

          {/* 热门搜索标签 */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
            <span className="text-neutral-500">热门搜索:</span>
            {["ChatGPT", "Midjourney", "Notion AI", "GitHub Copilot", "Claude"].map((term) => (
              <motion.button
                key={term}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleHotSearchClick(term)}
                className="px-3 py-1 rounded-full bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-300 hover:text-white transition-all duration-300 border border-neutral-700/50 hover:border-neutral-600/50 cursor-pointer"
              >
                {term}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* CTA 按钮组 */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExploreClick}
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 cursor-pointer"
          >
            开始探索
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsVideoPlaying(true)}
            className="group inline-flex items-center px-8 py-4 bg-transparent border-2 border-neutral-700/50 hover:border-neutral-600/50 text-neutral-300 hover:text-white font-semibold rounded-2xl transition-all duration-300 hover:bg-neutral-800/20 cursor-pointer"
          >
            <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            观看介绍
          </motion.button>
        </motion.div>

        {/* 信任指标 */}
        <motion.div variants={itemVariants} className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto">
          {[
            { label: "AI工具", value: "1000+" },
            { label: "用户", value: "50万+" },
            { label: "评价", value: "10万+" },
            { label: "更新", value: "每日" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-neutral-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* 视频模态框 */}
      {isVideoPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsVideoPlaying(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative w-full max-w-4xl aspect-video bg-neutral-900 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white z-10"
            >
              ×
            </button>
            {/* 这里可以嵌入实际的视频 */}
            <div className="w-full h-full flex items-center justify-center text-neutral-400">视频播放器占位符</div>
          </motion.div>
        </motion.div>
      )}
    </motion.section>
  )
}
