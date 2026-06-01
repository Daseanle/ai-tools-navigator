// ==================== Core Types ====================

export interface Tool {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  logo_url?: string
  website_url: string
  rating: number
  rating_count: number
  visits: number
  users_count?: number
  upvotes_count?: number
  pricing_type: "free" | "freemium" | "paid"
  featured: boolean
  created_at: string
  updated_at: string
  category_id: string
  category?: Category
  tags?: Tag[]
  screenshots?: string[]
  is_favorite?: boolean
  user_rating?: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  tools_count: number
  featured: boolean
  sort_order?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  color?: string
  tools_count?: number
}

// ==================== User Types ====================

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  membership: UserMembership
  settings: UserSettings
  created_at: string
  updated_at: string
}

export interface UserMembership {
  type: 'free' | 'experience' | 'industry' | 'team'
  expires_at?: string
  is_active: boolean
  features: string[]
  limits: {
    favorites: number
    searches_per_day: number
    api_calls_per_month: number
    trial_tools: number
  }
}

export interface UserSettings {
  language: 'zh' | 'en'
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    browser: boolean
    new_tools: boolean
    updates: boolean
    marketing: boolean
  }
  privacy: {
    profile_public: boolean
    usage_analytics: boolean
    data_sharing: boolean
  }
  display: {
    grid_size: 'small' | 'medium' | 'large'
    show_ratings: boolean
    show_pricing: boolean
    auto_play_videos: boolean
  }
  search: {
    safe_search: boolean
    include_beta: boolean
    preferred_categories: string[]
  }
  ai: {
    enable_recommendations: boolean
    enable_auto_tagging: boolean
    enable_content_generation: boolean
  }
  accessibility: {
    high_contrast: boolean
    reduced_motion: boolean
    large_text: boolean
    screen_reader: boolean
  }
}

export interface UserFavorite {
  id: string
  user_id: string
  tool_id: string
  created_at: string
  tool?: Tool
}

export interface UserRating {
  id: string
  user_id: string
  tool_id: string
  rating: number
  comment?: string
  created_at: string
  updated_at: string
  tool?: Tool
}

export interface UserTrial {
  id: string
  user_id: string
  trial_type: 'membership' | 'feature' | 'tool'
  trial_id: string
  started_at: string
  expires_at: string
  is_active: boolean
  usage_count: number
  usage_limit: number
}

// ==================== Search & Filter Types ====================

export interface SearchResult {
  tools: Tool[]
  categories: Category[]
  total: number
  page: number
  limit: number
  query: string
  filters: SearchFilters
}

export interface SearchFilters {
  category?: string
  pricing?: 'free' | 'freemium' | 'paid'
  rating?: number
  tags?: string[]
  featured?: boolean
  sortBy: 'name' | 'rating' | 'visits' | 'created_at' | 'updated_at'
  sortOrder: 'asc' | 'desc'
}

export interface AutocompleteResult {
  query: string
  suggestions: {
    tools: Array<{ id: string; name: string; slug: string }>
    categories: Array<{ id: string; name: string; slug: string }>
    tags: Array<{ id: string; name: string; slug: string }>
  }
}

// ==================== Community Types ====================

export interface CommunityPost {
  id: string
  user_id: string
  title: string
  content: string
  type: 'discussion' | 'question' | 'showcase' | 'feedback' | 'announcement'
  category: 'general' | 'tools' | 'prompts' | 'tutorials' | 'news' | 'help'
  status: 'active' | 'closed' | 'hidden'
  upvotes: number
  downvotes: number
  comments_count: number
  views_count: number
  is_pinned: boolean
  created_at: string
  updated_at: string
  user?: User
  comments?: CommunityComment[]
  user_vote?: 'up' | 'down'
}

export interface CommunityComment {
  id: string
  post_id: string
  user_id: string
  parent_id?: string
  content: string
  upvotes: number
  downvotes: number
  created_at: string
  updated_at: string
  user?: User
  replies?: CommunityComment[]
  user_vote?: 'up' | 'down'
}

export interface CommunityVote {
  id: string
  user_id: string
  target_type: 'post' | 'comment'
  target_id: string
  vote_type: 'up' | 'down'
  created_at: string
}

// ==================== Prompt Market Types ====================

