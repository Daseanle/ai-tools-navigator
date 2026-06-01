-- 扩展支付和Prompt系统数据库架构 (修复版本)
-- 在现有数据库基础上新增支付和Prompt相关表

-- 支付订单表
CREATE TABLE IF NOT EXISTS payment_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('membership', 'content', 'service', 'api_credits', 'ad_credits')),
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  amount INTEGER NOT NULL, -- 以分为单位
  currency TEXT NOT NULL DEFAULT 'CNY' CHECK (currency IN ('CNY', 'USD')),
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  transaction_id TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  expired_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 支付订单索引
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_product_type ON payment_orders(product_type);
CREATE INDEX IF NOT EXISTS idx_payment_orders_created_at ON payment_orders(created_at);

-- Prompt分类表
CREATE TABLE IF NOT EXISTS prompt_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  prompt_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompt表
CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES prompt_categories(id),
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  author_verified BOOLEAN DEFAULT FALSE,
  pricing_type TEXT NOT NULL DEFAULT 'free' CHECK (pricing_type IN ('free', 'paid', 'premium')),
  price INTEGER DEFAULT 0, -- 以分为单位
  original_price INTEGER,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  language TEXT DEFAULT 'zh' CHECK (language IN ('zh', 'en')),
  model_compatibility TEXT[] DEFAULT '{}', -- 兼容的AI模型
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time INTEGER, -- 预计使用时间（分钟）
  -- 统计数据
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  purchases_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  -- 状态
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'archived')),
  rejection_reason TEXT,
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Prompt索引
CREATE INDEX IF NOT EXISTS idx_prompts_category_id ON prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_author_id ON prompts(author_id);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(status);
CREATE INDEX IF NOT EXISTS idx_prompts_pricing_type ON prompts(pricing_type);
CREATE INDEX IF NOT EXISTS idx_prompts_featured ON prompts(featured);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at);
CREATE INDEX IF NOT EXISTS idx_prompts_rating_average ON prompts(rating_average);
CREATE INDEX IF NOT EXISTS idx_prompts_downloads_count ON prompts(downloads_count);

-- 基础文本索引
CREATE INDEX IF NOT EXISTS idx_prompts_title_text ON prompts(title);
CREATE INDEX IF NOT EXISTS idx_prompts_description_text ON prompts(description);
CREATE INDEX IF NOT EXISTS idx_prompts_tags_array ON prompts USING gin(tags);

