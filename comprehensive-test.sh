#!/bin/bash

echo "🚀 开始全面的网站功能测试..."

# 1. 构建测试
echo "📦 测试项目构建..."
npm run production:build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
    exit 1
fi

# 2. 启动开发服务器进行测试
echo "🔄 启动开发服务器..."
npm run dev &
DEV_PID=$!

# 等待服务器启动
sleep 10

# 3. 健康检查
echo "🏥 执行健康检查..."
curl -f http://localhost:3000/api/monitoring/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ 健康检查通过"
else
    echo "⚠️ 健康检查失败"
fi

# 4. API端点测试
echo "🔌 测试关键API端点..."

# 测试工具API
curl -f http://localhost:3000/api/tools > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ 工具API正常"
else
    echo "❌ 工具API失败"
fi

# 测试搜索API
curl -f "http://localhost:3000/api/search?q=AI" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ 搜索API正常"
else
    echo "❌ 搜索API失败"
fi

# 测试自动化状态API
curl -f http://localhost:3000/api/automation/status > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ 自动化状态API正常"
else
    echo "❌ 自动化状态API失败"
fi

# 5. 页面访问测试
echo "📄 测试关键页面..."

# 首页
curl -f http://localhost:3000 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ 首页正常"
else
    echo "❌ 首页失败"
fi

# 工具页面
curl -f http://localhost:3000/tools > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ 工具页面正常"
else
    echo "❌ 工具页面失败"
fi

# 6. 性能测试
echo "⚡ 执行简单性能测试..."
time curl -s http://localhost:3000 > /dev/null

# 7. 清理
echo "🧹 清理测试环境..."
kill $DEV_PID 2>/dev/null

echo "✨ 网站功能测试完成！"