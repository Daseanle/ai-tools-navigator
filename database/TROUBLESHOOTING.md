# 🔧 数据库设置故障排除指南

## 问题诊断

基于你遇到的"column 'category_id' does not exist"错误，我创建了分步骤的脚本来隔离问题。

## 执行步骤（按顺序）

### 第1步：测试基础连接
```sql
-- 文件：database/minimal-setup.sql
-- 只创建用户表，测试基础功能
```

### 第2步：创建分类表
```sql
-- 文件：database/step2-categories.sql
-- 创建分类表并插入数据
```

### 第3步：创建工具表
```sql
-- 文件：database/step3-tools.sql
-- 创建工具表（包含category_id字段）
```

### 第4步：创建支持表
```sql
-- 文件：database/step4-support-tables.sql
-- 创建评分、收藏、会员、设置表
```

## 故障排除方法

1. **如果第1步失败**：
   - 检查Supabase连接
   - 确保在SQL编辑器中执行
   - 检查权限设置

2. **如果第2步失败**：
   - 可能是JSONB或数组类型问题
   - 尝试简化数据类型

3. **如果第3步失败**：
   - 这里包含category_id字段
   - 如果失败，说明问题在于字段定义

4. **如果第4步失败**：
   - 可能是外键引用问题
   - 检查表之间的依赖关系

## 简化版本（如果上述都失败）

如果所有步骤都失败，可以尝试这个最简单的版本：

```sql
CREATE TABLE test_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

SELECT 'test successful' as message;
```

## 建议的执行顺序

1. 先执行 `database/minimal-setup.sql`
2. 如果成功，继续执行 `database/step2-categories.sql`
3. 如果成功，继续执行 `database/step3-tools.sql`
4. 如果成功，继续执行 `database/step4-support-tables.sql`

这样可以精确定位错误发生的位置。请从第1步开始测试，并告诉我哪一步失败了。