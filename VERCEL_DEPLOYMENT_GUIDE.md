# AI工具导航系统 - Vercel部署指南

## 🚀 部署准备

### 1. 环境变量配置
在Vercel项目设置中添加以下环境变量：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# 应用配置
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com

# AI API配置
OPENAI_API_KEY=your-openai-api-key
OPENROUTER_API_KEY=your-openrouter-api-key

# 支付配置（可选）
WECHAT_PAY_MERCHANT_ID=your-wechat-merchant-id
WECHAT_PAY_API_KEY=your-wechat-api-key
ALIPAY_APP_ID=your-alipay-app-id
ALIPAY_PRIVATE_KEY=your-alipay-private-key
```

### 2. 数据库初始化
在Supabase SQL编辑器中依次执行：

```sql
-- 1. 核心系统表结构
-- 执行: database/core-system-schema.sql

-- 2. 支付和Prompt系统表结构
-- 执行: database/payment-prompt-schema-fixed.sql

-- 3. 试用和分销系统表结构
-- 执行: database/trial-affiliate-tables.sql

-- 4. 自动化内容系统表结构
-- 执行: database/automated-content-schema.sql
```

## 📦 部署步骤

### 1. 通过GitHub部署

```bash
# 1. 创建GitHub仓库
git init
git add .
git commit -m "Initial commit: AI工具导航系统"
git remote add origin https://github.com/yourusername/ai-tools-navigator.git
git push -u origin main

# 2. 在Vercel中导入项目
# - 访问 https://vercel.com/new
# - 选择GitHub仓库
# - 配置项目设置
```

### 2. 通过Vercel CLI部署

```bash
# 1. 安装Vercel CLI
npm install -g vercel

# 2. 登录Vercel
vercel login

# 3. 部署项目
vercel

# 4. 配置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... 添加其他环境变量

# 5. 重新部署
vercel --prod
```

### 3. 自动化部署脚本

```bash
#!/bin/bash
# deploy-to-vercel.sh

echo "🚀 部署AI工具导航系统到Vercel..."

# 检查环境
echo "📋 检查部署环境..."
node -v
npm -v

# 安装依赖
echo "📦 安装依赖..."
npm install --legacy-peer-deps

# 类型检查
echo "🔍 类型检查..."
npm run type-check

# 构建项目
echo "🏗️ 构建项目..."
npm run build

# 部署到Vercel
echo "🚀 部署到Vercel..."
vercel --prod

echo "✅ 部署完成！"
```

## 🔧 Vercel配置优化

### 1. 性能优化
```json
// vercel.json
{
  "framework": "nextjs",
  "functions": {
    "app/**": {
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, stale-while-revalidate=86400"
        }
      ]
    }
  ]
}
```

### 2. 安全配置
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 3. 自动化Cron任务
```json
{
  "crons": [
    {
      "path": "/api/automation/full-content-automation",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/automation/seo-sync",
      "schedule": "0 6 * * *"
    }
  ]
}
```

## 🔍 部署后验证

### 1. 功能测试清单
- [ ] 首页加载正常
- [ ] 工具搜索功能
- [ ] 用户认证系统
- [ ] 试用功能
- [ ] 分销系统
- [ ] 支付系统
- [ ] 管理后台
- [ ] API接口响应
- [ ] 数据库连接
- [ ] 自动化任务

### 2. 性能检查
```bash
# 使用Lighthouse检查性能
npm install -g lighthouse
lighthouse https://your-domain.vercel.app --view

# 使用Web Vitals检查
npx web-vitals https://your-domain.vercel.app
```

### 3. API端点测试
```bash
# 测试核心API
curl https://your-domain.vercel.app/api/tools
curl https://your-domain.vercel.app/api/categories
curl https://your-domain.vercel.app/api/search?q=AI
curl https://your-domain.vercel.app/api/automation/status
```

## 📊 监控和维护

### 1. 错误监控
```javascript
// 配置错误监控
export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // 配置错误监控
    if (process.env.NODE_ENV === 'production') {
      // 错误上报逻辑
    }
  }, [])
}
```

### 2. 性能监控
```javascript
// 性能监控
export function reportWebVitals(metric) {
  if (process.env.NODE_ENV === 'production') {
    // 发送性能数据
    analytics.track('Web Vitals', metric)
  }
}
```

### 3. 日志记录
```javascript
// API错误日志
export default function handler(req, res) {
  try {
    // API逻辑
  } catch (error) {
    console.error('API Error:', error)
    // 发送错误报告
  }
}
```

## 🎯 部署后优化建议

### 1. CDN优化
- 使用Vercel Edge Network
- 配置静态资源缓存
- 优化图片加载

### 2. 数据库优化
- 配置Supabase连接池
- 优化查询性能
- 设置适当的索引

### 3. 自动化管理
- 配置GitHub Actions
- 设置自动部署
- 监控系统状态

## 🔗 相关资源

- [Vercel部署文档](https://vercel.com/docs)
- [Next.js部署指南](https://nextjs.org/docs/deployment)
- [Supabase集成指南](https://supabase.com/docs/guides/with-nextjs)

## 🎉 部署完成！

你的AI工具导航系统现已成功部署到Vercel！

**主要功能：**
✅ 完整的工具管理系统
✅ 智能搜索功能
✅ 用户认证和管理
✅ 试用和分销系统
✅ 支付和会员系统
✅ AI自动化管理
✅ 响应式设计
✅ 性能优化
✅ 安全配置

**访问地址：** https://your-domain.vercel.app

开始测试你的AI工具导航平台吧！

<!-- NaviGuard-AI Security Audited - 2026-06-01 -->
