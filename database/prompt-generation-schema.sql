-- 生成的Prompt数据表
CREATE TABLE IF NOT EXISTS generated_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    title_en TEXT,
    description TEXT NOT NULL,
    description_en TEXT,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    industry TEXT[] DEFAULT '{}',
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    ai_models TEXT[] DEFAULT '{}',
    language TEXT NOT NULL DEFAULT 'zh',
    estimated_quality INTEGER DEFAULT 0,
    usage_examples TEXT[] DEFAULT '{}',
    tips TEXT[] DEFAULT '{}',
    variations TEXT[] DEFAULT '{}',
    author_id TEXT NOT NULL DEFAULT 'system',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    pricing_type TEXT DEFAULT 'free' CHECK (pricing_type IN ('free', 'paid', 'premium')),
    price DECIMAL(10,2) DEFAULT 0.00,
    downloads INTEGER DEFAULT 0,
    ratings INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    favorites INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_generated_prompts_category ON generated_prompts(category);
CREATE INDEX IF NOT EXISTS idx_generated_prompts_difficulty ON generated_prompts(difficulty);
CREATE INDEX IF NOT EXISTS idx_generated_prompts_language ON generated_prompts(language);
CREATE INDEX IF NOT EXISTS idx_generated_prompts_status ON generated_prompts(status);
CREATE INDEX IF NOT EXISTS idx_generated_prompts_author ON generated_prompts(author_id);
CREATE INDEX IF NOT EXISTS idx_generated_prompts_created ON generated_prompts(created_at);
CREATE INDEX IF NOT EXISTS idx_generated_prompts_quality ON generated_prompts(estimated_quality);
CREATE INDEX IF NOT EXISTS idx_generated_prompts_featured ON generated_prompts(featured);

