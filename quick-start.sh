#!/bin/bash

# 停止所有 node 进程
killall node 2>/dev/null || true

# 设置环境变量
export NEXT_PUBLIC_SUPABASE_URL=https://msxadilzanoezfbidzyr.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zeGFkaWx6YW5vZXpmYmlkenlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDA4MjAsImV4cCI6MjA2NjY3NjgyMH0.Wuxn_wHPqGhqMqAMQSgZXlPR2Zrp9myUq3b5CKylx00

# 清理并启动
rm -rf .next
PORT=3000 npm run dev -- --turbo

echo "🚀 网站启动在 http://localhost:3000"