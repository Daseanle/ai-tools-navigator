"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { Search, X, Clock, TrendingUp, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useDebounce } from "@/hooks/use-debounce"
import { searchTools } from "@/lib/api"
import type { Tool } from "@/types"

interface SearchSuggestion {
  id: string
  name: string
  type: "tool" | "category" | "recent"
  icon?: string
  description?: string
}

interface OptimizedSearchBarProps {
  placeholder?: string
  className?: string
  initialQuery?: string
  compact?: boolean
  showSuggestions?: boolean
}

export default function OptimizedSearchBar({
  placeholder = "搜索AI工具...",
  className = "",
  initialQuery = "",
  compact = false,
  showSuggestions = true,
}: OptimizedSearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const router = useRouter()
  const params = useParams()
  const lang = params.lang as string
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(query, 300)

  // 加载最近搜索记录
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches")
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored))
      } catch (error) {
        console.error("Failed to parse recent searches:", error)
      }
    }
  }, [])

  // 获取搜索建议
  const fetchSuggestions = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || !showSuggestions) {
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
          description: tool.tagline,
        }))
        setSuggestions(toolSuggestions)
      } catch (error) {
        console.error("Search failed:", error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    },
    [showSuggestions],
  )

  // 防抖搜索
  useEffect(() => {
    if (debouncedQuery && isOpen) {
      fetchSuggestions(debouncedQuery)
    }
  }, [debouncedQuery, fetchSuggestions, isOpen])

  // 处理搜索
  const handleSearch = useCallback(
    (searchTerm: string) => {
      if (searchTerm.trim()) {
        // 添加到最近搜索
        const updatedRecent = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5)
        setRecentSearches(updatedRecent)
        localStorage.setItem("recentSearches", JSON.stringify(updatedRecent))

        // 导航到搜索结果页
        router.push(`/${lang}/search?q=${encodeURIComponent(searchTerm)}`)
        setIsOpen(false)
        inputRef.current?.blur()
      }
    },
    [recentSearches, router, lang],
  )

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = suggestions.length + (query ? 0 : recentSearches.length)

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : -1))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > -1 ? prev - 1 : totalItems - 1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex === -1) {
          handleSearch(query)
        } else {
          const allItems = query ? suggestions : recentSearches
          const selectedItem = allItems[selectedIndex]
          if (selectedItem) {
            const searchTerm = typeof selectedItem === "string" ? selectedItem : selectedItem.name
            setQuery(searchTerm)
            handleSearch(searchTerm)
          }
        }
        break
      case "Escape":
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const clearQuery = () => {
    setQuery("")
    setSuggestions([])
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSearch(query)
        }}
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4">
            <Search className="text-neutral-400" size={compact ? 16 : 20} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full bg-neutral-900/80 backdrop-blur-sm border border-neutral-700/50 rounded-full focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none text-white placeholder-neutral-400 transition-all duration-300 ${
              compact ? "px-4 py-2 pl-10 text-sm" : "px-5 py-4 pl-12 text-lg"
            } hover:bg-neutral-800/80 hover:border-neutral-600/50`}
            autoComplete="off"
            spellCheck="false"
          />

          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {query && (
              <button
                type="button"
                onClick={clearQuery}
                className="p-2 text-neutral-400 hover:text-neutral-300 transition-colors rounded-full hover:bg-neutral-800"
              >
                <X size={compact ? 14 : 16} />
              </button>
            )}

            <button
              type="submit"
              className="ml-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Search size={compact ? 14 : 16} />
            </button>
          </div>
        </div>
      </form>

      <AnimatePresence>
        {isOpen && showSuggestions && (query || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full mt-2 w-full bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto"
          >
            {isLoading && (
              <div className="p-4 text-center">
                <Loader2 className="inline-block animate-spin h-5 w-5 text-blue-500" />
                <span className="ml-2 text-sm text-neutral-400">搜索中...</span>
              </div>
            )}

            {!isLoading && suggestions.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">搜索建议</div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    onClick={() => {
                      setQuery(suggestion.name)
                      handleSearch(suggestion.name)
                    }}
                    className={`w-full px-4 py-3 text-left transition-colors flex items-center space-x-3 ${
                      selectedIndex === index ? "bg-blue-600/20 text-blue-400" : "hover:bg-neutral-800/50 text-white"
                    }`}
                  >
                    {suggestion.icon ? (
                      <img
                        src={suggestion.icon || "/placeholder.svg"}
                        alt=""
                        className="w-6 h-6 rounded flex-shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{suggestion.name}</div>
                      {suggestion.description && (
                        <div className="text-xs text-neutral-400 truncate mt-0.5">{suggestion.description}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!query && recentSearches.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">最近搜索</div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(search)
                      handleSearch(search)
                    }}
                    className={`w-full px-4 py-3 text-left transition-colors flex items-center space-x-3 ${
                      selectedIndex === index ? "bg-blue-600/20 text-blue-400" : "hover:bg-neutral-800/50 text-white"
                    }`}
                  >
                    <Clock className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                    <span className="truncate">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {!isLoading && !query && recentSearches.length === 0 && suggestions.length === 0 && (
              <div className="p-4 text-center text-neutral-500 text-sm">开始输入以搜索AI工具</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
