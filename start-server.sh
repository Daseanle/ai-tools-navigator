#!/bin/bash

# 设置正确的环境变量
export NEXT_PUBLIC_SUPABASE_URL=https://msxadilzanoezfbidzyr.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zeGFkaWx6YW5vZXpmYmlkenlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDA4MjAsImV4cCI6MjA2NjY3NjgyMH0.Wuxn_wHPqGhqMqAMQSgZXlPR2Zrp9myUq3b5CKylx00
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zeGFkaWx6YW5vZXpmYmlkenlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTEwMDgyMCwiZXhwIjoyMDY2Njc2ODIwfQ.4z2MmLpcMVCOyOgUu2SHkW_UH6mV5UaV6Q_dPE-sjwQ
export NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 清理缓存
echo "🧹 清理Next.js缓存..."
rm -rf .next

# 检查环境变量
echo "🔍 环境变量检查:"
echo "NEXT_PUBLIC_SUPABASE_URL: $NEXT_PUBLIC_SUPABASE_URL"

# 构建测试
echo "🔨 测试构建..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    echo "🚀 启动开发服务器..."
    PORT=3000 npm run dev
else
    echo "❌ 构建失败"
    exit 1
fi