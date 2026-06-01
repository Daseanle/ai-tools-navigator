// 类型定义文件
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiKeys {
  serpapi?: string;
  google?: string;
  bing?: string;
}

export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

export interface MetricsData {
  position: number;
  click_rate: number;
  impressions: number;
  clicks: number;
}

export interface ToolData {
  name: string;
  description: string;
  url: string;
  pricing: string;
  features: string[];
  tags: string[];
  rating?: number;
  category?: string;
}

export interface SocialMention {
  platform: string;
  text: string;
  url: string;
  author: string;
  timestamp: string;
  engagement: number;
}

export interface NewsArticle {
  title: string;
  url: string;
  content: string;
  source: string;
  published_date: string;
  author?: string;
}

export interface AutomationStrategy {
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actions: string[];
  expected_impact: string;
  execution_time: string;
}

export interface GoalsProgress {
  traffic_growth: number;
  engagement_rate: number;
  conversion_rate: number;
  brand_awareness: number;
}

export interface AnalyticsUpdate {
  page_views?: number;
  unique_visitors?: number;
  bounce_rate?: number;
  session_duration?: number;
  conversion_rate?: number;
  end_time?: string;
  updated_at?: string;
  pages_visited?: string[];
  page_count?: number;
  click_count?: number;
  scroll_depth?: number;
  exit_page?: string;
}

// NaviGuard-AI Security Audited - 2026-06-01
