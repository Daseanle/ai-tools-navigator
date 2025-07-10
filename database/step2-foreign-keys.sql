-- AI工具导航系统 - 第二步：添加外键约束
-- 在基础表创建完成后执行

-- 为tools表添加外键约束
ALTER TABLE tools 
ADD CONSTRAINT fk_tools_category_id 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- 为tool_ratings表添加外键约束
ALTER TABLE tool_ratings 
ADD CONSTRAINT fk_tool_ratings_tool_id 
FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE;

ALTER TABLE tool_ratings 
ADD CONSTRAINT fk_tool_ratings_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 为user_favorites表添加外键约束
ALTER TABLE user_favorites 
ADD CONSTRAINT fk_user_favorites_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_favorites 
ADD CONSTRAINT fk_user_favorites_tool_id 
FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE;

-- 为user_memberships表添加外键约束
ALTER TABLE user_memberships 
ADD CONSTRAINT fk_user_memberships_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 为user_settings表添加外键约束
ALTER TABLE user_settings 
ADD CONSTRAINT fk_user_settings_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 添加唯一约束
ALTER TABLE tool_ratings 
ADD CONSTRAINT uk_tool_ratings_user_tool 
UNIQUE(tool_id, user_id);

ALTER TABLE user_favorites 
ADD CONSTRAINT uk_user_favorites_user_tool 
UNIQUE(user_id, tool_id);

ALTER TABLE user_settings 
ADD CONSTRAINT uk_user_settings_user_id 
UNIQUE(user_id);

-- 验证外键约束
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('tools', 'tool_ratings', 'user_favorites', 'user_memberships', 'user_settings')
ORDER BY tc.table_name, tc.constraint_name;