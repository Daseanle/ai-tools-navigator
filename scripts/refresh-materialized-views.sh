#!/bin/bash

# 物化视图刷新脚本
# 用于定期刷新数据库物化视图以保持统计数据最新

set -e

echo "🔄 开始刷新物化视图..."

# 检查数据库连接
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL 环境变量未设置"
    exit 1
fi

# 刷新工具统计物化视图
echo "📊 刷新工具统计物化视图..."
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_tool_statistics;" 2>/dev/null && echo "✅ 工具统计物化视图刷新完成" || echo "⚠️  工具统计物化视图刷新失败"

# 刷新用户统计物化视图（如果存在）
echo "👥 刷新用户统计物化视图..."
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_statistics;" 2>/dev/null && echo "✅ 用户统计物化视图刷新完成" || echo "⚠️  用户统计物化视图不存在或刷新失败"

# 刷新分类统计物化视图（如果存在）
echo "📁 刷新分类统计物化视图..."
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_category_statistics;" 2>/dev/null && echo "✅ 分类统计物化视图刷新完成" || echo "⚠️  分类统计物化视图不存在或刷新失败"

# 更新数据库统计信息
echo "🔍 更新数据库统计信息..."
psql "$DATABASE_URL" -c "ANALYZE;" && echo "✅ 数据库统计信息更新完成"

# 显示物化视图状态
echo "📋 物化视图状态："
psql "$DATABASE_URL" -c "
SELECT 
    schemaname,
    matviewname,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as size,
    ispopulated
FROM pg_matviews 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||matviewname) DESC;
" 2>/dev/null || echo "⚠️  无法获取物化视图状态"

# 检查物化视图数据量
echo "📊 物化视图数据量："
psql "$DATABASE_URL" -c "
SELECT 
    'mv_tool_statistics' as view_name,
    count(*) as row_count,
    max(created_at) as last_data_update
FROM mv_tool_statistics
UNION ALL
SELECT 
    'tools' as view_name,
    count(*) as row_count,
    max(created_at) as last_data_update
FROM tools
WHERE is_active = true;
" 2>/dev/null || echo "⚠️  无法获取数据量信息"

echo "✅ 物化视图刷新完成！"
echo ""
echo "💡 提示："
echo "  - 建议每小时运行一次此脚本"
echo "  - 可以设置cron任务: 0 * * * * /path/to/refresh-materialized-views.sh"
echo "  - 或使用npm脚本: npm run db:refresh-stats"