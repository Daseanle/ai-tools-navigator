'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface SearchBarProps {
  defaultValue?: string
  placeholder?: string
  className?: string
}

export default function SearchBar({ 
  defaultValue = '', 
  placeholder = 'Search AI tools...',
  className = '' 
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim()) return

    // Create new URLSearchParams to preserve existing filters
    const params = new URLSearchParams(searchParams.toString())
    params.set('search', query.trim())
    params.delete('page') // Reset to first page when searching
    
    router.push(`/tools?${params.toString()}`)
  }

  const handleClear = () => {
    setQuery('')
    
    // Remove search param but keep others
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    params.delete('page')
    
    router.push(`/tools?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          aria-label="Search AI tools"
        />
        
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-8 flex items-center pr-2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-600 focus:outline-none focus:text-blue-600"
          aria-label="Search"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
      
      {/* Search suggestions (optional future enhancement) */}
      {query.length > 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto hidden">
          {/* Suggestions would go here */}
        </div>
      )}
    </form>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