-- Prompt评论表
CREATE TABLE IF NOT EXISTS prompt_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES generated_prompts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    helpful INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_prompt_reviews_prompt ON prompt_reviews(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_reviews_user ON prompt_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_reviews_rating ON prompt_reviews(rating);

-- Prompt购买记录表
CREATE TABLE IF NOT EXISTS prompt_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    prompt_id UUID NOT NULL REFERENCES generated_prompts(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CNY',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded')),
    payment_method TEXT,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_prompt_purchases_user ON prompt_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_purchases_prompt ON prompt_purchases(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_purchases_status ON prompt_purchases(status);

-- Prompt使用统计表
CREATE TABLE IF NOT EXISTS prompt_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES generated_prompts(id) ON DELETE CASCADE,
    user_id TEXT,
    action TEXT NOT NULL CHECK (action IN ('view', 'download', 'copy', 'favorite', 'share')),
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_prompt_usage_prompt ON prompt_usage_stats(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_action ON prompt_usage_stats(action);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_date ON prompt_usage_stats(created_at);

-- Prompt收藏表
CREATE TABLE IF NOT EXISTS prompt_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    prompt_id UUID NOT NULL REFERENCES generated_prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, prompt_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_prompt_favorites_user ON prompt_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_favorites_prompt ON prompt_favorites(prompt_id);

-- Prompt分享记录表
CREATE TABLE IF NOT EXISTS prompt_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES generated_prompts(id) ON DELETE CASCADE,
    user_id TEXT,
    platform TEXT NOT NULL CHECK (platform IN ('weibo', 'wechat', 'qq', 'twitter', 'linkedin', 'email', 'link')),
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_prompt_shares_prompt ON prompt_shares(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_shares_platform ON prompt_shares(platform);

-- 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_generated_prompts_updated_at 
    BEFORE UPDATE ON generated_prompts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 触发器：自动更新统计数据
CREATE OR REPLACE FUNCTION update_prompt_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.action = 'view' THEN
            UPDATE generated_prompts 
            SET views = views + 1 
            WHERE id = NEW.prompt_id;
        ELSIF NEW.action = 'download' THEN
            UPDATE generated_prompts 
            SET downloads = downloads + 1 
            WHERE id = NEW.prompt_id;
        ELSIF NEW.action = 'favorite' THEN
            UPDATE generated_prompts 
            SET favorites = favorites + 1 
            WHERE id = NEW.prompt_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prompt_stats_trigger 
    AFTER INSERT ON prompt_usage_stats 
    FOR EACH ROW EXECUTE FUNCTION update_prompt_stats();

-- 触发器：自动更新评分
CREATE OR REPLACE FUNCTION update_prompt_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE generated_prompts 
        SET 
            ratings = (SELECT COUNT(*) FROM prompt_reviews WHERE prompt_id = NEW.prompt_id),
            average_rating = (SELECT AVG(rating) FROM prompt_reviews WHERE prompt_id = NEW.prompt_id)
        WHERE id = NEW.prompt_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE generated_prompts 
        SET 
            ratings = (SELECT COUNT(*) FROM prompt_reviews WHERE prompt_id = OLD.prompt_id),
            average_rating = COALESCE((SELECT AVG(rating) FROM prompt_reviews WHERE prompt_id = OLD.prompt_id), 0)
        WHERE id = OLD.prompt_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prompt_rating_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON prompt_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_prompt_rating();

-- 插入示例数据
INSERT INTO generated_prompts (
    title, 
    title_en, 
    description, 
    description_en, 
    content, 
    category, 
    tags, 
    industry, 
    difficulty, 
    ai_models, 
    language, 
    estimated_quality, 
    usage_examples, 
    tips, 
    variations, 
    author_id, 
    status, 
    featured, 
    verified
) VALUES (
    'AI驱动的专业内容创作助手',
    'AI-Powered Professional Content Creation Assistant',
    '帮助内容创作者快速生成高质量的专业内容，适用于博客、文章、营销文案等多种场景',
    'Help content creators quickly generate high-quality professional content for blogs, articles, marketing copy and more',
    '你是一位资深的内容创作专家，拥有丰富的写作经验和深厚的行业知识。请根据以下要求创作专业内容：

**内容主题**: [请输入主题]
**目标受众**: [请描述目标读者]
**内容类型**: [博客文章/营销文案/教程/评测等]
**字数要求**: [请指定字数范围]
**语气风格**: [专业/轻松/权威/亲切等]

**创作要求**:
1. 开头要有吸引力，能立即抓住读者注意力
2. 结构清晰，逻辑性强，层次分明
3. 内容有价值，能解决读者的实际问题
4. 语言精准，避免冗余和废话
5. 结尾要有行动召唤或总结升华

**输出格式**:
- 标题 (吸引眼球，SEO友好)
- 开头段落 (背景介绍，问题提出)
- 正文内容 (分章节，有小标题)
- 结论总结 (要点回顾，行动指导)

请确保内容原创、准确、有价值，符合目标受众的阅读习惯和知识水平。',
    'writing',
    ARRAY['内容创作', '写作助手', '专业写作', 'AI写作'],
    ARRAY['媒体', '营销', '教育', '科技'],
    'intermediate',
    ARRAY['ChatGPT', 'Claude', 'GPT-4'],
    'zh',
    88,
    ARRAY[
        '博客文章创作：输入"人工智能在教育中的应用"主题，目标受众"教育工作者"，生成3000字深度文章',
        '产品文案编写：输入产品特点和用户痛点，生成吸引人的营销文案',
        '技术教程撰写：输入技术要点和难度级别，生成易懂的教程内容'
    ],
    ARRAY[
        '提供详细的背景信息和具体要求，AI能生成更精准的内容',
        '明确指定目标受众，有助于调整语言风格和内容深度',
        '可以分段生成长文章，每次专注一个章节以获得更好效果',
        '使用具体的例子和数据来支撑论点，增加内容可信度',
        '定期优化Prompt中的关键词和要求，提升生成质量'
    ],
    ARRAY[
        '简化版：适合快速生成短文案和简单内容',
        '专业版：添加更多行业专业要求和质量标准',
        'SEO优化版：增加关键词优化和搜索引擎友好要求'
    ],
    'system',
    'published',
    true,
    true
);

-- 添加评论示例
INSERT INTO prompt_reviews (prompt_id, user_id, user_name, rating, comment) 
SELECT 
    id, 
    'user_001', 
    '内容创作者小王', 
    5, 
    '这个Prompt非常实用！帮我生成的文章质量很高，结构清晰，内容有深度。强烈推荐给其他内容创作者。'
FROM generated_prompts WHERE title = 'AI驱动的专业内容创作助手';

-- 添加使用统计示例
INSERT INTO prompt_usage_stats (prompt_id, user_id, action) 
SELECT 
    id, 
    'user_' || generate_series(1, 100), 
    (ARRAY['view', 'download', 'copy', 'favorite'])[ceil(random() * 4)]
FROM generated_prompts WHERE title = 'AI驱动的专业内容创作助手';

-- 创建视图：热门Prompt
CREATE OR REPLACE VIEW popular_prompts AS
SELECT 
    p.*,
    COALESCE(p.downloads * 0.4 + p.views * 0.3 + p.favorites * 0.2 + p.ratings * 0.1, 0) as popularity_score
FROM generated_prompts p
WHERE p.status = 'published'
ORDER BY popularity_score DESC;

-- 创建视图：Prompt统计摘要
CREATE OR REPLACE VIEW prompt_stats_summary AS
SELECT 
    category,
    COUNT(*) as total_prompts,
    AVG(estimated_quality) as avg_quality,
    SUM(downloads) as total_downloads,
    SUM(views) as total_views,
    AVG(average_rating) as avg_rating
FROM generated_prompts
WHERE status = 'published'
GROUP BY category;

-- 创建函数：搜索Prompt
CREATE OR REPLACE FUNCTION search_prompts(
    search_query TEXT DEFAULT '',
    category_filter TEXT DEFAULT '',
    difficulty_filter TEXT DEFAULT '',
    language_filter TEXT DEFAULT 'zh',
    min_quality INTEGER DEFAULT 0,
    page_size INTEGER DEFAULT 20,
    page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    category TEXT,
    difficulty TEXT,
    estimated_quality INTEGER,
    downloads INTEGER,
    average_rating DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.description,
        p.category,
        p.difficulty,
        p.estimated_quality,
        p.downloads,
        p.average_rating,
        p.created_at
    FROM generated_prompts p
    WHERE 
        p.status = 'published'
        AND (search_query = '' OR p.title ILIKE '%' || search_query || '%' OR p.description ILIKE '%' || search_query || '%')
        AND (category_filter = '' OR p.category = category_filter)
        AND (difficulty_filter = '' OR p.difficulty = difficulty_filter)
        AND p.language = language_filter
        AND p.estimated_quality >= min_quality
    ORDER BY p.featured DESC, p.downloads DESC, p.created_at DESC
    LIMIT page_size OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

# NaviGuard-AI Security Audited - 2026-06-01
