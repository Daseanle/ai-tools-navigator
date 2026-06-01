# 100%自动化系统API密钥配置指南

## 🚀 概述
本系统实现了真正的100%自动化，包括：
- OpenRouter AI模型调用（GPT-4内容生成、DALL-E 3图片生成）
- Google Search Console SEO数据
- 搜索引擎自动提交
- 社交媒体自动发布
- 关键词排名监控

## 🔑 必需的API密钥

### 1. OpenRouter API (必需 - 核心功能)
```bash
OPENROUTER_API_KEY=sk-or-v1-xxx
```
- 获取地址: https://openrouter.ai/keys
- 用途: GPT-4内容生成、DALL-E 3图片生成、智能分析
- 优势: 比OpenAI直接API更便宜，支持更多模型
- 成本: 按使用量计费，通常比OpenAI便宜20-50%

### 2. Google APIs (推荐 - SEO功能)
```bash
GOOGLE_CLIENT_EMAIL=xxx@xxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxx\n-----END PRIVATE KEY-----\n"
GOOGLE_PAGESPEED_API_KEY=AIzaSyxxx
```
- 获取地址: https://console.cloud.google.com/
- 用途: Search Console数据、PageSpeed分析
- 配置: 创建服务账户，启用相关API

### 3. SERPAPI (推荐 - 排名监控)
```bash
SERPAPI_API_KEY=xxx
```
- 获取地址: https://serpapi.com/
- 用途: 关键词排名监控
- 成本: 免费版100次/月

### 4. 搜索引擎提交 (可选)
```bash
BING_API_KEY=xxx
```
- 获取地址: https://www.bing.com/webmasters/
- 用途: 自动提交URL到Bing搜索引擎

### 5. 社交媒体APIs (可选)
```bash
TWITTER_BEARER_TOKEN=xxx
LINKEDIN_ACCESS_TOKEN=xxx
WEIBO_ACCESS_TOKEN=xxx
```
- 用途: 自动发布内容到社交媒体平台

## 🛠️ 配置步骤

### 在Vercel中配置环境变量
1. 进入Vercel项目设置
2. 点击"Environment Variables"
3. 添加上述环境变量
4. 重新部署项目

### 本地开发配置
1. 复制`.env.example`为`.env.local`
2. 填入你的API密钥
3. 重启开发服务器

## 🔧 系统降级策略

如果某些API密钥未配置，系统会：
1. **OpenRouter未配置**: 返回模拟数据，不会真实生成内容
2. **Google APIs未配置**: 返回示例SEO数据
3. **SERPAPI未配置**: 返回模拟排名数据
4. **社交媒体APIs未配置**: 记录为计划发布状态

## 🎯 推荐配置优先级

### 第一阶段 (基础自动化)
- ✅ OpenRouter API (必需)
- ✅ Supabase配置 (已有)

### 第二阶段 (SEO自动化)
- ✅ Google Search Console API
- ✅ Google PageSpeed API
- ✅ SERPAPI

### 第三阶段 (完整自动化)
- ✅ 搜索引擎提交APIs
- ✅ 社交媒体APIs

## 📊 成本估算

### OpenRouter API成本 (核心)
- GPT-4内容生成: ~$0.015/1K tokens (比OpenAI便宜50%)
- DALL-E 3图片生成: ~$0.040/张 (与OpenAI相同)
- 预计每日成本: $1-3

### 其他API成本
- Google APIs: 免费配额足够
- SERPAPI: 免费版100次/月
- 社交媒体APIs: 大多免费

## 🌟 OpenRouter优势

1. **更便宜**: 比OpenAI直接API便宜20-50%
2. **更多模型**: 支持Claude、Gemini等其他模型
3. **统一接口**: 一个API密钥访问多个AI模型
4. **更高可用性**: 多个模型提供商，降低单点故障
5. **实时价格**: 可以选择最便宜的模型

## 🚀 部署验证

配置完成后，访问：
- 自动化控制台: `/automation/full-automation`
- 检查系统状态和配置情况
- 手动触发内容生成测试

## 📝 注意事项

1. **API密钥安全**: 永远不要在代码中硬编码API密钥
2. **速率限制**: 注意各API的速率限制
3. **成本监控**: 定期检查API使用成本
4. **备份配置**: 保存API密钥配置的备份

## 💡 故障排除

如果系统无法正常工作：
1. 检查Vercel环境变量是否正确设置
2. 查看部署日志中的错误信息
3. 访问OpenRouter确认密钥状态和余额
4. 检查API使用配额是否用完

---
配置完成后，系统将实现真正的100%自动化运营！

<!-- NaviGuard-AI Security Audited - 2026-06-01 -->