-- 用户Prompt购买记录
CREATE TABLE IF NOT EXISTS user_prompt_purchases (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  prompt_id TEXT NOT NULL REFERENCES prompts(id),
  order_id TEXT REFERENCES payment_orders(id),
  price INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- 用户Prompt收藏
CREATE TABLE IF NOT EXISTS user_prompt_favorites (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  prompt_id TEXT NOT NULL REFERENCES prompts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- 用户Prompt评分
CREATE TABLE IF NOT EXISTS user_prompt_ratings (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  prompt_id TEXT NOT NULL REFERENCES prompts(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- 用户Prompt使用记录
CREATE TABLE IF NOT EXISTS user_prompt_usage (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  prompt_id TEXT NOT NULL REFERENCES prompts(id),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  result_quality INTEGER CHECK (result_quality >= 1 AND result_quality <= 5),
  feedback TEXT
);

-- 用户API积分
CREATE TABLE IF NOT EXISTS user_api_credits (
  user_id TEXT PRIMARY KEY,
  credits INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户广告积分
CREATE TABLE IF NOT EXISTS user_ad_credits (
  user_id TEXT PRIMARY KEY,
  credits INTEGER DEFAULT 0,
  total_recharged INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 收入分成记录
CREATE TABLE IF NOT EXISTS creator_earnings (
  id SERIAL PRIMARY KEY,
  creator_id TEXT NOT NULL,
  prompt_id TEXT NOT NULL REFERENCES prompts(id),
  order_id TEXT NOT NULL REFERENCES payment_orders(id),
  gross_amount INTEGER NOT NULL,
  platform_fee INTEGER NOT NULL,
  creator_share INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'disputed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 提现申请表
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  method TEXT NOT NULL, -- 'bank_transfer', 'alipay', 'wechat'
  account_info JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- 初始化Prompt分类数据
INSERT INTO prompt_categories (id, name, name_en, description, icon, color, sort_order) VALUES
('writing', '写作助手', 'Writing Assistant', '文案写作、创意写作、学术写作等', '✍️', '#3B82F6', 1),
('marketing', '营销推广', 'Marketing', '营销文案、广告创意、品牌推广等', '📈', '#10B981', 2),
('business', '商业分析', 'Business Analysis', '商业计划、市场分析、数据解读等', '💼', '#8B5CF6', 3),
('education', '教育培训', 'Education', '教学设计、课程开发、知识问答等', '📚', '#F59E0B', 4),
('development', '编程开发', 'Development', '代码生成、调试、技术文档等', '💻', '#EF4444', 5),
('design', '设计创意', 'Design', '设计概念、创意灵感、用户体验等', '🎨', '#EC4899', 6),
('translation', '翻译本地化', 'Translation', '多语言翻译、文化适配、本地化等', '🌍', '#06B6D4', 7);

-- 初始化示例Prompt数据
INSERT INTO prompts (id, title, description, content, category_id, author_id, author_name, author_avatar, author_verified, pricing_type, price, tags, featured, verified, language, model_compatibility, difficulty, estimated_time, views_count, downloads_count, favorites_count, rating_average, rating_count, status, published_at) VALUES
('prompt_1', '专业广告文案生成器', '为您的产品或服务生成高转化率的广告文案，支持多种广告平台和格式', 'You are a professional copywriter specialized in creating high-converting advertisements. 

Please write compelling ad copy for: [产品/服务名称]

Target audience: [目标受众]
Platform: [广告平台，如Facebook、Google Ads、微信朋友圈等]
Tone: [语调，如专业、轻松、紧迫等]
Key benefits: [主要卖点]
Call to action: [行动号召]

Requirements:
- Create 3 different versions
- Each version should be under 100 words
- Include emotional triggers
- Use persuasive language
- Make it platform-appropriate

Format the output as:
**Version 1:**
[广告文案]

**Version 2:**
[广告文案]

**Version 3:**
[广告文案]', 'marketing', 'user_creator_1', '营销专家李华', '/placeholder.svg?height=48&width=48', TRUE, 'paid', 2000, ARRAY['广告文案', '营销推广', '文案写作'], TRUE, TRUE, 'zh', ARRAY['GPT-4', 'Claude', 'ChatGPT'], 'intermediate', 10, 1247, 89, 156, 4.7, 23, 'published', NOW()),

('prompt_2', '代码优化专家助手', '帮助您优化代码性能、提升可读性，并提供最佳实践建议', 'You are a senior software engineer with expertise in code optimization and best practices.

Please analyze and optimize the following code:

```
[粘贴您的代码]
```

Programming language: [语言名称]
Current issues: [描述当前问题]
Optimization goals: [优化目标，如性能、可读性、维护性等]

Please provide:
1. **Code Analysis**: Identify current issues and bottlenecks
2. **Optimized Code**: Provide improved version with explanations
3. **Best Practices**: Suggest coding standards and patterns
4. **Performance Impact**: Estimate improvement potential
5. **Testing Recommendations**: Suggest test cases for validation

Format your response clearly with code blocks and explanations.', 'development', 'user_creator_2', '技术大牛王强', '/placeholder.svg?height=48&width=48', TRUE, 'premium', 5000, ARRAY['代码优化', '编程助手', '性能优化'], TRUE, TRUE, 'zh', ARRAY['GPT-4', 'Claude', 'Copilot'], 'advanced', 15, 892, 67, 98, 4.8, 18, 'published', NOW()),

('prompt_3', '创意文案生成器', '免费的创意文案生成工具，适用于各种创意写作场景', 'You are a creative writer with excellent imagination and storytelling skills.

Please create engaging creative content for: [内容类型]

Theme: [主题]
Style: [风格，如幽默、温馨、悬疑等]
Target audience: [目标读者]
Word count: [字数要求]

Requirements:
- Be original and creative
- Engage the audience emotionally
- Use vivid imagery and descriptions
- Include a compelling hook
- End with a memorable conclusion

Please provide the creative content following the specified requirements.', 'writing', 'user_creator_3', '创意写手张敏', '/placeholder.svg?height=48&width=48', FALSE, 'free', 0, ARRAY['创意写作', '文案创作', '免费工具'], FALSE, TRUE, 'zh', ARRAY['GPT-4', 'Claude', 'ChatGPT'], 'beginner', 8, 2341, 456, 789, 4.2, 67, 'published', NOW());

-- 更新分类的prompt数量
UPDATE prompt_categories 
SET prompt_count = (
  SELECT COUNT(*) 
  FROM prompts 
  WHERE prompts.category_id = prompt_categories.id 
  AND prompts.status = 'published'
);

-- 创建触发器函数，自动更新统计数据
CREATE OR REPLACE FUNCTION update_prompt_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- 更新分类统计
  UPDATE prompt_categories 
  SET prompt_count = (
    SELECT COUNT(*) 
    FROM prompts 
    WHERE category_id = NEW.category_id 
    AND status = 'published'
  )
  WHERE id = NEW.category_id;
  
  -- 如果分类发生变化，也更新旧分类
  IF TG_OP = 'UPDATE' AND OLD.category_id != NEW.category_id THEN
    UPDATE prompt_categories 
    SET prompt_count = (
      SELECT COUNT(*) 
      FROM prompts 
      WHERE category_id = OLD.category_id 
      AND status = 'published'
    )
    WHERE id = OLD.category_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_prompt_stats ON prompts;
CREATE TRIGGER trigger_update_prompt_stats
  AFTER INSERT OR UPDATE OR DELETE ON prompts
  FOR EACH ROW EXECUTE FUNCTION update_prompt_stats();

-- 创建函数更新Prompt评分
CREATE OR REPLACE FUNCTION update_prompt_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE prompts 
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM user_prompt_ratings 
      WHERE prompt_id = NEW.prompt_id
    ),
    rating_count = (
      SELECT COUNT(*) 
      FROM user_prompt_ratings 
      WHERE prompt_id = NEW.prompt_id
    )
  WHERE id = NEW.prompt_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建评分触发器
DROP TRIGGER IF EXISTS trigger_update_prompt_rating ON user_prompt_ratings;
CREATE TRIGGER trigger_update_prompt_rating
  AFTER INSERT OR UPDATE OR DELETE ON user_prompt_ratings
  FOR EACH ROW EXECUTE FUNCTION update_prompt_rating();

-- 创建函数更新收藏数
CREATE OR REPLACE FUNCTION update_prompt_favorites()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE prompts 
  SET favorites_count = (
    SELECT COUNT(*) 
    FROM user_prompt_favorites 
    WHERE prompt_id = COALESCE(NEW.prompt_id, OLD.prompt_id)
  )
  WHERE id = COALESCE(NEW.prompt_id, OLD.prompt_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 创建收藏触发器
DROP TRIGGER IF EXISTS trigger_update_prompt_favorites ON user_prompt_favorites;
CREATE TRIGGER trigger_update_prompt_favorites
  AFTER INSERT OR DELETE ON user_prompt_favorites
  FOR EACH ROW EXECUTE FUNCTION update_prompt_favorites();

# NaviGuard-AI Security Audited - 2026-06-01
