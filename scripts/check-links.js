const fs = require('fs/promises');
const path = require('path');

// 允许的最大并发请求数
const MAX_CONCURRENCY = 10;
// 超时时间（毫秒）
const TIMEOUT_MS = 10000;

/**
 * 任务二拓展：预留调用 OpenAI API 对新提交工具进行“智能分类”的函数伪代码接口
 * @param {Object} tool - 工具对象，包含名称、描述、URL等
 * @returns {Promise<string>} - 预测的分类类别
 */
async function categorizeToolWithAI(tool) {
  /*
  // 伪代码：
  console.log(`[AI Classification] Analyzing tool: ${tool.name}...`);
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an AI that categorizes tools. Return only the category name.' },
          { role: 'user', content: `Categorize this AI tool: Name: ${tool.name}, Description: ${tool.description}` }
        ]
      })
    });
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error(`[AI Classification Error]: ${error.message}`);
    return 'Uncategorized';
  }
  */
  return 'AI Tool';
}

/**
 * 带超时的 Fetch 请求封装
 */
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      redirect: 'manual' // 手动处理重定向以检查可疑跳转
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * 检查单个 URL 的有效性
 */
async function checkLink(tool) {
  const { name, url } = tool;
  if (!url) return { tool, status: 'NO_URL' };

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIToolsNavigatorBot/1.0; +https://github.com/ai-tools-navigator)'
      }
    });

    const statusCode = response.status;

    // 检查是否重定向
    if (statusCode >= 300 && statusCode < 400) {
      const location = response.headers.get('location');
      // 简单判断可疑重定向：跨域、短链接或者非 HTTPS
      if (location && (!location.startsWith('https') || location.includes('bit.ly'))) {
        return { tool, status: 'SUSPICIOUS_REDIRECT', code: statusCode, detail: location };
      }
      return { tool, status: 'REDIRECT', code: statusCode, detail: location };
    }

    if (statusCode === 404 || statusCode >= 500) {
      return { tool, status: 'DEAD_LINK', code: statusCode };
    }

    return { tool, status: 'OK', code: statusCode };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { tool, status: 'TIMEOUT' };
    }
    return { tool, status: 'ERROR', detail: error.message };
  }
}

/**
 * 主执行函数
 */
async function main() {
  console.log('🚀 Starting Automated Link Checking & Security Audit...\n');

  // 注意：因为项目中实际数据可能存在数据库中，这里我们假设你按照要求
  // 把待检查的工具数据导出到了项目根目录下的 data/tools.json
  const dataPath = path.join(__dirname, '../data/tools.json');
  
  let tools = [];
  try {
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    tools = JSON.parse(fileContent);
    console.log(`✅ Loaded ${tools.length} tools from ${dataPath}.`);
  } catch (error) {
    console.error(`❌ Failed to read data file at ${dataPath}. Please make sure the file exists and is valid JSON.`);
    console.error(`[Error info]: ${error.message}`);
    // 如果没有文件，为了测试演示，我们造点假数据
    console.log('\n⚠️ Using mocked data for demonstration purposes...');
    tools = [
      { name: 'ChatGPT', url: 'https://chat.openai.com' },
      { name: 'Dead Tool 404', url: 'https://httpstat.us/404' },
      { name: 'Server Error 500', url: 'https://httpstat.us/500' },
      { name: 'Suspicious Redirect', url: 'http://bit.ly/suspicious-link' }
    ];
  }

  console.log(`\n🔍 Checking ${tools.length} links with concurrency ${MAX_CONCURRENCY}...\n`);

  let deadLinks = [];
  let index = 0;

  // 高并发执行器
  const executeTasks = async () => {
    while (index < tools.length) {
      const currentIndex = index++;
      const tool = tools[currentIndex];
      
      const result = await checkLink(tool);

      if (result.status === 'OK' || result.status === 'REDIRECT') {
        process.stdout.write('·'); // 成功或正常重定向打个点，不占用过多终端行
      } else {
        process.stdout.write('\n');
        console.warn(`[WARNING] ${result.status} | Tool: ${result.tool.name} | URL: ${result.tool.url}`);
        if (result.code) console.warn(`   └─ Status Code: ${result.code}`);
        if (result.detail) console.warn(`   └─ Detail: ${result.detail}`);
        deadLinks.push(result);
      }
    }
  };

  const workers = Array(Math.min(MAX_CONCURRENCY, tools.length)).fill(null).map(executeTasks);
  await Promise.all(workers);

  console.log('\n\n📊 Check Summary:');
  console.log(`Total checked: ${tools.length}`);
  console.log(`Issues found: ${deadLinks.length}`);

  if (deadLinks.length > 0) {
    console.log('\n🚨 Please review the problematic links and update or remove them.');
    process.exit(1); // 以非 0 状态退出，触发 GitHub Actions 报错和 Issue
  } else {
    console.log('\n🎉 All links are healthy!');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
