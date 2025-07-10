#!/bin/bash

# 数据库优化脚本
# 用于应用优化schema并运行性能提升命令

set -e

echo "🚀 开始数据库优化..."

# 检查数据库连接
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL 环境变量未设置"
    exit 1
fi

# 应用优化schema
echo "📋 应用优化schema..."
if [ -f "database/optimized-schema.sql" ]; then
    psql "$DATABASE_URL" -f database/optimized-schema.sql
    echo "✅ 优化schema应用完成"
else
    echo "⚠️  优化schema文件不存在，跳过..."
fi

# 更新数据库统计信息
echo "📊 更新数据库统计信息..."
psql "$DATABASE_URL" -c "ANALYZE;"
echo "✅ 数据库统计信息更新完成"

# 刷新物化视图
echo "🔄 刷新物化视图..."
psql "$DATABASE_URL" -c "SELECT refresh_tool_statistics();" 2>/dev/null || echo "⚠️  物化视图刷新失败（可能尚未创建）"

# 创建性能监控函数
echo "🎯 创建性能监控函数..."
psql "$DATABASE_URL" << 'EOF'
-- 创建性能监控函数
CREATE OR REPLACE FUNCTION get_db_performance_metrics()
RETURNS TABLE (
    metric_name text,
    metric_value numeric,
    description text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'table_size_mb'::text,
        ROUND((pg_total_relation_size('tools') / 1024.0 / 1024.0)::numeric, 2),
        'Tools table size in MB'::text
    UNION ALL
    SELECT 
        'index_hit_ratio'::text,
        ROUND((sum(idx_blks_hit) / NULLIF(sum(idx_blks_hit + idx_blks_read), 0) * 100)::numeric, 2),
        'Index cache hit ratio percentage'::text
    FROM pg_statio_user_indexes
    UNION ALL
    SELECT 
        'table_hit_ratio'::text,
        ROUND((sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit + heap_blks_read), 0) * 100)::numeric, 2),
        'Table cache hit ratio percentage'::text
    FROM pg_statio_user_tables
    UNION ALL
    SELECT 
        'active_connections'::text,
        count(*)::numeric,
        'Number of active database connections'::text
    FROM pg_stat_activity
    WHERE state = 'active';
END;
$$ LANGUAGE plpgsql;

-- 创建慢查询监控函数
CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS TABLE (
    query text,
    calls bigint,
    total_time numeric,
    mean_time numeric,
    rows bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pg_stat_statements.query,
        pg_stat_statements.calls,
        ROUND(pg_stat_statements.total_exec_time::numeric, 2),
        ROUND(pg_stat_statements.mean_exec_time::numeric, 2),
        pg_stat_statements.rows
    FROM pg_stat_statements
    WHERE pg_stat_statements.mean_exec_time > 100  -- 超过100ms的查询
    ORDER BY pg_stat_statements.mean_exec_time DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;
EOF

echo "✅ 性能监控函数创建完成"

# 验证优化效果
echo "🔍 验证优化效果..."
psql "$DATABASE_URL" -c "SELECT * FROM get_db_performance_metrics();"

# 显示表大小信息
echo "📋 数据库表大小信息："
psql "$DATABASE_URL" -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;"

# 显示索引使用情况
echo "📊 索引使用情况："
psql "$DATABASE_URL" -c "
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC
LIMIT 10;"

echo "🎉 数据库优化完成！"
echo ""
echo "📈 建议定期运行以下命令："
echo "  npm run db:refresh-stats  # 刷新物化视图"
echo "  npm run db:optimize       # 重新运行优化"
echo ""
echo "📊 监控命令："
echo "  psql \$DATABASE_URL -c 'SELECT * FROM get_db_performance_metrics();'"
echo "  psql \$DATABASE_URL -c 'SELECT * FROM get_slow_queries();'"