export interface Prompt {
  id: string
  title: string
  description: string
  content: string
  category_id: string
  creator_id: string
  price: number
  currency: 'USD' | 'CNY'
  rating: number
  rating_count: number
  downloads: number
  tags: string[]
  is_free: boolean
  is_featured: boolean
  status: 'active' | 'pending' | 'rejected'
  created_at: string
  updated_at: string
  category?: PromptCategory
  creator?: User
}

export interface PromptCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  prompts_count: number
}

export interface PromptPurchase {
  id: string
  user_id: string
  prompt_id: string
  price: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_at: string
  prompt?: Prompt
}

// ==================== Payment & Commerce Types ====================

export interface PaymentOrder {
  id: string
  user_id: string
  type: 'membership' | 'prompt' | 'credits'
  item_id: string
  amount: number
  currency: 'USD' | 'CNY'
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  payment_method: 'wechat' | 'alipay' | 'stripe' | 'paypal'
  created_at: string
  completed_at?: string
}

export interface AffiliateLinkClick {
  id: string
  link_id: string
  user_id?: string
  ip_address: string
  user_agent: string
  referrer?: string
  clicked_at: string
}

export interface AffiliateEarning {
  id: string
  partner_id: string
  tool_id: string
  user_id: string
  commission_rate: number
  amount: number
  currency: string
  status: 'pending' | 'approved' | 'paid'
  created_at: string
  paid_at?: string
}

// ==================== Analytics Types ====================

export interface AnalyticsEvent {
  id: string
  user_id?: string
  session_id: string
  event_type: string
  event_data: Record<string, any>
  page_url: string
  referrer?: string
  user_agent: string
  ip_address: string
  timestamp: string
}

export interface PerformanceMetrics {
  id: string
  page_url: string
  metric_name: string
  metric_value: number
  timestamp: string
  user_agent: string
}

export interface UserSession {
  id: string
  user_id?: string
  session_id: string
  started_at: string
  ended_at?: string
  page_views: number
  events_count: number
  duration_seconds?: number
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

// ==================== Automation Types ====================

export interface AutomationTask {
  id: string
  type: 'content_generation' | 'seo_optimization' | 'user_analysis' | 'competitor_analysis'
  status: 'pending' | 'running' | 'completed' | 'failed'
  config: Record<string, any>
  result?: Record<string, any>
  error_message?: string
  scheduled_at?: string
  started_at?: string
  completed_at?: string
  created_at: string
}

export interface ContentGenerationLog {
  id: string
  task_id: string
  tool_id: string
  content_type: 'description' | 'review' | 'tutorial' | 'comparison'
  generated_content: string
  ai_model: string
  tokens_used: number
  cost: number
  created_at: string
}

export interface SEOOptimizationLog {
  id: string
  task_id: string
  page_url: string
  optimization_type: 'meta_tags' | 'keywords' | 'content' | 'schema'
  before_data: Record<string, any>
  after_data: Record<string, any>
  score_improvement: number
  created_at: string
}

// ==================== API Response Types ====================

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ==================== Error Types ====================

export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
}

export interface ValidationError {
  field: string
  message: string
  value?: any
}

// ==================== UI State Types ====================

export interface UIState {
  theme: 'light' | 'dark' | 'system'
  language: 'zh' | 'en'
  sidebarOpen: boolean
  searchQuery: string
  selectedCategory: string | null
  loading: boolean
  error: string | null
  filters: SearchFilters
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
}

// ==================== Form Types ====================

export interface LoginForm {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  terms: boolean
}

export interface ProfileUpdateForm {
  name: string
  avatar_url?: string
  settings: Partial<UserSettings>
}

export interface ToolSubmissionForm {
  name: string
  tagline: string
  description: string
  website_url: string
  logo_url?: string
  category_id: string
  tags: string[]
  pricing_type: 'free' | 'freemium' | 'paid'
  screenshots?: string[]
}

// ==================== Configuration Types ====================

export interface AppConfig {
  app: {
    name: string
    version: string
    environment: 'development' | 'staging' | 'production'
    baseUrl: string
  }
  api: {
    baseUrl: string
    timeout: number
    retries: number
  }
  features: {
    ai_recommendations: boolean
    user_analytics: boolean
    community: boolean
    prompt_market: boolean
    affiliate_program: boolean
  }
  limits: {
    search_results: number
    favorites_per_user: number
    uploads_per_day: number
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
