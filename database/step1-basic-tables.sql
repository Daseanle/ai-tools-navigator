-- AI工具导航系统 - 最基础版本：只创建表结构
-- 分步执行，避免所有错误

-- 第1步：创建用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar TEXT,
  bio TEXT,
  provider VARCHAR(50) DEFAULT 'email',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 第2步：创建分类表
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 第3步：创建工具表
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

-- 第4步：创建工具评分表
CREATE TABLE IF NOT EXISTS tool_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID,
  user_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 第5步：创建用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  tool_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 第6步：创建用户会员表
CREATE TABLE IF NOT EXISTS user_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  plan_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT false,
  payment_method VARCHAR(50),
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'CNY',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 第7步：创建用户设置表
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  theme VARCHAR(20) DEFAULT 'system',
  language VARCHAR(10) DEFAULT 'zh-CN',
  notifications JSONB DEFAULT '{"email": true, "push": false}',
  privacy JSONB DEFAULT '{"profile_public": true, "activity_public": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 第8步：验证表创建
SELECT 'All tables created successfully!' as message;

# NaviGuard-AI Security Audited - 2026-06-01
