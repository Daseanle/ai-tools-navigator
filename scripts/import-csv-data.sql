-- CSV数据迁移脚本
-- 运行此脚本前请确保已经执行了create-tables-updated.sql

-- 1. 导入分类数据
\copy categories(id, name, slug, description) FROM '/Users/dasean/Downloads/categories_rows.csv' WITH (FORMAT csv, HEADER true);

-- 2. 导入标签数据 
\copy tags(id, name, created_at) FROM '/Users/dasean/Downloads/tags_rows.csv' WITH (FORMAT csv, HEADER true);

-- 为标签生成slug
UPDATE tags SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;

-- 3. 导入工具数据（需要处理字段映射）
\copy tools(id, created_at, name, tagline, description, logo_url, website_url, pricing, has_api, upvotes_count, slug, pricing_type, api_support, media, search_vector) FROM '/Users/dasean/Downloads/tools_rows.csv' WITH (FORMAT csv, HEADER true);

-- 4. 导入工具分类关联数据
\copy tool_categories(tool_id, category_id) FROM '/Users/dasean/Downloads/tool_categories_rows.csv' WITH (FORMAT csv, HEADER true);

-- 5. 导入管理员数据
\copy admins(id, user_id, created_at) FROM '/Users/dasean/Downloads/admins_rows.csv' WITH (FORMAT csv, HEADER true);

-- 6. 导入评论数据
\copy comments(id, user_id, tool_id, content, created_at, rating) FROM '/Users/dasean/Downloads/comments_rows.csv' WITH (FORMAT csv, HEADER true);

-- 7. 导入收藏数据
\copy favorites(user_id, tool_id, created_at) FROM '/Users/dasean/Downloads/favorites_rows.csv' WITH (FORMAT csv, HEADER true);

-- 8. 导入点赞数据
\copy upvotes(user_id, tool_id, created_at) FROM '/Users/dasean/Downloads/upvotes_rows.csv' WITH (FORMAT csv, HEADER true);

-- 9. 导入用例数据
\copy use_cases(id, created_at, title, prompt, notes, tool_id, upvotes) FROM '/Users/dasean/Downloads/use_cases_rows.csv' WITH (FORMAT csv, HEADER true);

-- 10. 导入工作流数据
\copy workflows(id, created_at, title, description, steps) FROM '/Users/dasean/Downloads/workflows_rows.csv' WITH (FORMAT csv, HEADER true);

-- 更新序列值以避免主键冲突
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('tools_id_seq', (SELECT MAX(id) FROM tools));
SELECT setval('tags_id_seq', (SELECT MAX(id) FROM tags));
SELECT setval('tool_categories_id_seq', (SELECT MAX(id) FROM tool_categories));
SELECT setval('tool_tags_id_seq', (SELECT MAX(id) FROM tool_tags));
SELECT setval('bookmarks_id_seq', (SELECT MAX(id) FROM bookmarks));
SELECT setval('favorites_id_seq', (SELECT MAX(id) FROM favorites));
SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews));
SELECT setval('comments_id_seq', (SELECT MAX(id) FROM comments));
SELECT setval('upvotes_id_seq', (SELECT MAX(id) FROM upvotes));
SELECT setval('use_cases_id_seq', (SELECT MAX(id) FROM use_cases));
SELECT setval('workflows_id_seq', (SELECT MAX(id) FROM workflows));

-- 数据验证查询
SELECT 'categories' as table_name, COUNT(*) as record_count FROM categories
UNION ALL
SELECT 'tools', COUNT(*) FROM tools
UNION ALL  
SELECT 'tags', COUNT(*) FROM tags
UNION ALL
SELECT 'tool_categories', COUNT(*) FROM tool_categories
UNION ALL
SELECT 'admins', COUNT(*) FROM admins
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'favorites', COUNT(*) FROM favorites
UNION ALL
SELECT 'upvotes', COUNT(*) FROM upvotes
UNION ALL
SELECT 'use_cases', COUNT(*) FROM use_cases
UNION ALL
SELECT 'workflows', COUNT(*) FROM workflows;