-- AI工具试用和分销系统数据库表结构

-- 用户试用记录表
CREATE TABLE IF NOT EXISTS user_trials (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  tool_id VARCHAR(50) NOT NULL,
  offer_id VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('free_trial', 'discount', 'extended_trial')),
  duration INTEGER NOT NULL,
  original_price DECIMAL(10, 2) NOT NULL,
  discounted_price DECIMAL(10, 2),
  promo_code VARCHAR(50),
  affiliate_id VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'converted', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  converted_at TIMESTAMP WITH TIME ZONE,
  conversion_value DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 推广点击记录表
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id VARCHAR(50) PRIMARY KEY,
  affiliate_id VARCHAR(50) NOT NULL,
  tool_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50),
  trial_id VARCHAR(50),
  user_ip VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  converted BOOLEAN DEFAULT FALSE,
  conversion_value DECIMAL(10, 2),
  commission_earned DECIMAL(10, 2),
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 推广收益记录表
CREATE TABLE IF NOT EXISTS affiliate_earnings (
  id VARCHAR(50) PRIMARY KEY,
  affiliate_id VARCHAR(50) NOT NULL,
  tool_id VARCHAR(50) NOT NULL,
  click_id VARCHAR(50) NOT NULL,
  trial_id VARCHAR(50),
  amount DECIMAL(10, 2) NOT NULL,
  commission_rate DECIMAL(5, 4) NOT NULL,
  currency VARCHAR(3) DEFAULT 'CNY',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 推广伙伴信息表
CREATE TABLE IF NOT EXISTS affiliate_partners (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'terminated')),
  tier VARCHAR(20) NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  monthly_earnings DECIMAL(10, 2) DEFAULT 0,
  clicks_generated INTEGER DEFAULT 0,
  conversions_generated INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 4) DEFAULT 0,
  payout_method VARCHAR(20) CHECK (payout_method IN ('bank', 'alipay', 'wechat')),
  payout_details JSONB,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_user_trials_user_id ON user_trials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trials_tool_id ON user_trials(tool_id);
