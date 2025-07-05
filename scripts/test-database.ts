import { supabase } from './supabase'

// 测试数据库连接和基本查询
async function testDatabaseConnection() {
  console.log('🔗 测试数据库连接...')
  
  try {
    const { data, error } = await supabase.from('categories').select('count(*)').single()
    
    if (error) {
      console.error('❌ 数据库连接失败:', error.message)
      return false
    }
    
    console.log('✅ 数据库连接成功')
    return true
  } catch (err) {
    console.error('❌ 连接测试异常:', err)
    return false
  }
}

// 测试表结构和数据
async function testTablesAndData() {
  console.log('\n📋 测试表结构和数据...')
  
  const tables = [
    'categories',
    'tools', 
    'tags',
    'tool_categories',
    'favorites',
    'upvotes',
    'comments',
    'admins',
    'use_cases',
    'workflows'
  ]
  
  const results = []
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
        results.push({ table, status: 'error', count: 0, error: error.message })
      } else {
        console.log(`✅ ${table}: ${count || 0} 条记录`)
        results.push({ table, status: 'success', count: count || 0 })
      }
    } catch (err) {
      console.log(`❌ ${table}: 异常 - ${err}`)
      results.push({ table, status: 'exception', count: 0, error: String(err) })
    }
  }
  
  return results
}

// 测试复杂查询
async function testComplexQueries() {
  console.log('\n🔍 测试复杂查询...')
  
  try {
    // 测试工具和分类关联查询
    const { data: toolsWithCategories, error: toolsError } = await supabase
      .from('tools')
      .select(`
        id,
        name,
        slug,
        tagline,
        tool_categories (
          categories (
            id,
            name,
            slug
          )
        )
      `)
      .limit(5)
    
    if (toolsError) {
      console.log('❌ 工具分类关联查询失败:', toolsError.message)
    } else {
      console.log(`✅ 工具分类关联查询成功，返回 ${toolsWithCategories?.length || 0} 条记录`)
    }
    
    // 测试用户收藏查询
    const { data: favoritesData, error: favoritesError } = await supabase
      .from('favorites')
      .select(`
        user_id,
        tools (
          id,
          name,
          slug
        )
      `)
      .limit(3)
    
    if (favoritesError) {
      console.log('❌ 用户收藏查询失败:', favoritesError.message)
    } else {
      console.log(`✅ 用户收藏查询成功，返回 ${favoritesData?.length || 0} 条记录`)
    }
    
  } catch (err) {
    console.log('❌ 复杂查询异常:', err)
  }
}

// 主测试函数
async function runDatabaseTests() {
  console.log('🚀 开始数据库测试...\n')
  
  // 1. 测试连接
  const connectionOk = await testDatabaseConnection()
  if (!connectionOk) {
    console.log('\n❌ 数据库连接失败，停止测试')
    return
  }
  
  // 2. 测试表和数据
  const tableResults = await testTablesAndData()
  
  // 3. 测试复杂查询
  await testComplexQueries()
  
  // 4. 输出测试总结
  console.log('\n📊 测试总结:')
  console.log('=' * 50)
  tableResults.forEach(result => {
    const status = result.status === 'success' ? '✅' : '❌'
    console.log(`${status} ${result.table.padEnd(20)} ${result.count.toString().padStart(6)} 条记录`)
  })
  
  const totalRecords = tableResults
    .filter(r => r.status === 'success')
    .reduce((sum, r) => sum + r.count, 0)
  
  console.log('=' * 50)
  console.log(`📈 总记录数: ${totalRecords}`)
  console.log('\n✅ 数据库测试完成!')
}

// 执行测试
runDatabaseTests().catch(console.error)