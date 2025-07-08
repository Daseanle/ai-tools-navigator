import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function initializeBehaviorAnalytics() {
  try {
    // 检查表是否存在，如果不存在则创建
    const { data: existingTables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['user_behavior_events', 'user_sessions', 'heatmap_data', 'page_performance'])

    const tableNames = existingTables?.map(t => t.table_name) || []
    
    if (!tableNames.includes('user_behavior_events')) {
      await createBehaviorEventsTable()
    }
    
    if (!tableNames.includes('user_sessions')) {
      await createSessionsTable()
    }
    
    if (!tableNames.includes('heatmap_data')) {
      await createHeatmapTable()
    }
    
    if (!tableNames.includes('page_performance')) {
      await createPerformanceTable()
    }
    
    console.log('✅ Behavior analytics tables initialized')
    return true
  } catch (error) {
    console.error('❌ Error initializing behavior analytics:', error)
    return false
  }
}

async function createBehaviorEventsTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE user_behavior_events (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'anonymous',
        session_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_data JSONB DEFAULT '{}',
        url TEXT NOT NULL,
        referrer TEXT,
        user_agent TEXT,
        viewport JSONB,
        device_type TEXT,
        os TEXT,
        browser TEXT,
        screen_resolution TEXT,
        geo_location JSONB,
        timezone TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX idx_user_behavior_events_user_id ON user_behavior_events(user_id);
      CREATE INDEX idx_user_behavior_events_session_id ON user_behavior_events(session_id);
      CREATE INDEX idx_user_behavior_events_event_type ON user_behavior_events(event_type);
      CREATE INDEX idx_user_behavior_events_created_at ON user_behavior_events(created_at DESC);
    `
  })
  
  if (error) throw error
}

async function createSessionsTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE user_sessions (
        id BIGSERIAL PRIMARY KEY,
        session_id TEXT UNIQUE NOT NULL,
        user_id TEXT NOT NULL DEFAULT 'anonymous',
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ,
        duration INTEGER,
        pages_visited JSONB DEFAULT '[]',
        page_count INTEGER DEFAULT 0,
        click_count INTEGER DEFAULT 0,
        scroll_depth INTEGER DEFAULT 0,
        device_type TEXT,
        source TEXT,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        exit_page TEXT,
        is_bounce BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
      CREATE INDEX idx_user_sessions_start_time ON user_sessions(start_time DESC);
    `
  })
  
  if (error) throw error
}

async function createHeatmapTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE heatmap_data (
        id BIGSERIAL PRIMARY KEY,
        page_url TEXT NOT NULL,
        viewport JSONB NOT NULL,
        click_data JSONB DEFAULT '[]',
        scroll_data JSONB DEFAULT '[]',
        hover_data JSONB DEFAULT '[]',
        total_views INTEGER DEFAULT 0,
        unique_users INTEGER DEFAULT 0,
        date_collected DATE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX idx_heatmap_data_page_url ON heatmap_data(page_url);
      CREATE INDEX idx_heatmap_data_date_collected ON heatmap_data(date_collected DESC);
    `
  })
  
  if (error) throw error
}

async function createPerformanceTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE page_performance (
        id BIGSERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        load_time INTEGER,
        first_contentful_paint INTEGER,
        largest_contentful_paint INTEGER,
        first_input_delay INTEGER,
        cumulative_layout_shift DECIMAL(4,3),
        user_id TEXT,
        session_id TEXT,
        device_type TEXT,
        connection_type TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX idx_page_performance_url ON page_performance(url);
      CREATE INDEX idx_page_performance_created_at ON page_performance(created_at DESC);
    `
  })
  
  if (error) throw error
}

export { initializeBehaviorAnalytics }