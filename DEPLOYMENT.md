# 🚀 AI Tools Navigator - Vercel 部署指南

## 快速部署步骤

### 1. 准备工作
```bash
# 确保所有依赖已安装
npm install

# 构建检查
npm run build
```

### 2. 环境变量配置

在 Vercel Dashboard 中配置以下环境变量：

#### 必需环境变量
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase项目URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase服务密钥
- `NEXT_PUBLIC_SITE_URL` - 部署后的域名 (如: https://ai-tools.vercel.app)

#### 可选环境变量
- `REDIS_URL` - Redis缓存URL (推荐使用)
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID
- `CSRF_SECRET` - CSRF保护密钥

### 3. 部署命令

#### 方式一：通过 GitHub (推荐)
1. 推送代码到 GitHub
2. 在 Vercel 中连接 GitHub 仓库
3. 自动部署

#### 方式二：Vercel CLI
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel --prod
```

### 4. 部署后配置

#### PWA配置
- 确保 `/manifest.json` 可访问
- 验证 Service Worker 正常工作
- 测试离线功能

#### SEO配置
- 验证 `/sitemap.xml` 生成
- 检查 `/robots.txt` 配置
- 测试结构化数据

#### 安全配置
- 验证安全headers
- 测试CSRF保护
- 检查rate limiting

## 🔧 性能优化建议

### Vercel配置优化
- 使用 Edge Functions 处理简单逻辑
- 启用 Image Optimization
- 配置适当的缓存策略

### 数据库优化
- 使用Supabase Edge Functions
- 配置连接池
- 启用只读副本

### 缓存策略
- 配置Redis (Upstash推荐)
- 启用Vercel KV存储
- 使用CDN缓存静态资源

## 📊 监控和分析

### 内置监控
- `/api/monitoring` - 系统监控API
- `/api/cache/monitoring` - 缓存监控
- `/api/seo` - SEO健康检查

### 外部监控
- Vercel Analytics
- Google Analytics
- Microsoft Clarity

## 🐛 故障排除

### 常见问题

1. **构建失败**
   - 检查 TypeScript 错误
   - 验证环境变量配置
   - 查看构建日志

2. **数据库连接问题**
   - 验证 Supabase 配置
   - 检查网络连接
   - 确认密钥权限

3. **缓存问题**
   - 检查 Redis 连接
   - 验证缓存配置
   - 清理过期缓存

### 调试工具
- 开发者仪表板: `/dashboard/developer`
- API健康检查: `/api/health`
- 缓存状态: `/api/cache/monitoring`

## 🔄 更新部署

### 自动部署
推送到主分支自动触发部署

### 手动部署
```bash
vercel --prod
```

### 回滚
```bash
vercel rollback [deployment-url]
```

## 📈 性能基准

### 预期性能指标
- **Lighthouse Score**: 95+
- **加载时间**: < 2秒
- **缓存命中率**: 85%+
- **SEO Score**: 95+

### 核心Web Vitals
- **LCP**: < 2.5秒
- **FID**: < 100ms
- **CLS**: < 0.1

## 🔐 安全检查清单

- [ ] HTTPS 已启用
- [ ] 安全headers 已配置
- [ ] CSRF 保护已启用
- [ ] Rate limiting 已设置
- [ ] 敏感数据已保护
- [ ] API endpoints 已验证

部署完成后，访问您的应用并测试所有功能！🎉
EOF < /dev/null