export interface Tool {
  id: number
  slug: string
  name: string
  tagline?: string
  description?: string
  logo_url?: string
  website_url?: string
  tags?: Array<string | { name: string }>
  rating?: number
  users_count?: number
  category_id?: number
  category?: string
  created_at?: string
  updated_at?: string
  is_featured?: boolean
  pricing_type?: "free" | "freemium" | "paid"
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  icon?: string
  tools_count?: number
  color?: string
}

export interface SearchResult {
  tools: Tool[]
  categories: Category[]
  total: number
  page: number
  limit: number
  query: string
}

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Bookmark {
  id: number
  user_id: string
  tool_id: number
  created_at: string
}
