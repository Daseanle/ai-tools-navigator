-- 用户行为分析数据表结构
-- 在现有数据库基础上添加用户行为分析功能

-- 1. 用户行为事件表
CREATE TABLE IF NOT EXISTS user_behavior_events (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL DEFAULT 'anonymous', -- 支持匿名用户
  session_id VARCHAR(100) NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- page_view, click, scroll, hover, form_submit, etc.
  
  -- 事件数据
  event_data JSONB NOT NULL DEFAULT '{}', -- 包含页面、元素、坐标等信息
  
  -- 上下文信息
  url TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  viewport JSONB, -- {width: number, height: number}
  
  -- 设备信息
  device_type VARCHAR(20), -- desktop, mobile, tablet
  os VARCHAR(50),
  browser VARCHAR(50),
  screen_resolution VARCHAR(20),
  
  -- 地理位置（可选）
  geo_location JSONB, -- {country: string, city: string, region: string}
  
  -- 时间信息
  timezone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 用户会话表
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  user_id VARCHAR(50) NOT NULL DEFAULT 'anonymous',
  
  -- 会话信息
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- 会话时长（秒）
  
  -- 页面访问信息
  pages_visited JSONB DEFAULT '[]', -- 访问的页面列表
  page_count INTEGER DEFAULT 0,
  
  -- 行为统计
  click_count INTEGER DEFAULT 0,
  scroll_depth INTEGER DEFAULT 0, -- 最大滚动深度百分比
  
  -- 设备和来源
  device_type VARCHAR(20),
  source VARCHAR(100), -- direct, search, social, referral
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  
  -- 退出信息
  exit_page TEXT,
  is_bounce BOOLEAN DEFAULT false, -- 是否为跳出会话
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 转化漏斗配置表
CREATE TABLE IF NOT EXISTS conversion_funnels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- 漏斗步骤配置
  steps JSONB NOT NULL, -- 漏斗步骤定义
  goals JSONB NOT NULL, -- 转化目标
  
  -- 状态
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 转化漏斗分析结果表
CREATE TABLE IF NOT EXISTS funnel_analysis (
  id SERIAL PRIMARY KEY,
  funnel_id INTEGER REFERENCES conversion_funnels(id),
  
  -- 分析时间范围
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- 分析结果
  total_users INTEGER NOT NULL,
  step_metrics JSONB NOT NULL, -- 每个步骤的详细指标
  overall_conversion_rate DECIMAL(5,2),
  
  -- 细分分析
  segment_analysis JSONB, -- 不同用户群体的转化率
  insights JSONB, -- 生成的洞察和建议
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 用户画像表
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  
  -- 偏好设置
  preferences JSONB DEFAULT '{}', -- 分类偏好、定价偏好等
  
  -- 行为特征
  behavior_metrics JSONB DEFAULT '{}', -- 访问频率、停留时间等
  
  -- 人口统计信息
  demographics JSONB DEFAULT '{}', -- 地理位置、角色等
  
  -- 分群标签
  segment_tags TEXT[] DEFAULT '{}',
  
  -- 个性化数据
  recommendation_context JSONB DEFAULT '{}', -- 推荐上下文
  
  -- 统计数据
  total_sessions INTEGER DEFAULT 0,
  total_pageviews INTEGER DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 热力图数据表
CREATE TABLE IF NOT EXISTS heatmap_data (
  id SERIAL PRIMARY KEY,
  page_url TEXT NOT NULL,
  viewport JSONB NOT NULL, -- {width: number, height: number}
  
  -- 点击数据
  click_data JSONB DEFAULT '[]', -- 点击热点数据
  
  -- 滚动数据
  scroll_data JSONB DEFAULT '[]', -- 滚动深度数据
  
  -- 悬停数据
  hover_data JSONB DEFAULT '[]', -- 鼠标悬停数据
  
  -- 统计信息
  total_views INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  
  -- 时间范围
  date_collected DATE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. A/B测试配置表
CREATE TABLE IF NOT EXISTS ab_tests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- 测试配置
  test_config JSONB NOT NULL, -- 测试变体配置
  
  -- 目标指标
  success_metrics JSONB NOT NULL, -- 成功指标定义
  
  -- 状态和时间
  status VARCHAR(20) DEFAULT 'draft', -- draft, running, completed, paused
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- 流量分配
  traffic_allocation JSONB NOT NULL, -- 流量分配比例
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. A/B测试结果表
CREATE TABLE IF NOT EXISTS ab_test_results (
  id SERIAL PRIMARY KEY,
  test_id INTEGER REFERENCES ab_tests(id),
  user_id VARCHAR(50) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  
  -- 实验信息
  variant VARCHAR(100) NOT NULL, -- 用户看到的变体
  
  -- 转化信息
  converted BOOLEAN DEFAULT false,
  conversion_value DECIMAL(10,2), -- 转化价值
  
  -- 时间信息
  exposure_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversion_time TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 页面性能数据表
CREATE TABLE IF NOT EXISTS page_performance (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  
  -- 性能指标
  load_time INTEGER, -- 页面加载时间（毫秒）
  first_contentful_paint INTEGER, -- FCP
  largest_contentful_paint INTEGER, -- LCP
  first_input_delay INTEGER, -- FID
  cumulative_layout_shift DECIMAL(4,3), -- CLS
  
  -- 用户信息
  user_id VARCHAR(50),
  session_id VARCHAR(100),
  device_type VARCHAR(20),
  connection_type VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 推荐点击追踪表
CREATE TABLE IF NOT EXISTS recommendation_clicks (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  
  -- 推荐信息
  recommendation_id VARCHAR(100) NOT NULL, -- 推荐算法生成的ID
  algorithm_type VARCHAR(50) NOT NULL, -- collaborative, content-based, hybrid
  tool_id INTEGER REFERENCES tools(id),
  
  -- 位置信息
  position INTEGER NOT NULL, -- 推荐位置
  section VARCHAR(100), -- 推荐区域
  
  -- 点击信息
  clicked BOOLEAN DEFAULT false,
  click_time TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_user_id ON user_behavior_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_session_id ON user_behavior_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_event_type ON user_behavior_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_created_at ON user_behavior_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_url ON user_behavior_events(url);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start_time ON user_sessions(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_device_type ON user_sessions(device_type);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_segment_tags ON user_profiles USING gin(segment_tags);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_active ON user_profiles(last_active_at DESC);

CREATE INDEX IF NOT EXISTS idx_heatmap_data_page_url ON heatmap_data(page_url);
CREATE INDEX IF NOT EXISTS idx_heatmap_data_date_collected ON heatmap_data(date_collected DESC);

CREATE INDEX IF NOT EXISTS idx_ab_test_results_test_id ON ab_test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_user_id ON ab_test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_variant ON ab_test_results(variant);

CREATE INDEX IF NOT EXISTS idx_page_performance_url ON page_performance(url);
CREATE INDEX IF NOT EXISTS idx_page_performance_created_at ON page_performance(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recommendation_clicks_user_id ON recommendation_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_clicks_algorithm_type ON recommendation_clicks(algorithm_type);
CREATE INDEX IF NOT EXISTS idx_recommendation_clicks_tool_id ON recommendation_clicks(tool_id);

-- 创建更新时间触发器
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversion_funnels_updated_at BEFORE UPDATE ON conversion_funnels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ab_tests_updated_at BEFORE UPDATE ON ab_tests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建数据清理功能（定期清理旧数据）
CREATE OR REPLACE FUNCTION cleanup_old_behavior_data()
RETURNS void AS $$
BEGIN
    -- 删除90天前的用户行为事件数据
    DELETE FROM user_behavior_events 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- 删除90天前的会话数据
    DELETE FROM user_sessions 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- 删除180天前的热力图数据
    DELETE FROM heatmap_data 
    WHERE date_collected < CURRENT_DATE - INTERVAL '180 days';
    
    -- 删除30天前的页面性能数据
    DELETE FROM page_performance 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    RAISE NOTICE '用户行为数据清理完成';
END;
$$ LANGUAGE plpgsql;

-- 创建用户行为统计视图
CREATE OR REPLACE VIEW user_behavior_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_events,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
    COUNT(*) FILTER (WHERE event_type = 'click') as clicks,
    COUNT(*) FILTER (WHERE event_type = 'scroll') as scrolls
FROM user_behavior_events
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 创建漏斗转化统计视图
CREATE OR REPLACE VIEW funnel_conversion_stats AS
SELECT 
    f.name as funnel_name,
    fa.start_date,
    fa.end_date,
    fa.total_users,
    fa.overall_conversion_rate,
    fa.created_at as analysis_date
FROM funnel_analysis fa
JOIN conversion_funnels f ON fa.funnel_id = f.id
WHERE f.is_active = true
ORDER BY fa.created_at DESC;

COMMENT ON TABLE user_behavior_events IS '用户行为事件数据表';
COMMENT ON TABLE user_sessions IS '用户会话数据表';
COMMENT ON TABLE conversion_funnels IS '转化漏斗配置表';
COMMENT ON TABLE funnel_analysis IS '转化漏斗分析结果表';
COMMENT ON TABLE user_profiles IS '用户画像数据表';
COMMENT ON TABLE heatmap_data IS '页面热力图数据表';
COMMENT ON TABLE ab_tests IS 'A/B测试配置表';
COMMENT ON TABLE ab_test_results IS 'A/B测试结果表';
COMMENT ON TABLE page_performance IS '页面性能数据表';
COMMENT ON TABLE recommendation_clicks IS '推荐点击追踪表';

# NaviGuard-AI Security Audited - 2026-06-01
