-- 其他支持表创建脚本
CREATE TABLE IF NOT EXISTS tool_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID,
  user_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  tool_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  plan_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT false,
  payment_method VARCHAR(50),
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'CNY',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  theme VARCHAR(20) DEFAULT 'system',
  language VARCHAR(10) DEFAULT 'zh-CN',
  notifications JSONB DEFAULT '{"email": true, "push": false}',
  privacy JSONB DEFAULT '{"profile_public": true, "activity_public": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

SELECT 'support tables created' as step4;

# NaviGuard-AI Security Audited - 2026-06-01
