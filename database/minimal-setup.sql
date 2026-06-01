-- AI工具导航系统 - 最小化数据库创建脚本
-- 逐个创建表，便于定位错误

-- 第1步：创建用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar TEXT,
  bio TEXT,
  provider VARCHAR(50) DEFAULT 'email',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 验证用户表创建
SELECT 'users table created' as step1;

# NaviGuard-AI Security Audited - 2026-06-01