CREATE INDEX IF NOT EXISTS idx_user_trials_affiliate_id ON user_trials(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_user_trials_status ON user_trials(status);
CREATE INDEX IF NOT EXISTS idx_user_trials_expires_at ON user_trials(expires_at);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_tool_id ON affiliate_clicks(tool_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user_id ON affiliate_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_trial_id ON affiliate_clicks(trial_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_converted ON affiliate_clicks(converted);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_clicked_at ON affiliate_clicks(clicked_at);

CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_affiliate_id ON affiliate_earnings(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_click_id ON affiliate_earnings(click_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_status ON affiliate_earnings(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_earned_at ON affiliate_earnings(earned_at);

CREATE INDEX IF NOT EXISTS idx_affiliate_partners_user_id ON affiliate_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_status ON affiliate_partners(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_partners_tier ON affiliate_partners(tier);

-- 自动更新 updated_at 字段的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表创建自动更新触发器
CREATE TRIGGER update_user_trials_updated_at BEFORE UPDATE ON user_trials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliate_clicks_updated_at BEFORE UPDATE ON affiliate_clicks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliate_earnings_updated_at BEFORE UPDATE ON affiliate_earnings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliate_partners_updated_at BEFORE UPDATE ON affiliate_partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入一些示例推广伙伴数据
INSERT INTO affiliate_partners (
  id, user_id, status, tier, total_earnings, monthly_earnings, 
  clicks_generated, conversions_generated, conversion_rate, joined_at
) VALUES 
  ('partner-1', 'user-123', 'approved', 'silver', 2560.00, 850.00, 2100, 263, 0.1252, NOW()),
  ('partner-2', 'user-456', 'approved', 'gold', 6800.00, 1200.00, 4500, 675, 0.1500, NOW()),
  ('partner-3', 'user-789', 'approved', 'bronze', 450.00, 150.00, 800, 72, 0.0900, NOW())
ON CONFLICT (user_id) DO NOTHING;

-- 插入一些示例试用记录
INSERT INTO user_trials (
  id, user_id, tool_id, offer_id, type, duration, original_price, 
  discounted_price, promo_code, affiliate_id, status, started_at, expires_at
) VALUES 
  ('trial-1', 'user-001', 'chatgpt', 'chatgpt-trial', 'free_trial', 7, 160.00, NULL, 'AI_NAVIGATOR_7D', 'partner-1', 'active', NOW(), NOW() + INTERVAL '7 days'),
  ('trial-2', 'user-002', 'claude', 'claude-trial', 'discount', 30, 150.00, 75.00, 'CLAUDE_50OFF', 'partner-1', 'converted', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days'),
  ('trial-3', 'user-003', 'midjourney', 'midjourney-trial', 'extended_trial', 14, 80.00, NULL, 'MJ_EXTENDED_14', 'partner-2', 'active', NOW(), NOW() + INTERVAL '14 days')
ON CONFLICT (id) DO NOTHING;

-- 插入一些示例点击记录
INSERT INTO affiliate_clicks (
  id, affiliate_id, tool_id, user_id, trial_id, user_ip, user_agent, 
  converted, conversion_value, commission_earned, clicked_at, converted_at
) VALUES 
  ('click-1', 'partner-1', 'chatgpt', 'user-001', 'trial-1', '192.168.1.1', 'Mozilla/5.0 Chrome/91.0', FALSE, NULL, NULL, NOW(), NULL),
  ('click-2', 'partner-1', 'claude', 'user-002', 'trial-2', '192.168.1.2', 'Mozilla/5.0 Chrome/91.0', TRUE, 150.00, 30.00, NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days'),
  ('click-3', 'partner-2', 'midjourney', 'user-003', 'trial-3', '192.168.1.3', 'Mozilla/5.0 Chrome/91.0', FALSE, NULL, NULL, NOW(), NULL)
ON CONFLICT (id) DO NOTHING;

-- 插入一些示例收益记录
INSERT INTO affiliate_earnings (
  id, affiliate_id, tool_id, click_id, trial_id, amount, commission_rate, 
  status, earned_at, confirmed_at, description
) VALUES 
  ('earning-1', 'partner-1', 'claude', 'click-2', 'trial-2', 30.00, 0.2000, 'confirmed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', 'Claude Pro订阅推广佣金'),
  ('earning-2', 'partner-2', 'chatgpt', 'click-4', 'trial-4', 24.00, 0.1500, 'pending', NOW() - INTERVAL '1 day', NULL, 'ChatGPT Plus订阅推广佣金')
ON CONFLICT (id) DO NOTHING;

-- 添加一些约束检查
ALTER TABLE user_trials ADD CONSTRAINT chk_user_trials_dates CHECK (expires_at > started_at);
ALTER TABLE affiliate_clicks ADD CONSTRAINT chk_affiliate_clicks_conversion CHECK (
  (converted = FALSE AND conversion_value IS NULL AND commission_earned IS NULL AND converted_at IS NULL) OR
  (converted = TRUE AND conversion_value IS NOT NULL AND commission_earned IS NOT NULL AND converted_at IS NOT NULL)
);
ALTER TABLE affiliate_earnings ADD CONSTRAINT chk_affiliate_earnings_amount CHECK (amount > 0);
ALTER TABLE affiliate_partners ADD CONSTRAINT chk_affiliate_partners_earnings CHECK (total_earnings >= 0 AND monthly_earnings >= 0);

-- 创建视图以便于查询统计数据
CREATE OR REPLACE VIEW affiliate_stats AS
SELECT 
  ap.id as affiliate_id,
  ap.user_id,
  ap.status,
  ap.tier,
  ap.total_earnings,
  ap.monthly_earnings,
  ap.clicks_generated,
  ap.conversions_generated,
  ap.conversion_rate,
  COUNT(DISTINCT ac.id) as total_clicks,
  COUNT(DISTINCT CASE WHEN ac.converted = TRUE THEN ac.id END) as total_conversions,
  COALESCE(SUM(ae.amount), 0) as pending_earnings,
  COALESCE(SUM(CASE WHEN ae.status = 'paid' THEN ae.amount ELSE 0 END), 0) as paid_earnings
FROM affiliate_partners ap
LEFT JOIN affiliate_clicks ac ON ap.id = ac.affiliate_id
LEFT JOIN affiliate_earnings ae ON ap.id = ae.affiliate_id AND ae.status = 'pending'
GROUP BY ap.id, ap.user_id, ap.status, ap.tier, ap.total_earnings, ap.monthly_earnings, ap.clicks_generated, ap.conversions_generated, ap.conversion_rate;

-- 创建试用统计视图
CREATE OR REPLACE VIEW trial_stats AS
SELECT 
  tool_id,
  COUNT(*) as total_trials,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_trials,
  COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_trials,
  COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_trials,
  AVG(CASE WHEN conversion_value IS NOT NULL THEN conversion_value END) as avg_conversion_value,
  ROUND(COUNT(CASE WHEN status = 'converted' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as conversion_rate
FROM user_trials
GROUP BY tool_id;

-- 创建月度收益统计视图
CREATE OR REPLACE VIEW monthly_earnings AS
SELECT 
  affiliate_id,
  DATE_TRUNC('month', earned_at) as month,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount,
  SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
  SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount
FROM affiliate_earnings
GROUP BY affiliate_id, DATE_TRUNC('month', earned_at)
ORDER BY affiliate_id, month DESC;

COMMENT ON TABLE user_trials IS '用户试用记录表';
COMMENT ON TABLE affiliate_clicks IS '推广点击记录表';
COMMENT ON TABLE affiliate_earnings IS '推广收益记录表';
COMMENT ON TABLE affiliate_partners IS '推广伙伴信息表';
COMMENT ON VIEW affiliate_stats IS '推广伙伴统计视图';
COMMENT ON VIEW trial_stats IS '试用统计视图';
COMMENT ON VIEW monthly_earnings IS '月度收益统计视图';

# NaviGuard-AI Security Audited - 2026-06-01
