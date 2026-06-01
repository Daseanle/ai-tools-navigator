-- 优化后的数据库Schema
-- 解决数据类型不一致问题，添加性能优化索引

-- 清理现有表（谨慎使用）
-- DROP TABLE IF EXISTS tools CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- 用户表 (统一使用UUID)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    avatar_url TEXT,
    membership_type VARCHAR(20) DEFAULT 'free' CHECK (membership_type IN ('free', 'experience', 'industry', 'team')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb,
    
    -- 约束
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 分类表 (统一使用UUID)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 元数据
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- 统计字段
    tools_count INTEGER DEFAULT 0,
    total_visits INTEGER DEFAULT 0
);

-- 工具表 (统一使用UUID)
CREATE TABLE IF NOT EXISTS tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    url VARCHAR(500) NOT NULL,
    image_url VARCHAR(500),
    logo_url VARCHAR(500),
    
    -- 分类关联
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    
    -- 评分和统计
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    rating_count INTEGER DEFAULT 0,
    visits INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    
    -- 特性标识
    featured BOOLEAN DEFAULT false,
    is_free BOOLEAN DEFAULT true,
    is_open_source BOOLEAN DEFAULT false,
    has_api BOOLEAN DEFAULT false,
    
    -- 定价信息
    pricing_model VARCHAR(50) DEFAULT 'free' CHECK (pricing_model IN ('free', 'freemium', 'paid', 'subscription')),
    price_range VARCHAR(50),
    
    -- 状态
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'deprecated')),
    is_active BOOLEAN DEFAULT true,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_crawled TIMESTAMP WITH TIME ZONE,
    
    -- 元数据和标签
    tags TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- 搜索向量
    search_vector tsvector,
    
    -- 外部数据
    external_data JSONB DEFAULT '{}'::jsonb
);

-- 用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 防止重复收藏
    UNIQUE(user_id, tool_id)
);

-- 用户评分表
CREATE TABLE IF NOT EXISTS user_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 防止重复评分
    UNIQUE(user_id, tool_id)
);

-- 用户会员表
CREATE TABLE IF NOT EXISTS user_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('free', 'experience', 'industry', 'team')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 支付信息
    payment_method VARCHAR(50),
    amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'CNY',
    
    -- 确保用户只有一个激活的会员
    UNIQUE(user_id, status) WHERE status = 'active'
);

-- 性能优化索引

-- 基础索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_membership ON users(membership_type);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

-- 工具表关键索引
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category_id);
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_active ON tools(is_active);
CREATE INDEX IF NOT EXISTS idx_tools_featured ON tools(featured);
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_created ON tools(created_at);

