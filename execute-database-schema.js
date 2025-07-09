const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 使用环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://msxadilzanoezfbidzyr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zeGFkaWx6YW5vZXpmYmlkenlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDA4MjAsImV4cCI6MjA2NjY3NjgyMH0.Wuxn_wHPqGhqMqAMQSgZXlPR2Zrp9myUq3b5CKylx00';

console.log('🚀 执行数据库schema...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSchema() {
  try {
    // 读取SQL文件
    const schemaPath = path.join(__dirname, 'database', 'payment-prompt-schema.sql');
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('\n📁 读取schema文件成功');
    console.log('📊 文件大小:', sqlContent.length, '字符');
    
    // 将SQL分割成单独的语句
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log('📝 发现', statements.length, '条SQL语句');
    
    // 逐条执行SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim().length === 0) continue;
      
      console.log(`\n[${i + 1}/${statements.length}] 执行SQL语句...`);
      console.log('📄 语句预览:', statement.substring(0, 100) + '...');
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) {
          // 尝试直接使用from语句（对于某些查询）
          console.log('⚠️  RPC失败，尝试直接执行...');
          
          // 对于CREATE TABLE和INSERT语句，我们需要另想办法
          if (statement.toLowerCase().includes('create table') || 
              statement.toLowerCase().includes('insert into') ||
              statement.toLowerCase().includes('create index') ||
              statement.toLowerCase().includes('create or replace function') ||
              statement.toLowerCase().includes('create trigger') ||
              statement.toLowerCase().includes('drop trigger')) {
            
            console.log('💡 正在尝试通过PostgreSQL客户端执行...');
            console.log('❌ 错误详情:', error);
            
            // 这里我们需要直接使用SQL执行
            console.log('⚠️  这条语句需要在Supabase SQL编辑器中手动执行:', statement.substring(0, 200) + '...');
            continue;
          }
          
          throw error;
        }
        
        console.log('✅ 执行成功');
        if (data) {
          console.log('📋 返回数据:', JSON.stringify(data).substring(0, 200) + '...');
        }
        
      } catch (stmtError) {
        console.error('❌ SQL语句执行失败:', stmtError);
        console.error('💥 失败的语句:', statement.substring(0, 200) + '...');
        
        // 对于某些语句，失败是可以接受的（如DROP IF EXISTS）
        if (statement.toLowerCase().includes('drop') && statement.toLowerCase().includes('if exists')) {
          console.log('ℹ️  这是一个DROP IF EXISTS语句，失败是正常的');
          continue;
        }
        
        // 继续执行其他语句
        console.log('⚠️  继续执行下一条语句...');
      }
    }
    
    console.log('\n🎉 Schema执行完成！');
    
    // 验证创建的表
    console.log('\n🔍 验证创建的表...');
    await verifyTables();
    
  } catch (error) {
    console.error('❌ Schema执行失败:', error);
  }
}

async function verifyTables() {
  const tablesToCheck = [
    'payment_orders',
    'prompt_categories', 
    'prompts',
    'user_prompt_purchases',
    'user_prompt_favorites',
    'user_prompt_ratings',
    'creator_earnings',
    'withdrawal_requests',
    'user_api_credits',
    'user_ad_credits'
  ];
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ 表 ${table} 不存在或无法访问:`, error.message);
      } else {
        console.log(`✅ 表 ${table} 存在且可访问`);
      }
    } catch (e) {
      console.log(`❌ 表 ${table} 检查失败:`, e.message);
    }
  }
  
  // 检查数据
  console.log('\n📊 检查初始数据...');
  try {
    const { data: categories, error: catError } = await supabase
      .from('prompt_categories')
      .select('*');
    
    if (!catError && categories) {
      console.log('✅ Prompt分类数据:', categories.length, '条');
      console.log('📂 分类:', categories.map(c => c.name).join(', '));
    }
    
    const { data: prompts, error: promptError } = await supabase
      .from('prompts')
      .select('*');
    
    if (!promptError && prompts) {
      console.log('✅ Prompt数据:', prompts.length, '条');
      console.log('📝 Prompt:', prompts.map(p => p.title).join(', '));
    }
    
  } catch (e) {
    console.log('❌ 数据检查失败:', e.message);
  }
}

executeSchema();