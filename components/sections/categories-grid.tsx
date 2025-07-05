"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import type { Category } from "@/types"

interface CategoriesGridProps {
  categories: Category[]
}

export default function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.1 * index,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <Link
            href={`/zh/categories/${category.slug}`}
            className="group block glass rounded-2xl p-8 hover:scale-105 transition-all duration-300"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <span className="text-3xl">{category.icon || "📁"}</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {category.name}
              </h3>
              <p className="text-neutral-400 text-sm mb-4 line-clamp-2">
                {category.description || `探索 ${category.name} 相关的AI工具`}
              </p>
              <div className="text-blue-400 text-sm font-medium">{category.tools_count || 0} 个工具</div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
