#!/bin/bash

# Supabase数据导入自动化脚本
# 使用方法: ./scripts/import-data.sh

set -e

echo "🚀 开始Supabase数据导入..."

# 检查环境变量
if [ -z "$SUPABASE_PROJECT_REF" ] || [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "❌ 请设置环境变量:"
    echo "export SUPABASE_PROJECT_REF=your-project-ref"
    echo "export SUPABASE_DB_PASSWORD=your-db-password"
    exit 1
fi

# 数据库连接信息
DB_HOST="db.${SUPABASE_PROJECT_REF}.supabase.co"
DB_NAME="postgres"
DB_USER="postgres"
DB_PORT="5432"

echo "📡 连接到Supabase数据库..."
echo "Host: $DB_HOST"

# 1. 创建表结构
echo "📋 创建数据库表结构..."
PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/create-tables-updated.sql

if [ $? -eq 0 ]; then
    echo "✅ 表结构创建成功"
else
    echo "❌ 表结构创建失败"
    exit 1
fi

# 2. 导入CSV数据
echo "📊 开始导入CSV数据..."

# 检查CSV文件是否存在
CSV_FILES=(
    "/Users/dasean/Downloads/categories_rows.csv"
    "/Users/dasean/Downloads/tags_rows.csv"
    "/Users/dasean/Downloads/tools_rows.csv"
    "/Users/dasean/Downloads/tool_categories_rows.csv"
    "/Users/dasean/Downloads/admins_rows.csv"
    "/Users/dasean/Downloads/comments_rows.csv"
    "/Users/dasean/Downloads/favorites_rows.csv"
    "/Users/dasean/Downloads/upvotes_rows.csv"
    "/Users/dasean/Downloads/use_cases_rows.csv"
    "/Users/dasean/Downloads/workflows_rows.csv"
)

for file in "${CSV_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ CSV文件不存在: $file"
        exit 1
    fi
done

# 按顺序导入数据
echo "📥 导入分类数据..."
PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\\copy categories(id, name, slug, description) FROM '/Users/dasean/Downloads/categories_rows.csv' WITH (FORMAT csv, HEADER true);"

echo "📥 导入标签数据..."
PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\\copy tags(id, name, created_at) FROM '/Users/dasean/Downloads/tags_rows.csv' WITH (FORMAT csv, HEADER true);"

echo "📥 更新标签slug..."
PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "UPDATE tags SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;"

echo "📥 导入工具数据..."
PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\\copy tools(id, created_at, name, tagline, description, logo_url, website_url, pricing, has_api, upvotes_count, slug, pricing_type, api_support, media, search_vector) FROM '/Users/dasean/Downloads/tools_rows.csv' WITH (FORMAT csv, HEADER true);"

echo "📥 导入工具分类关联..."
PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\\copy tool_categories(tool_id, category_id) FROM '/Users/dasean/Downloads/tool_categories_rows.csv' WITH (FORMAT csv, HEADER true);"

echo "📥 导入其他数据..."
PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\\copy admins(id, user_id, created_at) FROM '/Users/dasean/Downloads/admins_rows.csv' WITH (FORMAT csv, HEADER true);"

PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\\copy comments(id, user_id, tool_id, content, created_at, rating) FROM '/Users/dasean/Downloads/comments_rows.csv' WITH (FORMAT csv, HEADER true);"

PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\\copy favorites(user_id, tool_id, created_at) FROM '/Users/dasean/Downloads/favorites_rows.csv' WITH (FORMAT csv, HEADER true);"

PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\\copy upvotes(user_id, tool_id, created_at) FROM '/Users/dasean/Downloads/upvotes_rows.csv' WITH (FORMAT csv, HEADER true);"

PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\\copy use_cases(id, created_at, title, prompt, notes, tool_id, upvotes) FROM '/Users/dasean/Downloads/use_cases_rows.csv' WITH (FORMAT csv, HEADER true);"

PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\\copy workflows(id, created_at, title, description, steps) FROM '/Users/dasean/Downloads/workflows_rows.csv' WITH (FORMAT csv, HEADER true);"

# 3. 更新序列值
echo "🔄 更新序列值..."
PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('tools_id_seq', (SELECT MAX(id) FROM tools));
SELECT setval('tags_id_seq', (SELECT MAX(id) FROM tags));
SELECT setval('tool_categories_id_seq', (SELECT MAX(id) FROM tool_categories));
SELECT setval('favorites_id_seq', (SELECT MAX(id) FROM favorites));
SELECT setval('comments_id_seq', (SELECT MAX(id) FROM comments));
SELECT setval('upvotes_id_seq', (SELECT MAX(id) FROM upvotes));
SELECT setval('use_cases_id_seq', (SELECT MAX(id) FROM use_cases));
SELECT setval('workflows_id_seq', (SELECT MAX(id) FROM workflows));
EOF

# 4. 验证数据
echo "🔍 验证数据导入..."
PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
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
EOF

echo ""
echo "🎉 数据导入完成！"
echo "💡 下一步:"
echo "1. 在Supabase仪表板中检查数据"
echo "2. 设置RLS政策"
echo "3. 运行 npm run dev 启动应用"

# NaviGuard-AI Security Audited - 2026-06-01
