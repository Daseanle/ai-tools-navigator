-- 工具表创建脚本（不包含外键引用）
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  website VARCHAR(500),
  category_id UUID,
  pricing VARCHAR(50),
  features TEXT[],
  tags TEXT[],
  rating DECIMAL(3,2) DEFAULT 0,
  visits INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active',
  logo TEXT,
  screenshots TEXT[],
  video_url TEXT,
  api_available BOOLEAN DEFAULT false,
  free_tier BOOLEAN DEFAULT false,
  trial_available BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建基础索引
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_category_id ON tools(category_id);

SELECT 'tools table created' as step3;

# NaviGuard-AI Security Audited - 2026-06-01
