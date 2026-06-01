'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface FilterBarProps {
  selectedCategory?: string
  selectedSort?: string
}

const categories = [
  { id: 'all', name: 'All Categories', count: 150 },
  { id: 'content-generation', name: 'Content Generation', count: 32 },
  { id: 'image-video', name: 'Image & Video', count: 28 },
  { id: 'data-analysis', name: 'Data Analysis', count: 24 },
  { id: 'productivity', name: 'Productivity', count: 20 },
  { id: 'development', name: 'Development', count: 18 },
  { id: 'business', name: 'Business', count: 16 },
  { id: 'education', name: 'Education', count: 12 },
]

const sortOptions = [
  { id: 'popular', name: 'Most Popular', icon: '🔥' },
  { id: 'newest', name: 'Newest', icon: '🆕' },
  { id: 'rating', name: 'Highest Rated', icon: '⭐' },
  { id: 'name', name: 'Alphabetical', icon: '🔤' },
  { id: 'free', name: 'Free First', icon: '💸' },
]

export default function FilterBar({ selectedCategory = 'all', selectedSort = 'popular' }: FilterBarProps) {
  const [showCategories, setShowCategories] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === 'all' && key === 'category') {
      params.delete('category')
    } else {
      params.set(key, value)
    }
    
    params.delete('page') // Reset to first page when filtering
    
    router.push(`/tools?${params.toString()}`)
  }

  const currentCategory = categories.find(cat => cat.id === selectedCategory) || categories[0]
  const currentSort = sortOptions.find(sort => sort.id === selectedSort) || sortOptions[0]

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Category Filter */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowCategories(!showCategories)}
          className="inline-flex items-center justify-between w-full sm:w-auto min-w-[200px] px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-expanded={showCategories}
          aria-haspopup="true"
        >
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {currentCategory.name}
          </span>
          <svg className={cn('w-4 h-4 ml-2 transition-transform', showCategories && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showCategories && (
          <div className="absolute z-10 mt-1 w-full sm:w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="py-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    updateFilter('category', category.id)
                    setShowCategories(false)
                  }}
                  className={cn(
                    'flex items-center justify-between w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors',
                    category.id === selectedCategory ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  )}
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-500">({category.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sort Filter */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowSort(!showSort)}
          className="inline-flex items-center justify-between w-full sm:w-auto min-w-[180px] px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-expanded={showSort}
          aria-haspopup="true"
        >
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span className="mr-1">{currentSort.icon}</span>
            {currentSort.name}
          </span>
          <svg className={cn('w-4 h-4 ml-2 transition-transform', showSort && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showSort && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="py-1">
              {sortOptions.map((sort) => (
                <button
                  key={sort.id}
                  onClick={() => {
                    updateFilter('sort', sort.id)
                    setShowSort(false)
                  }}
                  className={cn(
                    'flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors',
                    sort.id === selectedSort ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  )}
                >
                  <span className="mr-2">{sort.icon}</span>
                  {sort.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {(selectedCategory !== 'all' || selectedSort !== 'popular') && (
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.delete('category')
            params.delete('sort')
            params.delete('page')
            router.push(`/tools?${params.toString()}`)
          }}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear Filters
        </button>
      )}

      {/* Results Count */}
      <div className="hidden sm:flex items-center text-sm text-gray-500 ml-auto">
        <span>Showing 1-20 of 150 tools</span>
      </div>
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
