"use client"

import { motion } from "framer-motion"
import ToolCard from "@/components/ui/tool-card"
import type { Tool } from "@/types"

interface ToolsGridProps {
  tools: Tool[]
  className?: string
}

export default function ToolsGrid({ tools, className = "" }: ToolsGridProps) {
  if (tools.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-white mb-2">暂无工具</h3>
        <p className="text-neutral-400">请尝试其他筛选条件</p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {tools.map((tool, index) => (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.1 * (index % 8),
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <ToolCard tool={tool} />
        </motion.div>
      ))}
    </div>
  )
}
