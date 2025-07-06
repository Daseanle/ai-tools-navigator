export interface Tool {
  id: number
  slug: string
  name: string
  tagline: string
  description?: string
  logo_url?: string
  website_url?: string
  rating?: number
  users_count?: number
  upvotes_count?: number
  pricing_type?: "free" | "freemium" | "paid"
  created_at?: string
  updated_at?: string
  category?: {
    id: number
    name: string
    slug: string
    description?: string | null
    icon?: string
  }
  tags?: Array<{
    id: number
    name: string
    slug: string
    color?: string
  }>
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  tools_count?: number
  color?: string | null
  sort_order?: number | null
  is_active?: boolean | null
  created_at?: string | null
  updated_at?: string | null
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
