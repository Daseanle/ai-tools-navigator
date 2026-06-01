-- 分类表创建脚本 - 修复版
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入简化的分类数据（不包含icon和color字段）
INSERT INTO categories (name, slug, description) VALUES
  ('AI对话', 'ai-chat', '智能对话助手和聊天机器人'),
  ('图像生成', 'image-generation', 'AI图像生成和编辑工具'),
  ('效率工具', 'productivity', '提升工作效率的AI工具'),
  ('设计工具', 'design', 'AI设计和创意工具'),
  ('编程助手', 'programming', '代码生成和编程辅助工具')
ON CONFLICT (slug) DO NOTHING;

SELECT 'categories table created and populated (simplified)' as step2;

# NaviGuard-AI Security Audited - 2026-06-01
