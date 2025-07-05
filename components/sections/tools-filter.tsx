"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter, X } from "lucide-react"
import type { Category } from "@/types"

interface ToolsFilterProps {
  categories: Category[]
}

export default function ToolsFilter({ categories }: ToolsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const currentCategory = searchParams.get("category")
  const currentSort = searchParams.get("sort") || "rating"
  const currentPricing = searchParams.get("pricing")

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/zh/tools")
  }

  const hasActiveFilters = currentCategory || currentPricing

  return (
    <div className="mb-8">
      {/* 移动端筛选按钮 */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-neutral-800/50 rounded-xl text-white"
        >
          <Filter className="w-4 h-4" />
          <span>筛选</span>
          {hasActiveFilters && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
        </button>
      </div>

      {/* 筛选器 */}
      <div className={`glass rounded-2xl p-6 ${isOpen ? "block" : "hidden lg:block"}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateFilter("category", null)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                !currentCategory
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50"
              }`}
            >
              全部分类
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => updateFilter("category", category.slug)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentCategory === category.slug
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* 排序和定价 */}
          <div className="flex items-center space-x-4">
            {/* 排序 */}
            <select
              value={currentSort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="px-3 py-2 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-white text-sm"
            >
              <option value="rating">按评分排序</option>
              <option value="users">按用户数排序</option>
              <option value="created">按创建时间排序</option>
            </select>

            {/* 定价筛选 */}
            <select
              value={currentPricing || ""}
              onChange={(e) => updateFilter("pricing", e.target.value || null)}
              className="px-3 py-2 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-white text-sm"
            >
              <option value="">全部价格</option>
              <option value="free">免费</option>
              <option value="freemium">免费增值</option>
              <option value="paid">付费</option>
            </select>

            {/* 清除筛选 */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 px-3 py-2 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
                <span className="text-sm">清除</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
