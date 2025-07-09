# AI工具试用和分销系统使用说明

## 🎯 系统概述

本系统实现了完整的AI工具试用和分销功能，包括：
- **真实试用系统**：用户可以获得真实的AI工具试用机会
- **分销佣金系统**：推广伙伴可以获得真实的佣金收入
- **自动化追踪**：完整的点击、试用、转化、佣金计算流程
- **数据统计**：详细的统计报表和收益分析

## 🗄️ 数据库表结构

### 1. user_trials（用户试用记录）
```sql
- id: 试用ID
- user_id: 用户ID
- tool_id: 工具ID (chatgpt, claude, midjourney等)
- offer_id: 试用优惠ID
- type: 试用类型 (free_trial, discount, extended_trial)
- duration: 试用天数
- original_price: 原价
- discounted_price: 折扣价
- promo_code: 促销码
- affiliate_id: 推广伙伴ID
- status: 状态 (active, expired, converted, cancelled)
- started_at: 开始时间
- expires_at: 过期时间
- converted_at: 转化时间
- conversion_value: 转化金额
```

### 2. affiliate_clicks（推广点击记录）
```sql
- id: 点击ID
- affiliate_id: 推广伙伴ID
- tool_id: 工具ID
- user_id: 用户ID
- trial_id: 试用ID
- user_ip: 用户IP
- user_agent: 用户代理
- referrer: 来源页面
- converted: 是否转化
- conversion_value: 转化金额
- commission_earned: 佣金金额
- clicked_at: 点击时间
- converted_at: 转化时间
```

### 3. affiliate_earnings（推广收益记录）
```sql
- id: 收益ID
- affiliate_id: 推广伙伴ID
- tool_id: 工具ID
- click_id: 点击ID
- trial_id: 试用ID
- amount: 佣金金额
- commission_rate: 佣金比例
- status: 状态 (pending, confirmed, paid, cancelled)
- earned_at: 收益时间
- confirmed_at: 确认时间
- paid_at: 支付时间
- description: 描述
```

### 4. affiliate_partners（推广伙伴信息）
```sql
- id: 伙伴ID
- user_id: 用户ID
- status: 状态 (pending, approved, suspended, terminated)
- tier: 等级 (bronze, silver, gold, platinum)
- total_earnings: 总收益
- monthly_earnings: 月收益
- clicks_generated: 生成点击数
- conversions_generated: 生成转化数
- conversion_rate: 转化率
- payout_method: 提现方式
- payout_details: 提现详情
- joined_at: 加入时间
```

## 🔗 API 接口

### 1. 试用API (`/api/trials`)

#### 启动试用 (POST)
```json
{
  "userId": "user-123",
  "offerId": "chatgpt-trial",
  "affiliateId": "partner-456"
}
```

#### 查询试用状态 (GET)
```
/api/trials?trialId=trial-123
/api/trials?userId=user-123
```

### 2. 分销API (`/api/affiliate`)

#### 加入分销计划 (POST)
```json
{
  "userId": "user-123",
  "payoutMethod": "alipay",
  "payoutDetails": {
    "account": "user@example.com",
    "realName": "用户姓名"
  }
}
```

#### 获取分销信息 (GET)
```
/api/affiliate?userId=user-123
/api/affiliate?partnerId=partner-456
```

### 3. 转化API (`/api/conversions`)

#### 记录转化 (POST)
```json
{
  "trialId": "trial-123",
  "conversionValue": 160,
  "subscriptionType": "ChatGPT Plus Monthly"
}
```

#### 查询转化统计 (GET)
```
/api/conversions?affiliateId=partner-456&period=month
```

## 🎨 前端组件

### 1. 试用页面组件
- `components/tools/tool-trial-affiliate.tsx`
- 提供试用和分销两个标签页
- 集成真实API调用
- 自动检测分销状态

### 2. 页面路由
- `/[lang]/trials` - 试用和分销页面
- 支持多语言路由
- 响应式设计

## 💰 佣金配置

### 工具佣金比例
- **ChatGPT Plus**: 15% (¥160 * 0.15 = ¥24)
- **Claude Pro**: 20% (¥150 * 0.20 = ¥30)
- **Midjourney**: 12% (¥80 * 0.12 = ¥9.6)
- **Notion AI**: 25% (¥100 * 0.25 = ¥25)
- **Canva Pro**: 18% (¥90 * 0.18 = ¥16.2)

### 分销等级
- **青铜合伙人**: ¥0+, 基础佣金
- **白银合伙人**: ¥1000+, +5%额外奖励
- **黄金合伙人**: ¥5000+, +10%额外奖励
- **铂金合伙人**: ¥20000+, +15%额外奖励

## 🔄 完整流程

### 1. 试用流程
1. 用户点击试用按钮
2. 系统创建试用记录
3. 记录推广点击（如果有推广者）
4. 跳转到AI工具官网
5. 用户完成试用注册

### 2. 转化流程
1. 用户从试用转为付费订阅
2. 调用转化API记录转化
3. 自动计算佣金金额
4. 更新推广伙伴统计
5. 发送通知给推广者

### 3. 分销流程
1. 用户加入分销计划
2. 生成专属推广链接
3. 分享推广链接给他人
4. 追踪点击和转化
5. 获得佣金收益

## 📊 使用示例

### 启动试用
```typescript
const response = await fetch('/api/trials', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    offerId: 'chatgpt-trial',
    affiliateId: 'partner-456'
  })
})
```

### 记录转化
```typescript
const response = await fetch('/api/conversions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    trialId: 'trial-123',
    conversionValue: 160,
    subscriptionType: 'ChatGPT Plus Monthly'
  })
})
```

### 加入分销
```typescript
const response = await fetch('/api/affiliate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    payoutMethod: 'alipay',
    payoutDetails: {
      account: 'user@example.com',
      realName: '用户姓名'
    }
  })
})
```

## 🔧 部署步骤

### 1. 创建数据库表
```bash
# 在Supabase SQL编辑器中执行
cat database/trial-affiliate-tables.sql
```

### 2. 配置环境变量
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 3. 部署应用
```bash
npm run build
npm start
```

## 📈 数据统计

系统提供多个统计视图：
- `affiliate_stats`: 推广伙伴统计
- `trial_stats`: 试用统计
- `monthly_earnings`: 月度收益统计

## 🔐 安全考虑

- 所有API接口都有参数验证
- 敏感操作需要用户身份验证
- 佣金计算有防重复机制
- 数据库约束确保数据完整性

## 📝 转化集成

详细的转化集成示例请参考 `lib/conversion-examples.ts` 文件，包含：
- ChatGPT 转化回调
- Claude 转化回调
- Midjourney 转化回调
- 通用转化函数
- 推广伙伴通知

## 🎉 现在您的AI工具试用和分销系统已经完全实现！

**主要特性：**
✅ 真实的试用API接口
✅ 完整的分销佣金系统
✅ 自动化点击和转化追踪
✅ 推广伙伴等级管理
✅ 实时统计和报表
✅ 多种支付方式支持
✅ 响应式前端界面
✅ 详细的使用文档

用户现在可以：
1. 获得真实的AI工具试用机会
2. 加入分销计划获得真实佣金
3. 追踪完整的转化流程
4. 查看详细的收益统计
5. 管理推广链接和收益