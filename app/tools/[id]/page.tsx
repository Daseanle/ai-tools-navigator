'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

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
  longDescription?: string
}

// Mock data matching the tools grid
const mockTools: Tool[] = [
  {
    id: '1',
    name: 'ChatGPT',
    description: 'Advanced AI chatbot for conversations, content creation, and problem-solving.',
    longDescription: 'ChatGPT is a state-of-the-art conversational AI developed by OpenAI. It can help with writing, analysis, math, coding, creative tasks, and much more. The model is designed to be helpful, harmless, and honest in its interactions.',
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
    longDescription: 'Midjourney is an independent research lab exploring new mediums of thought and expanding the imaginative powers of the human species. Their AI image generation tool creates beautiful, artistic images from text descriptions.',
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
    longDescription: 'GitHub Copilot is an AI coding assistant that helps developers write code faster and with fewer errors. It provides autocomplete-style suggestions and can generate entire functions from comments.',
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
    longDescription: 'Notion AI brings the power of artificial intelligence directly to your Notion workspace. It can help with writing, brainstorming, summarizing, and organizing your thoughts and content.',
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
    longDescription: 'Tableau is a leading data visualization and business intelligence platform that helps people see and understand their data. It connects to almost any database, drag and drop to create visualizations, and share with a click.',
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
    longDescription: 'Grammarly is a comprehensive writing assistant that uses AI to help you write clearly and effectively. It checks for grammar, spelling, punctuation, clarity, engagement, and delivery mistakes.',
    category: 'content-generation',
    logo: '/tools/grammarly.png',
    rating: 4.3,
    pricing: 'freemium',
    url: 'https://grammarly.com',
    tags: ['writing', 'grammar', 'editing']
  }
]

export default function ToolDetailPage() {
  const params = useParams()
  const toolId = params.id as string
  
  const tool = mockTools.find(t => t.id === toolId)
  
  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tool Not Found</h1>
          <p className="text-gray-600 mb-4">The tool you're looking for doesn't exist.</p>
          <Link 
            href="/tools" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Tools
          </Link>
        </div>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/tools" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Tools
          </Link>
        </div>
      </nav>

      {/* Tool Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-start space-x-6 mb-8">
              <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                {tool.logo ? (
                  <Image
                    src={tool.logo}
                    alt={`${tool.name} logo`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-600">
                    {tool.name.charAt(0)}
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool.name}</h1>
                    <p className="text-lg text-gray-600 mb-4">{tool.description}</p>
                    
                    {/* Rating and Pricing */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <svg
                            key={index}
                            className={`w-5 h-5 ${
                              index < Math.floor(tool.rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-sm text-gray-600 ml-2">
                          {tool.rating.toFixed(1)} / 5.0
                        </span>
                      </div>
                      
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPricingColor(tool.pricing)}`}>
                        {getPricingText(tool.pricing)}
                      </span>
                    </div>
                  </div>
                  
                  {tool.featured && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      ⭐ Featured
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Long Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About {tool.name}</h2>
              <p className="text-gray-700 leading-relaxed">
                {tool.longDescription || tool.description}
              </p>
            </div>

            {/* Tags */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="border-t pt-8">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Visit {tool.name}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}