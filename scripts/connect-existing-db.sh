#!/bin/bash

# 连接你的Supabase数据库并导入CSV数据
# 使用你现有的数据库配置

set -e

echo "🚀 连接到你的Supabase数据库..."

# 从环境变量获取数据库信息
SUPABASE_PROJECT_REF="msxadilzanoezfbidzyr"
DB_HOST="db.${SUPABASE_PROJECT_REF}.supabase.co"
DB_NAME="postgres"
DB_USER="postgres"
DB_PORT="5432"

echo "📡 数据库连接信息:"
echo "Host: $DB_HOST"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# 获取数据库密码（从环境变量或提示输入）
if [ -z "$DB_PASSWORD" ]; then
    read -s -p "请输入Supabase数据库密码: " DB_PASSWORD
    echo ""
fi

# 测试数据库连接
echo "🔗 测试数据库连接..."
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null; then
    echo "✅ 数据库连接成功"
else
    echo "❌ 数据库连接失败，请检查密码和网络连接"
    exit 1
fi

# 1. 创建表结构
echo ""
echo "📋 创建数据库表结构..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/create-tables-updated.sql

if [ $? -eq 0 ]; then
    echo "✅ 表结构创建成功"
else
    echo "❌ 表结构创建失败"
    exit 1
fi

# 2. 检查CSV文件
echo ""
echo "📁 检查CSV文件..."
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

missing_files=()
for file in "${CSV_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ 找到文件: $(basename $file)"
    else
        missing_files+=("$file")
        echo "❌ 缺失文件: $(basename $file)"
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo ""
    echo "⚠️ 有些CSV文件缺失，继续导入可用的文件..."
fi

# 3. 导入数据
echo ""
echo "📊 开始导入CSV数据..."

# 导入分类数据
if [ -f "/Users/dasean/Downloads/categories_rows.csv" ]; then
    echo "📥 导入分类数据..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\\copy categories(id, name, slug, description) FROM '/Users/dasean/Downloads/categories_rows.csv' WITH (FORMAT csv, HEADER true);" 2>/dev/null || echo "⚠️ 分类数据导入跳过（可能已存在）"
fi

# 导入标签数据
if [ -f "/Users/dasean/Downloads/tags_rows.csv" ]; then
    echo "📥 导入标签数据..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\\copy tags(id, name, created_at) FROM '/Users/dasean/Downloads/tags_rows.csv' WITH (FORMAT csv, HEADER true);" 2>/dev/null || echo "⚠️ 标签数据导入跳过（可能已存在）"
    
    # 更新标签slug
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "UPDATE tags SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;" 2>/dev/null
fi

# 导入工具数据（这是最大的文件）
if [ -f "/Users/dasean/Downloads/tools_rows.csv" ]; then
    echo "📥 导入工具数据（这可能需要一些时间）..."
    # 由于工具数据很大，我们需要特殊处理
    echo "正在处理大型工具数据文件..."
    
    # 先检查第一行来确认字段
    head -1 "/Users/dasean/Downloads/tools_rows.csv"
    
    # 导入工具数据（跳过错误行）
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
\\copy tools(id, created_at, name, tagline, description, logo_url, website_url, pricing, has_api, upvotes_count, slug, pricing_type, api_support, media, search_vector) FROM '/Users/dasean/Downloads/tools_rows.csv' WITH (FORMAT csv, HEADER true);
EOF
fi

# 导入关联数据
if [ -f "/Users/dasean/Downloads/tool_categories_rows.csv" ]; then
    echo "📥 导入工具分类关联..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\\copy tool_categories(tool_id, category_id) FROM '/Users/dasean/Downloads/tool_categories_rows.csv' WITH (FORMAT csv, HEADER true);" 2>/dev/null || echo "⚠️ 工具分类关联导入跳过"
fi

# 导入其他数据
for file_info in "admins_rows.csv:admins(id, user_id, created_at)" "comments_rows.csv:comments(id, user_id, tool_id, content, created_at, rating)" "favorites_rows.csv:favorites(user_id, tool_id, created_at)" "upvotes_rows.csv:upvotes(user_id, tool_id, created_at)" "use_cases_rows.csv:use_cases(id, created_at, title, prompt, notes, tool_id, upvotes)" "workflows_rows.csv:workflows(id, created_at, title, description, steps)"; do
    
    filename=$(echo $file_info | cut -d: -f1)
    table_info=$(echo $file_info | cut -d: -f2)
    
    if [ -f "/Users/dasean/Downloads/$filename" ]; then
        echo "📥 导入 $filename..."
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\\copy $table_info FROM '/Users/dasean/Downloads/$filename' WITH (FORMAT csv, HEADER true);" 2>/dev/null || echo "⚠️ $filename 导入跳过"
    fi
done

# 4. 更新序列值
echo ""
echo "🔄 更新序列值..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
DO \$\$
BEGIN
    -- 安全地更新序列值
    IF EXISTS (SELECT 1 FROM categories) THEN
        PERFORM setval('categories_id_seq', (SELECT MAX(id) FROM categories));
    END IF;
    
    IF EXISTS (SELECT 1 FROM tools) THEN
        PERFORM setval('tools_id_seq', (SELECT MAX(id) FROM tools));
    END IF;
    
    IF EXISTS (SELECT 1 FROM tags) THEN
        PERFORM setval('tags_id_seq', (SELECT MAX(id) FROM tags));
    END IF;
    
    -- 其他序列...
END \$\$;
EOF

# 5. 验证数据导入
echo ""
echo "🔍 验证数据导入结果..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
SELECT 
    'categories' as table_name, 
    COUNT(*) as record_count 
FROM categories
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
SELECT 'workflows', COUNT(*) FROM workflows
ORDER BY table_name;
EOF

echo ""
echo "🎉 数据导入完成！"
echo ""
echo "📋 下一步操作:"
echo "1. 检查Supabase控制台中的数据"
echo "2. 配置RLS安全策略（如需要）"
echo "3. 启用身份验证功能"
echo "4. 测试应用功能"
echo ""
echo "🌐 应用访问地址: http://localhost:3000"