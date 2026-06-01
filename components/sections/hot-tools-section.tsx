"use client"

import { motion } from "framer-motion"
import { ChevronRight, Star } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import ToolCard from "@/components/ui/tool-card"
import type { Tool } from "@/types"

interface HotToolsSectionProps {
  tools: Tool[]
}

export default function HotToolsSection({ tools }: HotToolsSectionProps) {
  const params = useParams()
  const lang = params.lang as string || 'zh'
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px 0px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="py-16"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
            <Star className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">热门工具</h2>
            <p className="text-gray-600 dark:text-gray-400">最受欢迎的AI工具推荐</p>
          </div>
        </div>
        <Link
          href={`/${lang}/tools`}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-300"
        >
          查看全部
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px 0px" }}
            transition={{
              duration: 0.5,
              delay: 0.1 * (index % 4),
              ease: [0.22, 1, 0.36, 1],
            }}
            className="h-full"
          >
            <ToolCard tool={tool} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
