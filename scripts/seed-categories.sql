-- 插入基础分类数据
INSERT INTO categories (name, slug, description, icon, color, sort_order) VALUES
('对话AI', 'chat-ai', '智能对话和聊天机器人工具', '💬', 'blue', 1),
('图像生成', 'image-generation', 'AI图像创作和编辑工具', '🎨', 'purple', 2),
('文本处理', 'text-processing', '文本生成、编辑和优化工具', '📝', 'green', 3),
('代码助手', 'code-assistant', '编程和开发辅助工具', '💻', 'orange', 4),
('音频处理', 'audio-processing', '语音合成、识别和音频编辑', '🎵', 'pink', 5),
('视频生成', 'video-generation', 'AI视频创作和编辑工具', '🎬', 'red', 6),
('数据分析', 'data-analysis', '数据处理和分析工具', '📊', 'cyan', 7),
('设计工具', 'design-tools', 'UI/UX设计和创意工具', '🎯', 'indigo', 8),
('营销工具', 'marketing-tools', '营销自动化和推广工具', '📈', 'yellow', 9),
('办公效率', 'productivity', '提升工作效率的AI工具', '⚡', 'teal', 10)
ON CONFLICT (slug) DO NOTHING;
