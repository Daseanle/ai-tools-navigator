'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  description: string
  icon: string
  toolCount: number
  color: string
  trending?: boolean
}

const categories: Category[] = [
  {
    id: 'content-generation',
    name: 'Content Generation',
    description: 'AI tools for writing, copywriting, and content creation',
    icon: '✍️',
    toolCount: 32,
    color: 'blue',
    trending: true
  },
  {
    id: 'image-video',
    name: 'Image & Video',
    description: 'Computer vision, image generation, and video editing tools',
    icon: '🎨',
    toolCount: 28,
    color: 'purple'
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    description: 'Machine learning platforms and data science tools',
    icon: '📊',
    toolCount: 24,
    color: 'green',
    trending: true
  },
  {
    id: 'productivity',
    name: 'Productivity',
    description: 'Automation tools and workflow optimizers',
    icon: '⚡',
    toolCount: 20,
    color: 'yellow'
  },
  {
    id: 'development',
    name: 'Development',
    description: 'AI frameworks and programming assistants',
    icon: '💻',
    toolCount: 18,
    color: 'indigo'
  },
  {
    id: 'business',
    name: 'Business',
    description: 'AI solutions for enterprise and business operations',
    icon: '💼',
    toolCount: 16,
    color: 'gray'
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Learning platforms and educational AI tools',
    icon: '🎓',
    toolCount: 12,
    color: 'red'
  },
  {
    id: 'research',
    name: 'Research',
    description: 'Scientific research and academic tools',
    icon: '🔬',
    toolCount: 10,
    color: 'teal'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Digital marketing and advertising tools',
    icon: '📢',
    toolCount: 14,
    color: 'pink'
  }
]

const getColorClasses = (color: string) => {
  const colors = {
    blue: {
      bg: 'bg-blue-50 hover:bg-blue-100',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-800'
    },
    purple: {
      bg: 'bg-purple-50 hover:bg-purple-100',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      text: 'text-purple-700',
      badge: 'bg-purple-100 text-purple-800'
    },
    green: {
      bg: 'bg-green-50 hover:bg-green-100',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-800'
    },
    yellow: {
      bg: 'bg-yellow-50 hover:bg-yellow-100',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      text: 'text-yellow-700',
      badge: 'bg-yellow-100 text-yellow-800'
    },
    indigo: {
      bg: 'bg-indigo-50 hover:bg-indigo-100',
      border: 'border-indigo-200',
      icon: 'text-indigo-600',
      text: 'text-indigo-700',
      badge: 'bg-indigo-100 text-indigo-800'
    },
    gray: {
      bg: 'bg-gray-50 hover:bg-gray-100',
      border: 'border-gray-200',
      icon: 'text-gray-600',
      text: 'text-gray-700',
      badge: 'bg-gray-100 text-gray-800'
    },
    red: {
      bg: 'bg-red-50 hover:bg-red-100',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-800'
    },
    teal: {
      bg: 'bg-teal-50 hover:bg-teal-100',
      border: 'border-teal-200',
      icon: 'text-teal-600',
      text: 'text-teal-700',
      badge: 'bg-teal-100 text-teal-800'
    },
    pink: {
      bg: 'bg-pink-50 hover:bg-pink-100',
      border: 'border-pink-200',
      icon: 'text-pink-600',
      text: 'text-pink-700',
      badge: 'bg-pink-100 text-pink-800'
    }
  }
  
  return colors[color as keyof typeof colors] || colors.gray
}

export default function CategoriesGrid() {
  return (
    <div>
      {/* Stats Section */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">150+</div>
          <div className="text-sm text-gray-600">Total Tools</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">9</div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">50+</div>
          <div className="text-sm text-gray-600">Free Tools</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">4.7</div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const colorClasses = getColorClasses(category.color)
          
          return (
            <Link
              key={category.id}
              href={`/tools?category=${category.id}`}
              className={cn(
                'relative group block p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md',
                colorClasses.bg,
                colorClasses.border
              )}
            >
              {/* Trending Badge */}
              {category.trending && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    🔥 Trending
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={cn('text-4xl mb-4', colorClasses.icon)}>
                {category.icon}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className={cn('text-xl font-semibold group-hover:underline', colorClasses.text)}>
                  {category.name}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  {category.description}
                </p>
                
                {/* Tool Count */}
                <div className="flex items-center justify-between mt-4">
                  <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', colorClasses.badge)}>
                    {category.toolCount} tools
                  </span>
                  
                  <svg
                    className={cn('w-5 h-5 group-hover:translate-x-1 transition-transform', colorClasses.icon)}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Popular Tools by Category */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Tools by Category</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Content Generation Tools */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">✍️</span>
              <h3 className="text-lg font-semibold text-gray-900">Content Generation</h3>
            </div>
            <div className="space-y-3">
              {['ChatGPT', 'Jasper', 'Copy.ai', 'Writesonic'].map((tool, index) => (
                <div key={tool} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-gray-700">{tool}</span>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">4.{8-index}</span>
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
            <Link 
              href="/tools?category=content-generation"
              className="inline-flex items-center mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all content tools
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Image & Video Tools */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">🎨</span>
              <h3 className="text-lg font-semibold text-gray-900">Image & Video</h3>
            </div>
            <div className="space-y-3">
              {['Midjourney', 'DALL-E 2', 'Stable Diffusion', 'RunwayML'].map((tool, index) => (
                <div key={tool} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-gray-700">{tool}</span>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">4.{7-index}</span>
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
            <Link 
              href="/tools?category=image-video"
              className="inline-flex items-center mt-4 text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              View all image tools
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
