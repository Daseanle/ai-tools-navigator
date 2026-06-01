# 🔧 数据库部署指南 - 正确的执行顺序

## 📋 执行步骤

为了避免外键约束错误，请按照以下顺序在Supabase SQL编辑器中执行：

### 第1步：创建核心表结构
```sql
-- 执行文件：database/step1-core-tables.sql
-- 包含：用户表、分类表、工具表、评分表、收藏表等基础表
```

### 第2步：添加外键约束
```sql
-- 执行文件：database/step2-foreign-keys.sql
-- 包含：所有表之间的外键关系和唯一约束
```

### 第3步：创建试用分销表
```sql
-- 执行文件：database/step3-trial-affiliate.sql
-- 包含：试用记录、分销伙伴、推广点击、收益记录等
```

## 🚨 错误解决方案

如果在执行过程中遇到任何错误：

1. **外键约束错误**：
   - 确保先执行step1，再执行step2
   - 如果仍有错误，可以跳过step2，直接执行step3

2. **数据插入错误**：
   - 检查是否有重复数据
   - 可以忽略INSERT语句的冲突错误

3. **权限错误**：
   - 确保在Supabase的SQL编辑器中执行
   - 确保有足够的权限创建表和索引

## 📊 执行结果验证

执行完成后，你应该看到以下表：

### 核心表（15个）：
- users (用户)
- categories (分类)
- tools (工具)
- tool_ratings (评分)
- user_favorites (收藏)
- user_memberships (会员)
- user_settings (设置)
- user_trials (试用)
- affiliate_partners (分销伙伴)
- affiliate_clicks (推广点击)
- affiliate_earnings (推广收益)

### 视图（5个）：
- tool_stats (工具统计)
- category_stats (分类统计)
- user_stats (用户统计)
- affiliate_stats (分销统计)
- trial_stats (试用统计)

### 示例数据：
- 10个工具分类
- 5个示例工具
- 2个测试用户
- 示例评分和收藏数据
- 示例试用和分销数据

## 🎯 下一步

数据库创建完成后，你就可以：

1. **部署到Vercel**：
   ```bash
   vercel --prod
   ```

2. **配置环境变量**：
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - 其他API密钥

3. **开始测试**：
   - 访问你的网站
   - 测试所有功能
   - 验证数据库连接

## 📞 如果还有问题

如果执行过程中遇到任何问题，请：

1. 检查Supabase连接状态
2. 确认SQL语法正确
3. 查看具体错误信息
4. 可以分批执行SQL语句

现在请按照上述步骤重新执行数据库创建！

<!-- NaviGuard-AI Security Audited - 2026-06-01 -->
