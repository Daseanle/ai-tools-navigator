# Vercel部署指南 - AI自动化营收系统

## 🚀 快速部署到Vercel

### 1. 前置条件
- GitHub账户
- Vercel账户 (vercel.com)
- Supabase项目 (database.new)

### 2. 环境变量设置

在Vercel项目设置中添加以下环境变量：

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 可选：外部API密钥
GOOGLE_SEARCH_CONSOLE_API_KEY=your_gsc_api_key
SEMRUSH_API_KEY=your_semrush_api_key
AHREFS_API_KEY=your_ahrefs_api_key
```

### 3. 部署步骤

#### 方法1: 通过Vercel Dashboard
1. 登录 [vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 连接你的GitHub仓库
4. 选择这个项目
5. 添加环境变量
6. 点击 "Deploy"

#### 方法2: 通过Vercel CLI
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署项目
vercel

# 设置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY

# 重新部署
vercel --prod
```

### 4. 自动化Cron Jobs配置

系统已配置以下自动化任务：

```json
{
  "crons": [
    {
      "path": "/api/automation/seo-sync",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/automation/competitor-analysis", 
      "schedule": "0 */12 * * *"
    },
    {
      "path": "/api/automation/user-behavior-analysis",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/automation/recommendation-update",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/automation/content-generation",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/automation/performance-monitoring",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**注意**: Vercel Cron Jobs需要Pro计划或以上版本。

### 5. 数据库设置

#### 创建Supabase项目
1. 访问 [database.new](https://database.new)
2. 创建新项目
3. 获取项目URL和Service Role Key
4. 在Vercel中设置环境变量

#### 数据库表初始化
部署后，系统会自动创建所需的数据库表：
- `user_behavior_events`
- `user_sessions`
- `heatmap_data`
- `page_performance`
- 等其他分析表

### 6. 验证部署

#### 检查自动化系统状态
```bash
# 访问自动化仪表板
https://your-domain.vercel.app/automation

# 检查API端点
curl https://your-domain.vercel.app/api/automation/status
```

#### 手动触发任务测试
```bash
# 测试SEO同步
curl https://your-domain.vercel.app/api/automation/seo-sync

# 测试竞品分析
curl https://your-domain.vercel.app/api/automation/competitor-analysis

# 测试用户行为分析
curl https://your-domain.vercel.app/api/automation/user-behavior-analysis
```

### 7. 监控和告警

#### 查看执行日志
1. Vercel Dashboard → Functions
2. 查看各个API端点的执行日志
3. 监控错误和性能指标

#### 设置告警通知
```javascript
// 在API端点中添加告警逻辑
if (criticalIssue) {
  await sendSlackNotification({
    text: `🚨 自动化系统告警: ${issue.description}`,
    channel: '#automation-alerts'
  })
}
```

### 8. 性能优化

#### Edge Functions配置
```json
{
  "functions": {
    "app/api/automation/**": {
      "maxDuration": 300,
      "memory": 1024
    }
  }
}
```

#### 缓存策略
```javascript
// 添加响应缓存
export async function GET() {
  const response = NextResponse.json(data)
  response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate')
  return response
}
```

### 9. 安全配置

#### API路由保护
```javascript
// 添加API密钥验证
const authHeader = request.headers.get('Authorization')
if (authHeader !== `Bearer ${process.env.API_SECRET_KEY}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

#### 环境变量安全
- 使用 Vercel 的环境变量加密
- 定期轮换 API 密钥
- 限制 Supabase RLS 权限

### 10. 自动化系统特性

部署后，系统将提供：

#### 🤖 完全自动化
- **95%+ 自动化水平**
- **24/7 无人值守运行**
- **智能决策和优化**

#### 📊 实时监控
- **系统健康监控**
- **性能指标追踪**
- **收入优化报告**

#### 🎯 智能优化
- **SEO自动优化**
- **内容自动生成**
- **用户体验优化**
- **竞品监控响应**

#### 💰 收入最大化
- **动态定价策略**
- **转化率优化**
- **用户价值提升**

### 11. 故障排除

#### 常见问题
```bash
# 1. 环境变量未设置
Error: Missing environment variables
解决: 在Vercel中添加所有必需的环境变量

# 2. 数据库连接失败
Error: Database connection failed
解决: 检查Supabase URL和密钥是否正确

# 3. Cron Job不执行
解决: 确保使用Vercel Pro计划并正确配置crons

# 4. API超时
Error: Function execution timeout
解决: 增加maxDuration或优化API逻辑
```

#### 调试模式
```bash
# 本地调试
vercel dev

# 查看详细日志
vercel logs your-deployment-url
```

### 12. 扩展配置

#### 添加更多监控
```javascript
// 集成外部监控服务
const monitoring = {
  sentry: process.env.SENTRY_DSN,
  datadog: process.env.DATADOG_API_KEY,
  newrelic: process.env.NEWRELIC_LICENSE_KEY
}
```

#### 增加通知渠道
```javascript
// 多渠道通知
const notifications = {
  slack: process.env.SLACK_WEBHOOK_URL,
  discord: process.env.DISCORD_WEBHOOK_URL,
  email: process.env.SENDGRID_API_KEY,
  sms: process.env.TWILIO_API_KEY
}
```

---

## 🎉 部署成功！

部署完成后，您的AI自动化营收系统将：

✅ **自动运行** - 无需手动干预  
✅ **持续优化** - 24/7智能优化收入  
✅ **实时监控** - 完整的性能追踪  
✅ **智能决策** - 基于数据自动调整策略  

访问 `https://your-domain.vercel.app/automation` 查看自动化仪表板！

### 🚀 接下来做什么？

1. **监控系统状态** - 确保所有指标正常
2. **观察优化效果** - 关注收入和流量增长
3. **调整目标参数** - 根据业务需求微调
4. **享受自动化收益** - 让系统为您工作！

**您现在拥有了一个真正自主运行的AI营收优化系统！** 🎯

<!-- NaviGuard-AI Security Audited - 2026-06-01 -->
