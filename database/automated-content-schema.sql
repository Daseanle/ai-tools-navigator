-- 创建自动生成内容表
CREATE TABLE IF NOT EXISTS auto_generated_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  keywords TEXT[],
  category TEXT,
  tags TEXT[],
  featured_image TEXT,
  images TEXT[],
  seo_score INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_auto_content_status ON auto_generated_content(status);
CREATE INDEX IF NOT EXISTS idx_auto_content_category ON auto_generated_content(category);
CREATE INDEX IF NOT EXISTS idx_auto_content_published_at ON auto_generated_content(published_at);
CREATE INDEX IF NOT EXISTS idx_auto_content_slug ON auto_generated_content(slug);

-- 创建内容分析表
CREATE TABLE IF NOT EXISTS content_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES auto_generated_content(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  seo_ranking JSONB,
  social_engagement JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建关键词表
CREATE TABLE IF NOT EXISTS keyword_research (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  search_volume INTEGER DEFAULT 0,
  competition_level TEXT CHECK (competition_level IN ('low', 'medium', 'high')),
  cpc DECIMAL(10,2) DEFAULT 0,
  difficulty_score INTEGER DEFAULT 0,
  trend_data JSONB,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建内链分析表
CREATE TABLE IF NOT EXISTS internal_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_content_id UUID REFERENCES auto_generated_content(id) ON DELETE CASCADE,
  to_content_id UUID REFERENCES auto_generated_content(id) ON DELETE CASCADE,
  anchor_text TEXT NOT NULL,
  link_strength INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_content_id, to_content_id)
);

-- 创建搜索引擎提交记录表
CREATE TABLE IF NOT EXISTS search_engine_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES auto_generated_content(id) ON DELETE CASCADE,
  search_engine TEXT NOT NULL,
  submission_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'indexed', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  indexed_at TIMESTAMP WITH TIME ZONE,
  response_data JSONB
);

-- 创建社交媒体推广记录表
CREATE TABLE IF NOT EXISTS social_media_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES auto_generated_content(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  post_content TEXT NOT NULL,
  post_url TEXT,
  engagement_stats JSONB,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posted', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建触发器函数更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为各表添加触发器
CREATE TRIGGER update_auto_generated_content_updated_at 
  BEFORE UPDATE ON auto_generated_content 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_analytics_updated_at 
  BEFORE UPDATE ON content_analytics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建RLS策略（如果需要）
ALTER TABLE auto_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_engine_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;

-- 创建默认策略（允许所有操作，可根据需要调整）
CREATE POLICY "Enable all operations for auto_generated_content" ON auto_generated_content
  FOR ALL USING (true);
  
CREATE POLICY "Enable all operations for content_analytics" ON content_analytics
  FOR ALL USING (true);
  
CREATE POLICY "Enable all operations for keyword_research" ON keyword_research
  FOR ALL USING (true);
  
CREATE POLICY "Enable all operations for internal_links" ON internal_links
  FOR ALL USING (true);
  
CREATE POLICY "Enable all operations for search_engine_submissions" ON search_engine_submissions
  FOR ALL USING (true);
  
CREATE POLICY "Enable all operations for social_media_posts" ON social_media_posts
  FOR ALL USING (true);