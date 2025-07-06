"use client"

import { motion } from "framer-motion"
import { ChevronRight, Folder } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import type { Category } from "@/types"

interface CategorySectionProps {
  categories: Category[]
}

export default function CategorySection({ categories }: CategorySectionProps) {
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
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <Folder className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">分类浏览</h2>
            <p className="text-gray-600 dark:text-gray-400">按类别探索AI工具</p>
          </div>
        </div>
        <Link
          href={`/${lang}/categories`}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/30 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all duration-300"
        >
          查看全部
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: 0.05 * index,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Link
                href={`/${lang}/categories/${category.slug}`}
                className="block p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg hover:shadow-gray-200/30 dark:hover:shadow-gray-900/20 transition-all duration-300 text-center"
              >
                <div className="w-8 h-8 mx-auto mb-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <span className="text-lg">{category.icon || "📁"}</span>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{category.tools_count} 个工具</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
