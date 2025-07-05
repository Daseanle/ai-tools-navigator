-- RLS政策设置 - 为AI工具导航应用配置行级安全

-- 1. 启用RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE use_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 2. 公开读取政策（所有人可以查看）
CREATE POLICY "Allow public read access" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON tools
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access" ON tags
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON tool_categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON tool_tags
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON use_cases
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON workflows
    FOR SELECT USING (true);

-- 3. 用户相关数据政策
-- 用户只能管理自己的收藏
CREATE POLICY "Users can manage own bookmarks" ON bookmarks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON favorites
    FOR ALL USING (auth.uid() = user_id);

-- 用户只能管理自己的评论
CREATE POLICY "Users can manage own reviews" ON reviews
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own comments" ON comments
    FOR ALL USING (auth.uid() = user_id);

-- 用户只能管理自己的点赞
CREATE POLICY "Users can manage own upvotes" ON upvotes
    FOR ALL USING (auth.uid() = user_id);

-- 4. 管理员政策
-- 检查用户是否为管理员的函数
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = is_admin.user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 管理员可以管理所有数据
CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage tools" ON tools
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage tags" ON tags
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage tool_categories" ON tool_categories
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage use_cases" ON use_cases
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage workflows" ON workflows
    FOR ALL USING (is_admin(auth.uid()));

-- 5. 搜索日志政策
CREATE POLICY "Users can create search logs" ON search_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view search logs" ON search_logs
    FOR SELECT USING (is_admin(auth.uid()));

-- 6. 匿名用户政策（可选）
-- 允许匿名用户查看公开内容
CREATE POLICY "Allow anonymous read access" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access" ON tools  
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow anonymous read access" ON tags
    FOR SELECT USING (true);

-- 7. 性能优化索引
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_auth ON bookmarks(user_id) WHERE user_id = auth.uid();
CREATE INDEX IF NOT EXISTS idx_favorites_user_auth ON favorites(user_id) WHERE user_id = auth.uid();
CREATE INDEX IF NOT EXISTS idx_reviews_user_auth ON reviews(user_id) WHERE user_id = auth.uid();
CREATE INDEX IF NOT EXISTS idx_comments_user_auth ON comments(user_id) WHERE user_id = auth.uid();
CREATE INDEX IF NOT EXISTS idx_upvotes_user_auth ON upvotes(user_id) WHERE user_id = auth.uid();

-- 8. 函数：获取用户收藏的工具
CREATE OR REPLACE FUNCTION get_user_favorites(user_uuid UUID)
RETURNS TABLE (
    tool_id INTEGER,
    tool_name VARCHAR,
    tool_slug VARCHAR,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.slug,
        f.created_at
    FROM favorites f
    JOIN tools t ON f.tool_id = t.id
    WHERE f.user_id = user_uuid
    ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 函数：获取工具统计信息
CREATE OR REPLACE FUNCTION get_tool_stats(tool_id_param INTEGER)
RETURNS TABLE (
    upvotes_count BIGINT,
    favorites_count BIGINT,
    comments_count BIGINT,
    avg_rating NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM upvotes WHERE tool_id = tool_id_param),
        (SELECT COUNT(*) FROM favorites WHERE tool_id = tool_id_param),
        (SELECT COUNT(*) FROM comments WHERE tool_id = tool_id_param),
        (SELECT AVG(rating) FROM comments WHERE tool_id = tool_id_param AND rating IS NOT NULL)
    ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 实时订阅权限
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON favorites, bookmarks, reviews, comments, upvotes TO authenticated;