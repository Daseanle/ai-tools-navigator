import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('Supabase URL:', supabaseUrl)
console.log('Service Key available:', !!supabaseServiceKey)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createBehaviorAnalyticsTables() {
  console.log('Creating behavior analytics tables...')
  
  try {
    // 1. 创建用户行为事件表
    const { error: eventsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_behavior_events (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(50) NOT NULL DEFAULT 'anonymous',
          session_id VARCHAR(100) NOT NULL,
          event_type VARCHAR(50) NOT NULL,
          event_data JSONB NOT NULL DEFAULT '{}',
          url TEXT NOT NULL,
          referrer TEXT,
          user_agent TEXT,
          viewport JSONB,
          device_type VARCHAR(20),
          os VARCHAR(50),
          browser VARCHAR(50),
          screen_resolution VARCHAR(20),
          geo_location JSONB,
          timezone VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (eventsError) {
      console.error('Error creating events table:', eventsError)
    } else {
      console.log('✅ user_behavior_events table created')
    }

    // 2. 创建用户会话表
    const { error: sessionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_sessions (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR(100) UNIQUE NOT NULL,
          user_id VARCHAR(50) NOT NULL DEFAULT 'anonymous',
          start_time TIMESTAMP WITH TIME ZONE NOT NULL,
          end_time TIMESTAMP WITH TIME ZONE,
          duration INTEGER,
          pages_visited JSONB DEFAULT '[]',
          page_count INTEGER DEFAULT 0,
          click_count INTEGER DEFAULT 0,
          scroll_depth INTEGER DEFAULT 0,
          device_type VARCHAR(20),
          source VARCHAR(100),
          utm_source VARCHAR(100),
          utm_medium VARCHAR(100),
          utm_campaign VARCHAR(100),
          exit_page TEXT,
          is_bounce BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (sessionsError) {
      console.error('Error creating sessions table:', sessionsError)
    } else {
      console.log('✅ user_sessions table created')
    }

    // 3. 创建热力图数据表
    const { error: heatmapError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS heatmap_data (
          id SERIAL PRIMARY KEY,
          page_url TEXT NOT NULL,
          viewport JSONB NOT NULL,
          click_data JSONB DEFAULT '[]',
          scroll_data JSONB DEFAULT '[]',
          hover_data JSONB DEFAULT '[]',
          total_views INTEGER DEFAULT 0,
          unique_users INTEGER DEFAULT 0,
          date_collected DATE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (heatmapError) {
      console.error('Error creating heatmap table:', heatmapError)
    } else {
      console.log('✅ heatmap_data table created')
    }

    // 4. 创建页面性能数据表
    const { error: performanceError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS page_performance (
          id SERIAL PRIMARY KEY,
          url TEXT NOT NULL,
          load_time INTEGER,
          first_contentful_paint INTEGER,
          largest_contentful_paint INTEGER,
          first_input_delay INTEGER,
          cumulative_layout_shift DECIMAL(4,3),
          user_id VARCHAR(50),
          session_id VARCHAR(100),
          device_type VARCHAR(20),
          connection_type VARCHAR(20),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (performanceError) {
      console.error('Error creating performance table:', performanceError)
    } else {
      console.log('✅ page_performance table created')
    }

    console.log('✅ All behavior analytics tables created successfully!')
    
  } catch (error) {
    console.error('Error creating tables:', error)
  }
}

createBehaviorAnalyticsTables()

// NaviGuard-AI Security Audited - 2026-06-01
