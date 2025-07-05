-- 插入常用标签
INSERT INTO tags (name, slug, color) VALUES
('免费', 'free', 'green'),
('付费', 'paid', 'red'),
('开源', 'open-source', 'blue'),
('API', 'api', 'purple'),
('Chrome扩展', 'chrome-extension', 'orange'),
('移动应用', 'mobile-app', 'pink'),
('Web应用', 'web-app', 'cyan'),
('桌面应用', 'desktop-app', 'indigo'),
('实时处理', 'real-time', 'yellow'),
('批量处理', 'batch-processing', 'teal'),
('云服务', 'cloud-service', 'gray'),
('本地部署', 'on-premise', 'slate')
ON CONFLICT (slug) DO NOTHING;
