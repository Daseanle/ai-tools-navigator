# Supabase集成完整设置指南

## 1. 创建Supabase项目

1. 访问 [Supabase官网](https://supabase.com) 并登录
2. 点击 "New Project" 创建新项目
3. 选择组织，输入项目名称（如：ai-tools-navigator）
4. 选择数据库密码（请保存好）
5. 选择地区（推荐选择亚洲地区，如Singapore）
6. 点击 "Create new project" 等待项目创建完成

## 2. 获取项目配置信息

项目创建完成后：

1. 进入项目仪表板
2. 点击左侧菜单 "Settings" → "API"
3. 复制以下信息：
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. 配置环境变量

1. 复制 `.env.local.example` 为 `.env.local`:
```bash
cp .env.local.example .env.local
```

2. 编辑 `.env.local` 文件，替换为你的实际信息：
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-service-role-key
```

## 4. 创建数据库表结构

1. 在Supabase仪表板中，点击左侧菜单 "SQL Editor"
2. 点击 "New query"
3. 复制 `scripts/create-tables-updated.sql` 文件内容并粘贴
4. 点击 "Run" 执行SQL脚本
5. 确认所有表创建成功

## 5. 导入CSV数据

### 方法一：使用Supabase仪表板

1. 在Supabase仪表板中，点击 "Table Editor"
2. 对于每个表，点击 "Insert" → "Import from CSV"
3. 按以下顺序导入：
   - `categories` ← `categories_rows.csv`
   - `tags` ← `tags_rows.csv` 
   - `tools` ← `tools_rows.csv`
   - `tool_categories` ← `tool_categories_rows.csv`
   - `admins` ← `admins_rows.csv`
   - `comments` ← `comments_rows.csv`
   - `favorites` ← `favorites_rows.csv`
   - `upvotes` ← `upvotes_rows.csv`
   - `use_cases` ← `use_cases_rows.csv`
   - `workflows` ← `workflows_rows.csv`

### 方法二：使用SQL命令（推荐）

1. 在SQL Editor中执行 `scripts/import-csv-data.sql`
2. 注意：需要先将CSV文件上传到可访问的位置

## 6. 设置RLS（行级安全）

1. 在Supabase仪表板中，点击 "Authentication" → "Policies"
2. 为公开数据表设置政策（categories, tools, tags等）
3. 示例政策：
```sql
-- 允许所有人读取分类
CREATE POLICY "Enable read access for all users" ON "public"."categories"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- 允许所有人读取工具
CREATE POLICY "Enable read access for all users" ON "public"."tools"
AS PERMISSIVE FOR SELECT
TO public
USING (true);
```

## 7. 测试连接

运行测试脚本验证配置：
```bash
npm run test:db
```

## 8. 启动应用

```bash
npm run dev
```

## 常见问题

### Q: 数据导入失败
A: 检查CSV文件路径和格式，确保字段匹配表结构

### Q: 连接超时
A: 检查网络连接和Supabase项目状态

### Q: 权限错误
A: 确认API密钥正确，检查RLS政策设置

### Q: 环境变量不生效
A: 重启开发服务器，确认.env.local文件位置正确

## 下一步

- 配置身份验证
- 设置实时订阅
- 优化查询性能
- 配置CDN和缓存