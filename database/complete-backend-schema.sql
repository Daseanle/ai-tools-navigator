-- 用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    tool_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tool_id)
);

-- 用户评分表
CREATE TABLE IF NOT EXISTS user_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    tool_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tool_id)
);

-- 用户会员表
CREATE TABLE IF NOT EXISTS user_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'experience', 'industry', 'team')),
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'canceled', 'suspended')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT false,
    payment_method TEXT,
    usage_stats JSONB DEFAULT '{}',
    last_payment_at TIMESTAMP WITH TIME ZONE,
    next_payment_at TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP WITH TIME ZONE,
    original_tier TEXT,
    is_trial BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户设置表
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    language TEXT DEFAULT 'zh' CHECK (language IN ('zh', 'en')),
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
    timezone TEXT DEFAULT 'Asia/Shanghai',
    email_notifications JSONB DEFAULT '{}',
    push_notifications JSONB DEFAULT '{}',
    marketing_emails BOOLEAN DEFAULT false,
    privacy_settings JSONB DEFAULT '{}',
    display_preferences JSONB DEFAULT '{}',
    search_preferences JSONB DEFAULT '{}',
    ai_preferences JSONB DEFAULT '{}',
    accessibility_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户试用表
CREATE TABLE IF NOT EXISTS user_trials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    trial_type TEXT NOT NULL CHECK (trial_type IN ('membership', 'feature', 'tool')),
    trial_name TEXT NOT NULL,
    tier TEXT,
    feature_name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'canceled')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    extended_at TIMESTAMP WITH TIME ZONE,
    usage_stats JSONB DEFAULT '{}',
    limits JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 社区帖子表
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'discussion' CHECK (type IN ('discussion', 'question', 'showcase', 'feedback', 'announcement')),
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'tools', 'prompts', 'tutorials', 'news', 'help')),
    tags TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    links TEXT[] DEFAULT '{}',
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 社区评论表
CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 社区投票表
CREATE TABLE IF NOT EXISTS community_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    target_id UUID NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
    vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, target_id, target_type)
);

-- 用户表（如果不存在）
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_tool_id ON user_favorites(tool_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at);

CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_tool_id ON user_ratings(tool_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rating ON user_ratings(rating);

CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_tier ON user_memberships(tier);
CREATE INDEX IF NOT EXISTS idx_user_memberships_status ON user_memberships(status);
CREATE INDEX IF NOT EXISTS idx_user_memberships_expires_at ON user_memberships(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_trials_user_id ON user_trials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trials_type ON user_trials(trial_type);
CREATE INDEX IF NOT EXISTS idx_user_trials_status ON user_trials(status);
CREATE INDEX IF NOT EXISTS idx_user_trials_expires_at ON user_trials(expires_at);

CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(type);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_community_posts_upvotes ON community_posts(upvotes);
CREATE INDEX IF NOT EXISTS idx_community_posts_featured ON community_posts(featured);

CREATE INDEX IF NOT EXISTS idx_community_comments_user_id ON community_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_parent_id ON community_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_created_at ON community_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_community_votes_user_id ON community_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_target_id ON community_votes(target_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_target_type ON community_votes(target_type);

-- 创建RPC函数
CREATE OR REPLACE FUNCTION increment_tool_favorites(tool_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE tools SET favorites_count = COALESCE(favorites_count, 0) + 1 WHERE id = tool_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_tool_favorites(tool_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE tools SET favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0) WHERE id = tool_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_post_comments(post_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE community_posts SET comments_count = COALESCE(comments_count, 0) + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_post_upvotes(target_id UUID, increment_by INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
    UPDATE community_posts SET upvotes = GREATEST(COALESCE(upvotes, 0) + increment_by, 0) WHERE id = target_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_post_downvotes(target_id UUID, increment_by INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
    UPDATE community_posts SET downvotes = GREATEST(COALESCE(downvotes, 0) + increment_by, 0) WHERE id = target_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_comment_upvotes(target_id UUID, increment_by INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
    UPDATE community_comments SET upvotes = GREATEST(COALESCE(upvotes, 0) + increment_by, 0) WHERE id = target_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_comment_downvotes(target_id UUID, increment_by INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
    UPDATE community_comments SET downvotes = GREATEST(COALESCE(downvotes, 0) + increment_by, 0) WHERE id = target_id;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_ratings_updated_at 
    BEFORE UPDATE ON user_ratings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_memberships_updated_at 
    BEFORE UPDATE ON user_memberships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_trials_updated_at 
    BEFORE UPDATE ON user_trials 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at 
    BEFORE UPDATE ON community_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_comments_updated_at 
    BEFORE UPDATE ON community_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据
INSERT INTO users (id, username, email, display_name, avatar_url) VALUES 
('user_demo_1', 'demo_user', 'demo@example.com', 'Demo User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO community_posts (user_id, title, content, type, category, tags) VALUES 
('user_demo_1', '欢迎来到AI工具社区！', '这是我们社区的第一个帖子，欢迎大家分享和讨论AI工具的使用心得。', 'announcement', 'general', ARRAY['欢迎', '社区', '开始'])
ON CONFLICT DO NOTHING;

-- 添加约束
ALTER TABLE user_favorites ADD CONSTRAINT fk_user_favorites_tool 
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE;

ALTER TABLE user_ratings ADD CONSTRAINT fk_user_ratings_tool 
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE;

# NaviGuard-AI Security Audited - 2026-06-01
