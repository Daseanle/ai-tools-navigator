"use client"

import { useState, useCallback, useMemo } from "react"
import { Search, X, Clock, TrendingUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useDebounce } from "@/hooks/use-debounce"
import { searchTools } from "@/lib/api"
import type { Tool } from "@/types"

interface SearchSuggestion {
  id: string
  name: string
  type: "tool" | "category" | "recent"
  icon?: string
}

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const debouncedQuery = useDebounce(query, 300)

  // Fetch suggestions when debounced query changes
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const results = await searchTools(searchQuery, 5)
      const toolSuggestions: SearchSuggestion[] = results.map((tool: Tool) => ({
        id: tool.id.toString(),
        name: tool.name,
        type: "tool" as const,
        icon: tool.logo_url,
      }))
      setSuggestions(toolSuggestions)
    } catch (error) {
      console.error("Search failed:", error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Effect to fetch suggestions
  useMemo(() => {
    if (debouncedQuery) {
      fetchSuggestions(debouncedQuery)
    }
  }, [debouncedQuery, fetchSuggestions])

  const handleSearch = useCallback((searchTerm: string) => {
    if (searchTerm.trim()) {
      // Add to recent searches
      setRecentSearches((prev) => {
        const updated = [searchTerm, ...prev.filter((s) => s !== searchTerm)].slice(0, 5)
        localStorage.setItem("recentSearches", JSON.stringify(updated))
        return updated
      })

      // Navigate to search results
      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`
    }
  }, [])

  const clearQuery = () => {
    setQuery("")
    setSuggestions([])
  }

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="搜索 AI 工具、功能或解决方案..."
          className="w-full pl-12 pr-12 py-4 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl"
        />

        {query && (
          <button onClick={clearQuery} className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (query || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {isLoading && (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            )}

            {!isLoading && suggestions.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  搜索建议
                </div>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSearch(suggestion.name)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center space-x-3"
                  >
                    {suggestion.icon ? (
                      <img src={suggestion.icon || "/placeholder.svg"} alt="" className="w-6 h-6 rounded" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-gray-900 dark:text-white">{suggestion.name}</span>
                  </button>
                ))}
              </div>
            )}

            {!query && recentSearches.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  最近搜索
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center space-x-3"
                  >
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{search}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close suggestions */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
