# AI工具导航系统 - API文档

## 📋 概览

AI工具导航系统提供完整的RESTful API，支持工具管理、用户系统、搜索、社区互动等功能。

**Base URL**: `/api`  
**版本**: v1  
**认证**: Bearer Token (JWT)

## 🔐 认证

大部分API端点需要用户认证。请在请求头中包含认证令牌：

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📊 响应格式

### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 分页响应
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误信息",
  "details": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🛠️ 工具管理 API

### 获取工具列表
```http
GET /api/tools
```

**查询参数:**
- `page` (int): 页码，默认 1
- `limit` (int): 每页数量，默认 20，最大 100
- `category` (string): 分类ID筛选
- `pricing` (string): 定价类型 (free|freemium|paid)
- `rating` (number): 最低评分
- `sort` (string): 排序字段 (name|rating|visits|created_at)
- `order` (string): 排序方向 (asc|desc)
- `search` (string): 搜索关键词

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "tool-1",
      "name": "ChatGPT",
      "slug": "chatgpt",
      "tagline": "AI对话助手",
      "description": "强大的AI对话工具",
      "logo_url": "https://example.com/logo.png",
      "website_url": "https://chat.openai.com",
      "rating": 4.8,
      "rating_count": 1250,
      "visits": 50000,
      "pricing_type": "freemium",
      "featured": true,
      "category": {
        "id": "cat-1",
        "name": "聊天机器人",
        "slug": "chatbots"
      },
      "tags": [
        { "id": "tag-1", "name": "AI", "slug": "ai" }
      ],
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 获取单个工具
```http
GET /api/tools/{slug}
```

**路径参数:**
- `slug` (string): 工具的唯一标识符

### 创建工具
```http
POST /api/tools
```
*需要认证*

**请求体:**
```json
{
  "name": "工具名称",
  "tagline": "工具标语",
  "description": "详细描述",
  "website_url": "https://example.com",
  "logo_url": "https://example.com/logo.png",
  "category_id": "category-id",
  "pricing_type": "freemium",
  "tags": ["tag1", "tag2"],
  "screenshots": ["url1", "url2"]
}
```

### 更新工具
```http
PUT /api/tools/{id}
```
*需要认证*

### 删除工具
```http
DELETE /api/tools/{id}
```
*需要认证*

## 📂 分类管理 API

### 获取所有分类
```http
GET /api/categories
```

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat-1",
      "name": "聊天机器人",
      "slug": "chatbots",
      "description": "AI对话工具",
      "icon": "message-circle",
      "color": "#3B82F6",
      "tools_count": 25,
      "featured": true
    }
  ]
}
```

### 获取分类下的工具
```http
GET /api/categories/{slug}/tools
```

## 🔍 搜索 API

### 搜索工具
```http
GET /api/search
```

**查询参数:**
- `q` (string): 搜索关键词
- `category` (string): 分类筛选
- `pricing` (string): 定价筛选
- `page` (int): 页码
- `limit` (int): 每页数量

### 搜索建议
```http
GET /api/search/autocomplete
```

**查询参数:**
- `q` (string): 搜索前缀

**响应示例:**
```json
{
  "success": true,
  "data": {
    "query": "chat",
    "suggestions": {
      "tools": [
        { "id": "1", "name": "ChatGPT", "slug": "chatgpt" }
      ],
      "categories": [
        { "id": "1", "name": "聊天机器人", "slug": "chatbots" }
      ],
      "tags": [
        { "id": "1", "name": "chatbot", "slug": "chatbot" }
      ]
    }
  }
}
```

## 👤 用户管理 API

### 用户认证
```http
POST /api/auth/login
```

**请求体:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-1",
      "email": "user@example.com",
      "name": "用户名"
    },
    "token": "jwt-token"
  }
}
```

### 用户注册
```http
POST /api/auth/register
```

### 获取当前用户信息
```http
GET /api/auth/user
```
*需要认证*

### 用户登出
```http
POST /api/auth/logout
```
*需要认证*

## ⭐ 用户收藏 API

### 获取用户收藏
```http
GET /api/user/favorites
```
*需要认证*

### 添加收藏
```http
POST /api/user/favorites
```
*需要认证*

**请求体:**
```json
{
  "tool_id": "tool-1"
}
```

### 取消收藏
```http
DELETE /api/user/favorites/{tool_id}
```
*需要认证*

## 📊 用户评分 API

### 获取用户评分
```http
GET /api/user/ratings
```
*需要认证*

