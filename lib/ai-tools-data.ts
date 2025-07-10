/**
 * Simplified AI tools data for build compatibility
 */

import type { Tool, Category } from "@/types"

// Minimal categories data for build compatibility
export const categories: Category[] = [
  {
    id: "1",
    name: "AI写作", 
    slug: "ai-writing",
    description: "AI辅助写作工具",
    tools_count: 25,
    featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Minimal tools data for build compatibility
export const aiTools: Tool[] = [
  {
    id: "1",
    slug: "chatgpt",
    name: "ChatGPT",
    tagline: "AI对话助手",
    description: "OpenAI开发的AI助手",
    website_url: "https://chat.openai.com",
    rating: 4.8,
    rating_count: 1000,
    visits: 100000,
    users_count: 100000000,
    upvotes_count: 15420,
    pricing_type: "freemium",
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category_id: "1"
  }
]

// Helper functions
export function getPopularTools(limit: number = 8): Tool[] {
  return aiTools.slice(0, limit)
}

export function getLatestTools(limit: number = 8): Tool[] {
  return aiTools.slice(0, limit)
}

export function getFreeTools(): Tool[] {
  return aiTools.filter(tool => tool.pricing_type === 'free' || tool.pricing_type === 'freemium')
}

export function getToolsByCategory(categorySlug: string): Tool[] {
  return aiTools.filter(tool => tool.category?.slug === categorySlug)
}

export function searchTools(query: string): Tool[] {
  return aiTools
}

export function getRecommendedTools(limit: number = 6): Tool[] {
  return aiTools.slice(0, limit)
}