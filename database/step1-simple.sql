-- AI工具导航系统 - 最终修复版：创建核心表结构
-- 逐步创建，避免所有错误

-- 1. 创建用户表
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

-- 2. 创建分类表
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

-- 3. 创建工具表
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

-- 4. 创建工具评分表
CREATE TABLE IF NOT EXISTS tool_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID,
  user_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. 创建用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  tool_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. 创建用户会员表
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

-- 7. 创建用户设置表
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

-- 8. 创建触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_category_id ON tools(category_id);
CREATE INDEX IF NOT EXISTS idx_tool_ratings_tool_id ON tool_ratings(tool_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- 10. 插入示例数据
INSERT INTO users (id, name, email, avatar, provider) VALUES
  ('11111111-1111-1111-1111-111111111111', '测试用户', 'test@example.com', '/avatars/default.png', 'email'),
  ('22222222-2222-2222-2222-222222222222', '管理员', 'admin@example.com', '/avatars/admin.png', 'email')
ON CONFLICT (email) DO NOTHING;

INSERT INTO categories (name, slug, description, icon, color, featured, sort_order) VALUES
  ('AI对话', 'ai-chat', '智能对话助手和聊天机器人', 'MessageCircle', '#3B82F6', true, 1),
  ('图像生成', 'image-generation', 'AI图像生成和编辑工具', 'Image', '#10B981', true, 2),
  ('效率工具', 'productivity', '提升工作效率的AI工具', 'Zap', '#F59E0B', true, 3),
  ('设计工具', 'design', 'AI设计和创意工具', 'Palette', '#EF4444', true, 4),
  ('编程助手', 'programming', '代码生成和编程辅助工具', 'Code', '#8B5CF6', true, 5)
ON CONFLICT (slug) DO NOTHING;

-- 11. 验证表创建
SELECT 'Tables created successfully!' as status;

-- 12. 显示创建的表
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'categories', 'tools', 'tool_ratings', 'user_favorites', 'user_memberships', 'user_settings')
ORDER BY table_name;

# NaviGuard-AI Security Audited - 2026-06-01