### 添加/更新评分
```http
POST /api/user/ratings
```
*需要认证*

**请求体:**
```json
{
  "tool_id": "tool-1",
  "rating": 5,
  "comment": "很棒的工具！"
}
```

## 🎯 用户设置 API

### 获取用户设置
```http
GET /api/user/settings
```
*需要认证*

### 更新用户设置
```http
PUT /api/user/settings
```
*需要认证*

**请求体:**
```json
{
  "language": "zh",
  "theme": "dark",
  "notifications": {
    "email": true,
    "browser": false
  },
  "privacy": {
    "profile_public": true,
    "usage_analytics": true
  }
}
```

## 👥 社区 API

### 获取帖子列表
```http
GET /api/community/posts
```

**查询参数:**
- `type` (string): 帖子类型
- `category` (string): 帖子分类
- `page` (int): 页码
- `limit` (int): 每页数量

### 创建帖子
```http
POST /api/community/posts
```
*需要认证*

**请求体:**
```json
{
  "title": "帖子标题",
  "content": "帖子内容",
  "type": "discussion",
  "category": "general"
}
```

### 获取帖子评论
```http
GET /api/community/posts/{post_id}/comments
```

### 发表评论
```http
POST /api/community/comments
```
*需要认证*

### 投票
```http
POST /api/community/votes
```
*需要认证*

**请求体:**
```json
{
  "target_type": "post",
  "target_id": "post-1",
  "vote_type": "up"
}
```

## 🎓 试用功能 API

### 获取试用状态
```http
GET /api/user/trials
```
*需要认证*

### 启动试用
```http
POST /api/user/trials
```
*需要认证*

**请求体:**
```json
{
  "trial_type": "membership",
  "trial_id": "premium"
}
```

## 💳 会员系统 API

### 获取会员信息
```http
GET /api/user/membership
```
*需要认证*

### 购买/升级会员
```http
POST /api/user/membership
```
*需要认证*

## 📈 分析统计 API

### 记录事件
```http
POST /api/analytics/events
```

**请求体:**
```json
{
  "event_type": "tool_view",
  "event_data": {
    "tool_id": "tool-1",
    "source": "search"
  }
}
```

### 获取性能指标
```http
GET /api/analytics/performance
```

## 🎨 Prompt市场 API

### 获取Prompt列表
```http
GET /api/prompts
```

### 生成Prompt
```http
POST /api/prompts/generate
```
*需要认证*

**请求体:**
```json
{
  "topic": "营销文案",
  "style": "专业",
  "length": "中等"
}
```

## 🤖 自动化 API

### 内容生成
```http
POST /api/automation/content-generation
```
*需要管理员权限*

### SEO优化
```http
POST /api/automation/seo-sync
```
*需要管理员权限*

## 📊 监控 API

### 系统健康检查
```http
GET /api/monitoring/health
```

**查询参数:**
- `metrics` (boolean): 是否包含详细指标
- `window` (int): 时间窗口(毫秒)

**响应示例:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 86400,
  "system": {
    "memory": {
      "used": 134217728,
      "total": 268435456,
      "percentage": 50
    }
  },
  "services": {
    "database": {
      "connected": true,
      "responseTime": 50
    },
    "api": {
      "totalRequests": 1000,
      "errorRate": 2.5,
      "avgResponseTime": 150
    }
  }
}
```

## 📋 错误代码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## 🚀 使用示例

### JavaScript/TypeScript
```typescript
// 获取工具列表
const response = await fetch('/api/tools?page=1&limit=20');
const { data } = await response.json();

// 带认证的请求
const response = await fetch('/api/user/favorites', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Python
```python
import requests

# 获取工具列表
response = requests.get('https://api.example.com/api/tools')
data = response.json()

# 带认证的请求
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}
response = requests.get('https://api.example.com/api/user/favorites', headers=headers)
```

### cURL
```bash
# 获取工具列表
curl -X GET "https://api.example.com/api/tools?page=1&limit=20"

# 带认证的请求
curl -X GET "https://api.example.com/api/user/favorites" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

## 📝 更新日志

### v1.0.0 (2024-01-01)
- 初始API发布
- 支持工具管理、用户系统、搜索等核心功能

### v1.1.0 (2024-01-15)
- 添加社区功能API
- 增强搜索和筛选功能

### v1.2.0 (2024-02-01)
- 添加Prompt市场API
- 增加自动化和监控功能

---

如有疑问或需要支持，请联系开发团队或查看我们的[开发者文档](https://docs.example.com)。