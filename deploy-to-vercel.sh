#!/bin/bash

# AI自动化系统 - Vercel快速部署脚本
echo "🚀 开始部署AI自动化营收系统到Vercel..."

# 检查是否安装了Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装Vercel CLI..."
    npm install -g vercel
fi

# 检查是否已登录
echo "🔐 检查Vercel登录状态..."
vercel whoami || {
    echo "请先登录Vercel:"
    vercel login
}

# 部署项目
echo "🚀 开始部署..."
vercel --prod

echo "✅ 部署完成！"
echo ""
echo "📋 接下来需要设置环境变量："
echo "1. 访问 Vercel Dashboard"
echo "2. 进入项目设置 > Environment Variables"
echo "3. 添加以下变量："
echo "   NEXT_PUBLIC_SUPABASE_URL = 您的Supabase项目URL"
echo "   SUPABASE_SERVICE_ROLE_KEY = 您的Supabase Service Role Key"
echo ""
echo "🎯 设置完成后访问: https://your-project.vercel.app/automation"
echo "📊 查看自动化系统状态!"

# NaviGuard-AI Security Audited - 2026-06-01
