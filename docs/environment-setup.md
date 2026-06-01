# 🚀 AI Tools Navigator 环境配置指南

本文档详细说明了项目所需的环境变量配置，帮助您快速设置开发和生产环境。

## 📋 目录

- [必需配置 (Required)](#必需配置-required)
- [可选配置 (Optional)](#可选配置-optional)
- [开发环境设置](#开发环境设置)
- [生产环境设置](#生产环境设置)
- [故障排除](#故障排除)

## 🔧 必需配置 (Required)

以下环境变量是项目正常运行的必需配置：

### 1. AI API 配置
```bash
# OpenRouter API - 用于AI模型调用
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

**获取方式：**
1. 访问 [OpenRouter.ai](https://openrouter.ai/)
2. 注册账户并获取API密钥
3. 将密钥复制到环境变量中

### 2. 数据库配置 (Supabase)
```bash
# Supabase 数据库配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**获取方式：**
1. 访问 [Supabase.com](https://supabase.com/)
2. 创建新项目
3. 在项目设置中找到API密钥
4. 复制URL和密钥到环境变量

### 3. 站点配置
```bash
# 站点基本配置
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # 开发环境
# NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app  # 生产环境
NODE_ENV=development  # 或 production
```

## 🔧 可选配置 (Optional)

以下配置可以增强功能，但不是必需的：

### 1. 缓存配置
```bash
# Redis 缓存 (可选，提升性能)
REDIS_URL=redis://localhost:6379
```

### 2. 分析工具
```bash
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Microsoft Clarity
NEXT_PUBLIC_CLARITY_ID=your_clarity_id

# 百度统计
NEXT_PUBLIC_BAIDU_ANALYTICS_ID=your_baidu_id
```

### 3. 搜索引擎验证码
```bash
# 搜索引擎验证 (SEO优化)
GOOGLE_VERIFICATION_CODE=your_google_verification_code
BING_VERIFICATION_CODE=your_bing_verification_code
BAIDU_VERIFICATION_CODE=your_baidu_verification_code
```

### 4. 安全配置
```bash
# CSRF 保护
CSRF_SECRET=your_csrf_secret_key_here

# 地理位置限制 (可选)
BLOCKED_COUNTRIES=  # 留空表示不限制
ALLOWED_COUNTRIES=  # 留空表示允许所有
```

### 5. PWA 推送通知
```bash
# VAPID 密钥对 (PWA推送通知)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

## 💻 开发环境设置

### 快速开始
1. 复制环境变量模板：
```bash
cp .env.example .env.local
```

2. 编辑 `.env.local` 文件，至少配置以下必需变量：
```bash
OPENROUTER_API_KEY=your_actual_api_key
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

3. 安装依赖并启动开发服务器：
```bash
npm install
npm run dev
```

### 开发环境测试配置
如果您还没有真实的API密钥，可以使用测试配置先运行项目：

```bash
# 测试配置 - 仅用于开发测试
OPENROUTER_API_KEY=test_key_for_development
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test_anon_key
SUPABASE_SERVICE_ROLE_KEY=test_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

⚠️ **注意：** 测试配置只能用于基本的开发测试，无法连接真实的数据库和AI服务。

## 🚀 生产环境设置

### Vercel 部署
1. 在 Vercel 项目设置中添加环境变量
2. 确保以下变量已正确配置：
```bash
OPENROUTER_API_KEY=your_production_api_key
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Netlify 部署
1. 在 Netlify 项目设置的 Environment variables 中添加配置
2. 使用相同的生产环境变量

## 🔍 故障排除

### 常见问题

**1. API密钥无效**
- 检查 OpenRouter API 密钥是否正确
- 确认账户余额充足
- 验证密钥权限设置

**2. 数据库连接失败**
- 验证 Supabase URL 和密钥
- 检查数据库是否已启用
- 确认网络连接正常

**3. 环境变量未生效**
- 重启开发服务器 (`npm run dev`)
- 检查 `.env.local` 文件是否在项目根目录
- 确认变量名称无拼写错误

**4. CORS 错误**
- 检查 `NEXT_PUBLIC_SITE_URL` 配置
- 在 Supabase 中配置允许的域名

### 验证配置
运行以下命令验证环境配置：
```bash
npm run build  # 检查构建是否成功
npm run test   # 运行测试套件
```

## 📚 相关文档

- [Next.js 环境变量文档](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Supabase 配置指南](https://supabase.com/docs/guides/getting-started)
- [OpenRouter API 文档](https://openrouter.ai/docs)

## 🆘 需要帮助？

如果在配置过程中遇到问题：

1. 检查本文档的故障排除部分
2. 查看项目的 GitHub Issues
3. 联系开发团队获取支持

---

**重要提醒：** 
- 🔒 永远不要将真实的API密钥提交到版本控制系统
- 🔄 定期轮换敏感的API密钥
- 🛡️ 在生产环境中使用强随机密钥

<!-- NaviGuard-AI Security Audited - 2026-06-01 -->