-- 复合索引 (优化常见查询)
CREATE INDEX IF NOT EXISTS idx_tools_category_rating ON tools(category_id, rating DESC);
CREATE INDEX IF NOT EXISTS idx_tools_category_featured ON tools(category_id, featured, is_active);
CREATE INDEX IF NOT EXISTS idx_tools_rating_visits ON tools(rating DESC, visits DESC);
CREATE INDEX IF NOT EXISTS idx_tools_category_created ON tools(category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tools_featured_rating ON tools(featured, rating DESC) WHERE is_active = true;

-- 全文搜索索引
CREATE INDEX IF NOT EXISTS idx_tools_search ON tools USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_tools_name_trgm ON tools USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tools_description_trgm ON tools USING GIN(description gin_trgm_ops);

-- 用户行为索引
CREATE INDEX IF NOT EXISTS idx_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_tool ON user_favorites(tool_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_created ON user_favorites(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ratings_user ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_tool ON user_ratings(tool_id);
CREATE INDEX IF NOT EXISTS idx_ratings_tool_rating ON user_ratings(tool_id, rating);

CREATE INDEX IF NOT EXISTS idx_memberships_user ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON user_memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_expires ON user_memberships(expires_at);

-- JSONB 索引
CREATE INDEX IF NOT EXISTS idx_tools_metadata ON tools USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_tools_tags ON tools USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_users_settings ON users USING GIN(settings);

-- 函数和触发器

-- 自动更新时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加触发器
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at 
    BEFORE UPDATE ON tools 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at 
    BEFORE UPDATE ON user_ratings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 搜索向量更新函数
CREATE OR REPLACE FUNCTION update_tool_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector = to_tsvector('chinese', 
        COALESCE(NEW.name, '') || ' ' || 
        COALESCE(NEW.description, '') || ' ' || 
        COALESCE(NEW.short_description, '') || ' ' ||
        COALESCE(array_to_string(NEW.tags, ' '), '')
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tools_search_vector 
    BEFORE INSERT OR UPDATE ON tools 
    FOR EACH ROW 
    EXECUTE FUNCTION update_tool_search_vector();

-- 统计更新函数
CREATE OR REPLACE FUNCTION update_tool_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 更新工具收藏数
        UPDATE tools 
        SET favorites_count = favorites_count + 1
        WHERE id = NEW.tool_id;
        
        -- 更新分类工具数
        UPDATE categories 
        SET tools_count = tools_count + 1
        WHERE id = (SELECT category_id FROM tools WHERE id = NEW.tool_id);
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 更新工具收藏数
        UPDATE tools 
        SET favorites_count = favorites_count - 1
        WHERE id = OLD.tool_id;
        
        -- 更新分类工具数
        UPDATE categories 
        SET tools_count = tools_count - 1
        WHERE id = (SELECT category_id FROM tools WHERE id = OLD.tool_id);
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_favorites_stats 
    AFTER INSERT OR DELETE ON user_favorites 
    FOR EACH ROW 
    EXECUTE FUNCTION update_tool_stats();

-- 评分统计更新函数
CREATE OR REPLACE FUNCTION update_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE tools 
        SET 
            rating = (SELECT AVG(rating) FROM user_ratings WHERE tool_id = NEW.tool_id),
            rating_count = (SELECT COUNT(*) FROM user_ratings WHERE tool_id = NEW.tool_id)
        WHERE id = NEW.tool_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tools 
        SET 
            rating = COALESCE((SELECT AVG(rating) FROM user_ratings WHERE tool_id = OLD.tool_id), 0),
            rating_count = (SELECT COUNT(*) FROM user_ratings WHERE tool_id = OLD.tool_id)
        WHERE id = OLD.tool_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tool_rating_stats 
    AFTER INSERT OR UPDATE OR DELETE ON user_ratings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_rating_stats();

-- 物化视图 (高性能聚合查询)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_tool_statistics AS
SELECT 
    t.id,
    t.name,
    t.category_id,
    c.name as category_name,
    t.rating,
    t.rating_count,
    t.visits,
    t.favorites_count,
    t.featured,
    t.is_free,
    t.pricing_model,
    t.created_at,
    -- 计算热度分数
    (
        (t.rating * 0.3) +
        (LEAST(t.visits, 10000) / 10000.0 * 0.3) +
        (LEAST(t.favorites_count, 1000) / 1000.0 * 0.2) +
        (CASE WHEN t.featured THEN 0.2 ELSE 0 END)
    ) as popularity_score
FROM tools t
JOIN categories c ON t.category_id = c.id
WHERE t.is_active = true AND t.status = 'active';

-- 创建物化视图索引
CREATE INDEX IF NOT EXISTS idx_mv_tool_stats_category ON mv_tool_statistics(category_id);
CREATE INDEX IF NOT EXISTS idx_mv_tool_stats_popularity ON mv_tool_statistics(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_mv_tool_stats_rating ON mv_tool_statistics(rating DESC);
CREATE INDEX IF NOT EXISTS idx_mv_tool_stats_featured ON mv_tool_statistics(featured);

-- 定期刷新物化视图的函数
CREATE OR REPLACE FUNCTION refresh_tool_statistics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_tool_statistics;
END;
$$ language 'plpgsql';

-- 行级安全策略 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own favorites" ON user_favorites
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own ratings" ON user_ratings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own memberships" ON user_memberships
    FOR ALL USING (auth.uid() = user_id);

-- 公共数据访问策略
CREATE POLICY "Tools are viewable by everyone" ON tools
    FOR SELECT USING (is_active = true);

CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (is_active = true);

-- 添加注释
COMMENT ON TABLE users IS '用户表 - 存储用户基本信息和会员状态';
COMMENT ON TABLE categories IS '分类表 - AI工具分类，支持层级结构';
COMMENT ON TABLE tools IS '工具表 - AI工具的详细信息';
COMMENT ON TABLE user_favorites IS '用户收藏表 - 用户收藏的工具';
COMMENT ON TABLE user_ratings IS '用户评分表 - 用户对工具的评分和评论';
COMMENT ON TABLE user_memberships IS '用户会员表 - 用户会员状态和订阅信息';

COMMENT ON MATERIALIZED VIEW mv_tool_statistics IS '工具统计物化视图 - 预计算的工具统计数据';

-- 性能监控视图
CREATE OR REPLACE VIEW performance_metrics AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public' 
    AND tablename IN ('tools', 'categories', 'users', 'user_favorites', 'user_ratings')
ORDER BY schemaname, tablename, attname;

-- 优化建议
-- 1. 定期运行 ANALYZE 命令更新统计信息
-- 2. 监控慢查询并添加相应索引
-- 3. 定期刷新物化视图
-- 4. 清理过期数据
-- 5. 监控数据库性能指标

# NaviGuard-AI Security Audited - 2026-06-01
