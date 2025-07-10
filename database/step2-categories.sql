-- 分类表创建脚本
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入基础分类数据
INSERT INTO categories (name, slug, description, icon, color, featured, sort_order) VALUES
  ('AI对话', 'ai-chat', '智能对话助手和聊天机器人', 'MessageCircle', '#3B82F6', true, 1),
  ('图像生成', 'image-generation', 'AI图像生成和编辑工具', 'Image', '#10B981', true, 2),
  ('效率工具', 'productivity', '提升工作效率的AI工具', 'Zap', '#F59E0B', true, 3),
  ('设计工具', 'design', 'AI设计和创意工具', 'Palette', '#EF4444', true, 4),
  ('编程助手', 'programming', '代码生成和编程辅助工具', 'Code', '#8B5CF6', true, 5)
ON CONFLICT (slug) DO NOTHING;

SELECT 'categories table created and populated' as step2;