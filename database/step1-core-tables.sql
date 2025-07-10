-- AI工具导航系统 - 修复版核心数据库结构
-- 第一步：创建基础表结构（无外键依赖）

-- 用户表
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

-- 分类表
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

-- 工具表
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

-- 工具评分表
CREATE TABLE IF NOT EXISTS tool_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID,
  user_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  tool_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户会员表
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

-- 用户设置表
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

-- 创建基础索引
CREATE INDEX IF NOT EXISTS idx_tools_category_id ON tools(category_id);
CREATE INDEX IF NOT EXISTS idx_tools_rating ON tools(rating DESC);
CREATE INDEX IF NOT EXISTS idx_tools_visits ON tools(visits DESC);
CREATE INDEX IF NOT EXISTS idx_tools_featured ON tools(featured);
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_created_at ON tools(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_name ON tools(name);

CREATE INDEX IF NOT EXISTS idx_tool_ratings_tool_id ON tool_ratings(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_ratings_user_id ON tool_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_ratings_rating ON tool_ratings(rating);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_tool_id ON user_favorites(tool_id);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(featured);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON user_memberships(user_id);

-- 基础文本搜索索引
CREATE INDEX IF NOT EXISTS idx_tools_name_text ON tools(name);
CREATE INDEX IF NOT EXISTS idx_tools_description_text ON tools(description);
CREATE INDEX IF NOT EXISTS idx_tools_tags_array ON tools USING gin(tags);

-- 自动更新 updated_at 字段的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表创建自动更新触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_tools_updated_at ON tools;
DROP TRIGGER IF EXISTS update_tool_ratings_updated_at ON tool_ratings;
DROP TRIGGER IF EXISTS update_user_memberships_updated_at ON user_memberships;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tool_ratings_updated_at BEFORE UPDATE ON tool_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_memberships_updated_at BEFORE UPDATE ON user_memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入示例分类数据
INSERT INTO categories (name, slug, description, icon, color, featured, sort_order) VALUES
  ('AI对话', 'ai-chat', '智能对话助手和聊天机器人', 'MessageCircle', '#3B82F6', true, 1),
  ('图像生成', 'image-generation', 'AI图像生成和编辑工具', 'Image', '#10B981', true, 2),
  ('效率工具', 'productivity', '提升工作效率的AI工具', 'Zap', '#F59E0B', true, 3),
  ('设计工具', 'design', 'AI设计和创意工具', 'Palette', '#EF4444', true, 4),
  ('编程助手', 'programming', '代码生成和编程辅助工具', 'Code', '#8B5CF6', true, 5),
  ('数据分析', 'data-analysis', 'AI数据分析和可视化工具', 'BarChart3', '#06B6D4', false, 6),
  ('音频处理', 'audio', 'AI音频生成和编辑工具', 'Music', '#F97316', false, 7),
  ('视频制作', 'video', 'AI视频生成和编辑工具', 'Video', '#EC4899', false, 8),
  ('翻译工具', 'translation', 'AI翻译和语言处理工具', 'Globe', '#84CC16', false, 9),
  ('教育学习', 'education', 'AI教育和学习辅助工具', 'GraduationCap', '#6366F1', false, 10)
ON CONFLICT (slug) DO NOTHING;

-- 插入示例工具数据
INSERT INTO tools (name, slug, description, website, category_id, pricing, features, tags, rating, visits, featured, logo, api_available, free_tier, trial_available) VALUES
  ('ChatGPT', 'chatgpt', '强大的AI对话助手，能够回答问题、协助创作、编程等多种任务', 'https://chat.openai.com', 
   (SELECT id FROM categories WHERE slug = 'ai-chat'), 'Freemium', 
   ARRAY['自然语言对话', '代码生成', '文本创作', '问题解答'], 
   ARRAY['AI', '对话', '创作', '编程'], 4.8, 1250000, true, '/logos/chatgpt.png', true, true, true),
  
  ('Claude', 'claude', 'Anthropic开发的AI助手，擅长分析、写作和对话', 'https://claude.ai', 
   (SELECT id FROM categories WHERE slug = 'ai-chat'), 'Freemium', 
   ARRAY['智能对话', '文档分析', '代码辅助', '创意写作'], 
   ARRAY['AI', '对话', '分析', '写作'], 4.7, 890000, true, '/logos/claude.png', true, true, true),
  
  ('Midjourney', 'midjourney', '基于AI的图像生成工具，创造惊人的艺术作品', 'https://midjourney.com', 
   (SELECT id FROM categories WHERE slug = 'image-generation'), 'Paid', 
   ARRAY['AI绘画', '艺术风格', '高质量输出', '社区分享'], 
   ARRAY['AI', '图像', '艺术', '创作'], 4.6, 750000, true, '/logos/midjourney.png', false, false, true),
  
  ('Notion AI', 'notion-ai', '集成在Notion中的AI助手，提升工作效率', 'https://notion.so', 
   (SELECT id FROM categories WHERE slug = 'productivity'), 'Freemium', 
   ARRAY['智能写作', '内容总结', '翻译', '头脑风暴'], 
   ARRAY['AI', '效率', '写作', '协作'], 4.5, 650000, false, '/logos/notion.png', true, true, false),
  
  ('Canva AI', 'canva-ai', '智能设计工具，快速创建专业设计作品', 'https://canva.com', 
   (SELECT id FROM categories WHERE slug = 'design'), 'Freemium', 
   ARRAY['AI设计', '模板生成', '图像编辑', '品牌套件'], 
   ARRAY['AI', '设计', '创作', '模板'], 4.4, 580000, false, '/logos/canva.png', true, true, true)
ON CONFLICT (slug) DO NOTHING;

-- 插入示例用户数据
INSERT INTO users (id, name, email, avatar, provider) VALUES
  ('11111111-1111-1111-1111-111111111111', '测试用户', 'test@example.com', '/avatars/default.png', 'email'),
  ('22222222-2222-2222-2222-222222222222', '管理员', 'admin@example.com', '/avatars/admin.png', 'email')
ON CONFLICT (email) DO NOTHING;

-- 插入示例评分数据
INSERT INTO tool_ratings (tool_id, user_id, rating, comment) VALUES
  ((SELECT id FROM tools WHERE slug = 'chatgpt'), '11111111-1111-1111-1111-111111111111', 5, '非常好用的AI工具，功能强大！'),
  ((SELECT id FROM tools WHERE slug = 'claude'), '11111111-1111-1111-1111-111111111111', 4, '分析能力很强，回答很有深度'),
  ((SELECT id FROM tools WHERE slug = 'midjourney'), '22222222-2222-2222-2222-222222222222', 5, '生成的图像质量很高，艺术感很强')
ON CONFLICT DO NOTHING;

-- 插入示例收藏数据
INSERT INTO user_favorites (user_id, tool_id) VALUES
  ('11111111-1111-1111-1111-111111111111', (SELECT id FROM tools WHERE slug = 'chatgpt')),
  ('11111111-1111-1111-1111-111111111111', (SELECT id FROM tools WHERE slug = 'claude')),
  ('22222222-2222-2222-2222-222222222222', (SELECT id FROM tools WHERE slug = 'midjourney'))
ON CONFLICT DO NOTHING;

-- 插入示例会员数据
INSERT INTO user_memberships (user_id, plan_type, status, expires_at, amount, currency) VALUES
  ('22222222-2222-2222-2222-222222222222', 'pro', 'active', NOW() + INTERVAL '30 days', 99.00, 'CNY')
ON CONFLICT DO NOTHING;

-- 插入示例用户设置数据
INSERT INTO user_settings (user_id, theme, language, notifications, privacy) VALUES
  ('11111111-1111-1111-1111-111111111111', 'dark', 'zh-CN', '{"email": true, "push": false}', '{"profile_public": true, "activity_public": false}'),
  ('22222222-2222-2222-2222-222222222222', 'light', 'zh-CN', '{"email": true, "push": true}', '{"profile_public": true, "activity_public": true}')
ON CONFLICT DO NOTHING;

-- 创建统计视图
CREATE OR REPLACE VIEW tool_stats AS
SELECT 
  t.id,
  t.name,
  t.slug,
  t.rating,
  t.visits,
  COUNT(DISTINCT tr.id) as review_count,
  COUNT(DISTINCT uf.id) as favorite_count,
  c.name as category_name,
  c.slug as category_slug
FROM tools t
LEFT JOIN tool_ratings tr ON t.id = tr.tool_id
LEFT JOIN user_favorites uf ON t.id = uf.tool_id
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.status = 'active'
GROUP BY t.id, t.name, t.slug, t.rating, t.visits, c.name, c.slug;

-- 创建分类统计视图
CREATE OR REPLACE VIEW category_stats AS
SELECT 
  c.id,
  c.name,
  c.slug,
  c.icon,
  c.color,
  c.featured,
  COUNT(t.id) as tool_count,
  AVG(t.rating) as avg_rating,
  SUM(t.visits) as total_visits
FROM categories c
LEFT JOIN tools t ON c.id = t.category_id AND t.status = 'active'
GROUP BY c.id, c.name, c.slug, c.icon, c.color, c.featured
ORDER BY c.sort_order;

-- 创建用户统计视图
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(DISTINCT uf.id) as favorite_count,
  COUNT(DISTINCT tr.id) as review_count,
  AVG(tr.rating) as avg_rating_given,
  um.plan_type,
  um.status as membership_status
FROM users u
LEFT JOIN user_favorites uf ON u.id = uf.user_id
LEFT JOIN tool_ratings tr ON u.id = tr.user_id
LEFT JOIN user_memberships um ON u.id = um.user_id AND um.status = 'active'
GROUP BY u.id, u.name, u.email, um.plan_type, um.status;

-- 添加表注释
COMMENT ON TABLE users IS '用户信息表';
COMMENT ON TABLE categories IS '工具分类表';
COMMENT ON TABLE tools IS '工具信息表';
COMMENT ON TABLE tool_ratings IS '工具评分表';
COMMENT ON TABLE user_favorites IS '用户收藏表';
COMMENT ON TABLE user_memberships IS '用户会员表';
COMMENT ON TABLE user_settings IS '用户设置表';
COMMENT ON VIEW tool_stats IS '工具统计视图';
COMMENT ON VIEW category_stats IS '分类统计视图';
COMMENT ON VIEW user_stats IS '用户统计视图';