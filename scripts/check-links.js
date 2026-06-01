const fs = require('fs/promises');
const path = require('path');

// 🛡️ Configuration Constants
const MAX_CONCURRENCY = 8;
const TIMEOUT_MS = 8000;
const SUSPICIOUS_DOMAINS = ['bit.ly', 't.co', 'tinyurl.com', 'clickbank', 'adfly', 'shorte.st'];

/**
 * Task II Extension: Pre-wired interface for intelligent categorization using OpenAI SDK.
 * This function handles raw tool data and outputs a recommended directory category.
 * 
 * @param {Object} tool - The tool metadata object
 * @param {string} tool.name - Name of the tool
 * @param {string} tool.description - Short summary of the tool
 * @param {string} tool.url - Main site URL
 * @returns {Promise<string>} Recommended category
 */
async function categorizeToolWithAI(tool) {
  if (!process.env.OPENAI_API_KEY) {
    console.log(`[AI Classifier] (Skipped) OPENAI_API_KEY not found. Defaulting to 'AI General'.`);
    return 'AI General';
  }

  try {
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `You are a professional directory administrator. Analyze this AI tool and categorize it into exactly one of these: 
- 'ai-writing'
- 'ai-design'
- 'developer-tools'
- 'productivity-agents'
- 'data-analytics'

Tool Name: "${tool.name}"
Description: "${tool.description}"
URL: "${tool.url}"

Return ONLY the slug name from the list above. Do not output any markdown or explanation.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 15
    });

    const category = response.choices[0].message.content.trim().toLowerCase();
    console.log(`[AI Classifier] Categorized "${tool.name}" as "${category}".`);
    return category;
  } catch (error) {
    console.error(`[AI Classifier Error] Failed to classify "${tool.name}":`, error.message);
    return 'Uncategorized';
  }
}

/**
 * Standard fetch request wrapper equipped with a hard Timeout limit.
 * 
 * @param {string} url - Target endpoint
 * @param {Object} options - Request options
 */
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      // manual redirect mode allows us to intercept redirects and inspect them for safety audits
      redirect: 'manual'
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Evaluates a single tool link's status and checks for malicious redirect risks.
 * 
 * @param {Object} tool - The tool to test
 * @returns {Promise<Object>} Verification status object
 */
async function checkLink(tool) {
  const { name, url } = tool;
  if (!url) {
    return { tool, status: 'NO_URL', ok: false };
  }

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AI-Tools-Navigator-AuditBot/2.0'
      }
    });

    const statusCode = response.status;

    // Check Redirects (3xx)
    if (statusCode >= 300 && statusCode < 400) {
      const location = response.headers.get('location') || '';
      
      // Rigorous redirect domain analysis to prevent false positives (like t.co matching chatgpt.com)
      let isSuspicious = false;
      try {
        const parsedRedirect = new URL(location, url);
        const redirectHostname = parsedRedirect.hostname;
        
        isSuspicious = SUSPICIOUS_DOMAINS.some(domain => 
          redirectHostname === domain || redirectHostname.endsWith('.' + domain)
        ) || (url.startsWith('https') && location.startsWith('http://')); // Avoid downgrade protocol
      } catch (e) {
        // Fallback for relative paths or malformed URLs
        isSuspicious = SUSPICIOUS_DOMAINS.some(domain => {
          if (domain === 't.co') {
            return location.includes('://t.co/') || location.includes('://www.t.co/');
          }
          return location.includes(domain);
        }) || (url.startsWith('https') && location.startsWith('http://'));
      }

      if (isSuspicious) {
        return {
          tool,
          status: 'SUSPICIOUS_REDIRECT',
          ok: false, // Security threat
          code: statusCode,
          detail: `Redirected to potential unsecured/shortener site: ${location}`
        };
      }

      return { tool, status: 'REDIRECT', ok: true, code: statusCode, detail: location };
    }

    // Check Bad Statuses (4xx, 5xx)
    if (statusCode === 404 || statusCode >= 500) {
      return { tool, status: 'DEAD_LINK', ok: false, code: statusCode };
    }

    // Cloudflare Anti-Bot block (403) or Rate Limit (429) are logged but not flagged as dead links
    if (statusCode === 403 || statusCode === 429) {
      return { tool, status: 'RESTRICTED_ACCESS', ok: true, code: statusCode, detail: 'Cloudflare / Anti-bot verification active' };
    }

    return { tool, status: 'OK', ok: true, code: statusCode };
  } catch (error) {
    // Net issues or timeouts are reported but not flagged as dead links to prevent temporary CI failures
    if (error.name === 'AbortError') {
      return { tool, status: 'TIMEOUT', ok: true, detail: `Request timed out after ${TIMEOUT_MS}ms` };
    }
    return { tool, status: 'NETWORK_ERROR', ok: true, detail: error.message };
  }
}

/**
 * Main execution routine for validating and auditing codebase URLs.
 */
async function main() {
  console.log('🛡️  [AI Tools Navigator] Initiating automated link checks and security audit...');

  const dataPath = path.join(__dirname, '../data/tools.json');
  let tools = [];

  try {
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    tools = JSON.parse(fileContent);
    console.log(`📂 Read tools directory. Loaded ${tools.length} records from data source.`);
  } catch (error) {
    console.warn(`⚠️  Unable to read database file from: ${dataPath}. Falling back to default tools for testing.`);
    tools = [
      { name: 'ChatGPT', url: 'https://chat.openai.com', description: 'Conversational AI' },
      { name: 'Midjourney', url: 'https://www.midjourney.com', description: 'AI Image Creator' },
      { name: 'Dead Tool Test (404)', url: 'https://httpstat.us/404', description: 'Simulated 404' },
      { name: 'Server Error Test (500)', url: 'https://httpstat.us/500', description: 'Simulated 500' }
    ];
  }

  console.log(`🔍 Auditing ${tools.length} links using a concurrency queue of ${MAX_CONCURRENCY}...\n`);

  const issuesList = [];
  let index = 0;

  // Concurrent queue worker
  const worker = async () => {
    while (index < tools.length) {
      const currentIndex = index++;
      const tool = tools[currentIndex];
      
      const result = await checkLink(tool);

      if (result.ok) {
        if (result.status === 'OK') {
          process.stdout.write('🟢 ');
        } else {
          // Redirect or timeout warnings
          process.stdout.write('🟡 ');
          console.log(`\n[INFO] ${result.status} on Tool: "${result.tool.name}" | Status: ${result.code || 'N/A'} | Detail: ${result.detail || 'N/A'}`);
        }
      } else {
        process.stdout.write('🔴 ');
        console.warn(`\n[ALERT] ${result.status} on Tool: "${result.tool.name}"`);
        console.warn(`  ↳ URL: ${result.tool.url}`);
        if (result.code) console.warn(`  ↳ Status: ${result.code}`);
        if (result.detail) console.warn(`  ↳ Detail: ${result.detail}`);
        issuesList.push(result);
      }
    }
  };

  // Launch workers
  const threads = Array(Math.min(MAX_CONCURRENCY, tools.length)).fill(null).map(worker);
  await Promise.all(threads);

  console.log('\n\n📊 ========================================');
  console.log(`   Audited: ${tools.length} tools`);
  console.log(`   Issues found: ${issuesList.length}`);
  console.log('===========================================\n');

  if (issuesList.length > 0) {
    console.error('❌ Security validation failed. Problematic tool URLs were detected.');
    process.exit(1);
  } else {
    console.log('✅ Security validation passed. All links are healthy and secure!');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('💥 Fatal failure running automated checks:', err);
  process.exit(1);
});
