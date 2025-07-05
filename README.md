# AI Navigator Pro

一个现代化的AI工具发现和评测平台，帮助用户找到最适合的AI工具。

## 功能特性

- 🔍 **智能搜索** - 快速找到你需要的AI工具
- 📊 **分类浏览** - 按类别探索不同领域的工具
- ⭐ **评分系统** - 基于用户评价的工具评分
- 💾 **收藏功能** - 保存你喜欢的工具
- 📱 **响应式设计** - 完美适配各种设备
- 🌙 **深色主题** - 优雅的深色界面
- 🌐 **多语言支持** - 支持中英文切换
- ⚡ **性能优化** - 快速加载和流畅体验

## 技术栈

- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **数据库**: Supabase
- **图标**: Lucide React
- **部署**: Vercel

## 快速开始

### 1. 克隆项目

\`\`\`bash
git clone https://github.com/your-username/ai-tools-navigator.git
cd ai-tools-navigator
\`\`\`

### 2. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 3. 环境配置

复制 `.env.example` 到 `.env.local` 并填入你的配置：

\`\`\`bash
cp .env.example .env.local
\`\`\`

### 4. 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署到 Vercel

### 1. 推送到 GitHub

\`\`\`bash
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

### 2. 连接 Vercel

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 配置环境变量

### 3. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

### 4. 部署

Vercel 会自动构建和部署你的应用。

## Supabase 设置

### 1. 创建项目

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 获取项目 URL 和 API 密钥

### 2. 创建数据库表

在 Supabase SQL Editor 中运行 `scripts/` 目录下的 SQL 文件：

1. `create-tables.sql` - 创建数据库表
2. `seed-categories.sql` - 插入分类数据
3. `seed-tags.sql` - 插入标签数据

### 3. 配置 RLS

\`\`\`sql
-- 启用行级安全
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Tools are viewable by everyone" ON tools
  FOR SELECT USING (is_active = true);

CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (is_active = true);
\`\`\`

## 项目结构

\`\`\`
├── app/                    # Next.js App Router
│   ├── [lang]/            # 多语言路由
│   │   ├── page.tsx       # 首页
│   │   ├── tools/         # 工具相关页面
│   │   ├── categories/    # 分类页面
│   │   └── search/        # 搜索页面
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── ui/               # UI 组件
│   ├── sections/         # 页面区块
│   └── providers/        # Context 提供者
├── lib/                  # 工具函数
│   ├── api.ts           # API 函数
│   ├── supabase.ts      # Supabase 客户端
│   └── utils.ts         # 工具函数
├── scripts/             # 数据库脚本
├── public/              # 静态资源
└── types/               # TypeScript 类型定义
\`\`\`

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
\`\`\`

现在你有了一个完整的AI工具导航网站！包含：

✅ **完整的页面结构**：首页、工具列表、分类、搜索、工具详情、关于页面  
✅ **响应式设计**：完美适配桌面和移动端  
✅ **Supabase 集成**：数据库连接和 API  
✅ **SEO 优化**：元数据和结构化数据  
✅ **PWA 支持**：可安装到桌面  
✅ **性能优化**：代码分割和懒加载  
✅ **部署就绪**：可直接部署到 Vercel  

**部署步骤**：
1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置 Supabase 环境变量
4. 运行数据库脚本创建表结构
5. 导入你的 2000 个工具数据

需要我帮你创建数据导入脚本吗？
