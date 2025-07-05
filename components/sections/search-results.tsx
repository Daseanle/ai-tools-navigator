"use client"

import { Search } from "lucide-react"
import ToolsGrid from "./tools-grid"
import type { Tool } from "@/types"

interface SearchResultsProps {
  query: string
  results: Tool[]
}

export default function SearchResults({ query, results }: SearchResultsProps) {
  if (!query) {
    return (
      <div className="text-center py-16">
        <Search className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">开始搜索</h2>
        <p className="text-neutral-400">输入关键词搜索你需要的AI工具</p>
      </div>
    )
  }

  return (
    <div>
      {/* 搜索结果标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">搜索结果: "{query}"</h1>
        <p className="text-neutral-400">找到 {results.length} 个相关工具</p>
      </div>

      {/* 搜索结果 */}
      <ToolsGrid tools={results} />
    </div>
  )
}
