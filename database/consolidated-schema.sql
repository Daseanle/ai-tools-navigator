-- AI Tools Navigator - 统一数据库Schema
-- 合并所有重复的表定义，统一数据类型和约束

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    bio TEXT,
    provider VARCHAR(50) DEFAULT 'email',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_provider CHECK (provider IN ('email', 'google', 'github', 'apple'))
);

-- 用户会员表
CREATE TABLE IF NOT EXISTS user_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    membership_type VARCHAR(50) NOT NULL DEFAULT 'free',
    expires_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束
    CONSTRAINT valid_membership_type CHECK (membership_type IN ('free', 'experience', 'industry', 'team'))
);

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(7),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 工具表
CREATE TABLE IF NOT EXISTS tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    website TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    pricing VARCHAR(50),
    features TEXT[],
    tags TEXT[],
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    visits INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    logo TEXT,
    screenshots TEXT[],
    api_available BOOLEAN DEFAULT FALSE,
    free_tier BOOLEAN DEFAULT FALSE,
    trial_available BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束
    CONSTRAINT valid_website CHECK (website ~* '^https?://'),
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'pending', 'rejected')),
    CONSTRAINT valid_pricing CHECK (pricing IN ('Free', 'Freemium', 'Paid', 'Contact'))
);

-- 用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 唯一约束
    UNIQUE(user_id, tool_id)
);

-- 用户评分表
CREATE TABLE IF NOT EXISTS user_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 唯一约束
    UNIQUE(user_id, tool_id)
);

-- 社区帖子表
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'discussion',
    tags TEXT[],
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束
    CONSTRAINT valid_post_type CHECK (type IN ('discussion', 'question', 'tutorial', 'news')),
    CONSTRAINT valid_post_status CHECK (status IN ('draft', 'published', 'archived', 'deleted'))
);

-- 社区评论表
CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束
    CONSTRAINT valid_comment_status CHECK (status IN ('published', 'hidden', 'deleted'))
);

-- 社区投票表
CREATE TABLE IF NOT EXISTS community_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束
    CONSTRAINT valid_vote_type CHECK (vote_type IN ('upvote', 'downvote')),
    CONSTRAINT vote_target_check CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR 
        (post_id IS NULL AND comment_id IS NOT NULL)
    ),
    -- 唯一约束
    UNIQUE(user_id, post_id, comment_id)
);

-- 试用记录表
CREATE TABLE IF NOT EXISTS user_trials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active',
    
    -- 约束
    CONSTRAINT valid_trial_status CHECK (status IN ('active', 'expired', 'cancelled')),
    -- 唯一约束
    UNIQUE(user_id, tool_id)
);

-- 支付订单表
CREATE TABLE IF NOT EXISTS payment_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CNY',
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    product_type VARCHAR(50) NOT NULL,
    product_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束
    CONSTRAINT valid_payment_method CHECK (payment_method IN ('wechat', 'alipay', 'bank_card', 'paypal')),
    CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    CONSTRAINT valid_product_type CHECK (product_type IN ('membership', 'tool_access', 'premium_feature'))
);

-- 联盟伙伴表
CREATE TABLE IF NOT EXISTS affiliate_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    partner_code VARCHAR(50) UNIQUE NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束
    CONSTRAINT valid_affiliate_status CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- 联盟点击记录表
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES affiliate_partners(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    converted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 联盟收益表
CREATE TABLE IF NOT EXISTS affiliate_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES affiliate_partners(id) ON DELETE CASCADE,
    click_id UUID REFERENCES affiliate_clicks(id) ON DELETE CASCADE,
    order_id UUID REFERENCES payment_orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 约束
    CONSTRAINT valid_earning_status CHECK (status IN ('pending', 'confirmed', 'paid'))
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_category_id ON tools(category_id);
CREATE INDEX IF NOT EXISTS idx_tools_featured ON tools(featured);
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_rating ON tools(rating DESC);
CREATE INDEX IF NOT EXISTS idx_tools_visits ON tools(visits DESC);
CREATE INDEX IF NOT EXISTS idx_tools_search ON tools USING gin(to_tsvector('english', name || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_tools_tags ON tools USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_tool_id ON user_favorites(tool_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_tool_id ON user_ratings(tool_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rating ON user_ratings(rating DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(type);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_user_id ON community_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_user_id ON community_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_partner_id ON affiliate_clicks(partner_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_tool_id ON affiliate_clicks(tool_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要自动更新时间的表创建触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ratings_updated_at BEFORE UPDATE ON user_ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_comments_updated_at BEFORE UPDATE ON community_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_orders_updated_at BEFORE UPDATE ON payment_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_partners_updated_at BEFORE UPDATE ON affiliate_partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建性能优化的物化视图
CREATE MATERIALIZED VIEW IF NOT EXISTS tool_statistics AS
SELECT 
    t.id,
    t.name,
    t.slug,
    COUNT(DISTINCT uf.id) as favorites_count,
    COUNT(DISTINCT ur.id) as ratings_count,
    COALESCE(AVG(ur.rating), 0) as avg_rating,
    t.visits,
    t.featured,
    t.status,
    t.category_id,
    t.created_at
FROM tools t
LEFT JOIN user_favorites uf ON t.id = uf.tool_id
LEFT JOIN user_ratings ur ON t.id = ur.tool_id
WHERE t.status = 'active'
GROUP BY t.id, t.name, t.slug, t.visits, t.featured, t.status, t.category_id, t.created_at;

-- 创建刷新物化视图的函数
CREATE OR REPLACE FUNCTION refresh_tool_statistics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW tool_statistics;
END;
$$ LANGUAGE plpgsql;

-- 创建索引来优化物化视图查询
CREATE INDEX IF NOT EXISTS idx_tool_statistics_category_id ON tool_statistics(category_id);
CREATE INDEX IF NOT EXISTS idx_tool_statistics_featured ON tool_statistics(featured);
CREATE INDEX IF NOT EXISTS idx_tool_statistics_avg_rating ON tool_statistics(avg_rating DESC);
CREATE INDEX IF NOT EXISTS idx_tool_statistics_favorites_count ON tool_statistics(favorites_count DESC);
CREATE INDEX IF NOT EXISTS idx_tool_statistics_visits ON tool_statistics(visits DESC);

# NaviGuard-AI Security Audited - 2026-06-01
