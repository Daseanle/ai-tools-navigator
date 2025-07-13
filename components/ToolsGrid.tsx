'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Tool {
  id: string
  name: string
  description: string
  category: string
  logo?: string
  rating: number
  pricing: 'free' | 'freemium' | 'paid'
  url: string
  tags: string[]
  featured?: boolean
}

interface ToolsGridProps {
  category?: string
  search?: string
  sort?: string
  page?: number
}

// Mock data - In a real app, this would come from an API
const mockTools: Tool[] = [
  {
    id: '1',
    name: 'ChatGPT',
    description: 'Advanced AI chatbot for conversations, content creation, and problem-solving.',
    category: 'content-generation',
    logo: '/tools/chatgpt.png',
    rating: 4.8,
    pricing: 'freemium',
    url: 'https://chat.openai.com',
    tags: ['chatbot', 'writing', 'conversation'],
    featured: true
  },
  {
    id: '2',
    name: 'Midjourney',
    description: 'AI-powered image generation tool for creating stunning artwork and designs.',
    category: 'image-video',
    logo: '/tools/midjourney.png',
    rating: 4.7,
    pricing: 'paid',
    url: 'https://midjourney.com',
    tags: ['image-generation', 'art', 'design'],
    featured: true
  },
  {
    id: '3',
    name: 'GitHub Copilot',
    description: 'AI pair programmer that helps you write code faster and with fewer errors.',
    category: 'development',
    logo: '/tools/copilot.png',
    rating: 4.6,
    pricing: 'paid',
    url: 'https://github.com/copilot',
    tags: ['coding', 'programming', 'development']
  },
  {
    id: '4',
    name: 'Notion AI',
    description: 'AI-powered writing assistant integrated into your favorite workspace.',
    category: 'productivity',
    logo: '/tools/notion.png',
    rating: 4.5,
    pricing: 'freemium',
    url: 'https://notion.so',
    tags: ['writing', 'productivity', 'workspace']
  },
  {
    id: '5',
    name: 'Tableau',
    description: 'Advanced data visualization and business intelligence platform.',
    category: 'data-analysis',
    logo: '/tools/tableau.png',
    rating: 4.4,
    pricing: 'paid',
    url: 'https://tableau.com',
    tags: ['data-viz', 'analytics', 'business-intelligence']
  },
  {
    id: '6',
    name: 'Grammarly',
    description: 'AI writing assistant that helps improve grammar, clarity, and tone.',
    category: 'content-generation',
    logo: '/tools/grammarly.png',
    rating: 4.3,
    pricing: 'freemium',
    url: 'https://grammarly.com',
    tags: ['writing', 'grammar', 'editing']
  }
]

export default function ToolsGrid({ category, search, sort = 'popular', page = 1 }: ToolsGridProps) {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Simulate API call
    const fetchTools = async () => {
      setLoading(true)
      
      // Filter tools based on criteria
      let filteredTools = [...mockTools]
      
      // Apply category filter
      if (category && category !== 'all') {
        filteredTools = filteredTools.filter(tool => tool.category === category)
      }
      
      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase()
        filteredTools = filteredTools.filter(tool =>
          tool.name.toLowerCase().includes(searchLower) ||
          tool.description.toLowerCase().includes(searchLower) ||
          tool.tags.some(tag => tag.toLowerCase().includes(searchLower))
        )
      }
      
      // Apply sorting
      switch (sort) {
        case 'newest':
          // In a real app, you'd sort by creation date
          filteredTools.reverse()
          break
        case 'rating':
          filteredTools.sort((a, b) => b.rating - a.rating)
          break
        case 'name':
          filteredTools.sort((a, b) => a.name.localeCompare(b.name))
          break
        case 'free':
          filteredTools.sort((a, b) => {
            const order = { free: 0, freemium: 1, paid: 2 }
            return order[a.pricing] - order[b.pricing]
          })
          break
        case 'popular':
        default:
          // Default sorting (featured first, then by rating)
          filteredTools.sort((a, b) => {
            if (a.featured && !b.featured) return -1
            if (!a.featured && b.featured) return 1
            return b.rating - a.rating
          })
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setTools(filteredTools)
      setLoading(false)
    }

    fetchTools()
  }, [category, search, sort, page])

  const toggleFavorite = (toolId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(toolId)) {
        newFavorites.delete(toolId)
      } else {
        newFavorites.add(toolId)
      }
      return newFavorites
    })
  }

  const getPricingColor = (pricing: Tool['pricing']) => {
    switch (pricing) {
      case 'free':
        return 'bg-green-100 text-green-800'
      case 'freemium':
        return 'bg-blue-100 text-blue-800'
      case 'paid':
        return 'bg-orange-100 text-orange-800'
    }
  }

  const getPricingText = (pricing: Tool['pricing']) => {
    switch (pricing) {
      case 'free':
        return 'Free'
      case 'freemium':
        return 'Freemium'
      case 'paid':
        return 'Paid'
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-4/5"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (tools.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No tools found</h3>
        <p className="mt-2 text-gray-500">
          Try adjusting your search or filter criteria to find more tools.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden group relative"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {tool.logo ? (
                      <Image
                        src={tool.logo}
                        alt={`${tool.name} logo`}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <span className="text-lg font-bold text-gray-600">
                        {tool.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {tool.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <svg
                            key={index}
                            className={cn(
                              'w-4 h-4',
                              index < Math.floor(tool.rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            )}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-sm text-gray-600 ml-1">
                          {tool.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleFavorite(tool.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label={favorites.has(tool.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg
                    className={cn(
                      'w-5 h-5',
                      favorites.has(tool.id) ? 'text-red-500 fill-current' : 'text-gray-400'
                    )}
                    fill={favorites.has(tool.id) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 overflow-hidden" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {tool.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {tool.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
                {tool.tags.length > 3 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    +{tool.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getPricingColor(tool.pricing))}>
                  {getPricingText(tool.pricing)}
                </span>
                
                <Link
                  href={`/tools/${tool.id}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group-hover:bg-blue-100"
                >
                  View Tool
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Featured Badge */}
              {tool.featured && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⭐ Featured
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {tools.length > 0 && (
        <div className="mt-12 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(20, tools.length)}</span> of{' '}
            <span className="font-medium">{tools.length}</span> results
          </div>
          
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              disabled={page <= 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              1
            </button>
            
            <button
              disabled={true}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </>
  )
}