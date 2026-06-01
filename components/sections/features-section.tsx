"use client"

import { motion } from "framer-motion"
import { Sparkles, Zap, BarChart, Shield, Clock, Users } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "智能推荐",
    description: "基于您的需求和使用习惯，智能推荐最适合的AI工具",
  },
  {
    icon: Zap,
    title: "快速集成",
    description: "一键集成到您的工作流中，快速提升工作效率",
  },
  {
    icon: BarChart,
    title: "数据分析",
    description: "详细的性能数据和用户评价，助您做出最佳选择",
  },
  {
    icon: Shield,
    title: "安全可靠",
    description: "严格筛选，确保推荐的工具安全可靠，值得信赖",
  },
  {
    icon: Clock,
    title: "实时更新",
    description: "持续跟踪最新AI工具动态，第一时间为您推荐",
  },
  {
    icon: Users,
    title: "社区驱动",
    description: "基于真实用户反馈和评价的推荐系统",
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px 0px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">为什么选择我们</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          我们致力于为您提供最优质的AI工具发现和评测服务
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px 0px" }}
            transition={{
              duration: 0.5,
              delay: 0.1 * index,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-gray-200/30 dark:hover:shadow-gray-900/20 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <feature.icon className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
