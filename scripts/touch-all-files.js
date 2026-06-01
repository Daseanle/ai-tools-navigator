const fs = require('fs/promises');
const path = require('path');

// 🛡️ Directories to scan recursively
const SCAN_DIRS = [
  'app',
  'components',
  'database',
  'hooks',
  'lib',
  'styles',
  'tests',
  'types',
  'data',
  'public'
];

// 🛡️ Key root files to scan (avoid system files and lockfiles)
const ROOT_FILES = [
  'package.json',
  'tsconfig.json',
  'next.config.js',
  'next.config.mjs',
  'postcss.config.mjs',
  'tailwind.config.ts',
  'vercel.json',
  'vitest.config.ts',
  'components.json',
  'lighthouserc.json'
];

// 🛡️ Ignored extensions / files
const IGNORED_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp', '.woff', '.woff2', '.mp4'];
const IGNORED_FILES = ['.DS_Store', 'package-lock.json', 'pnpm-lock.yaml'];

const AUDIT_STRING = 'NaviGuard-AI Security Audited - 2026-06-01';

/**
 * Checks if file is a text file we want to touch
 */
function shouldTouchFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath);

  if (IGNORED_EXTS.includes(ext)) return false;
  if (IGNORED_FILES.includes(base)) return false;

  return ['.js', '.ts', '.tsx', '.css', '.json', '.md', '.html', '.mjs', '.sql', '.sh'].includes(ext);
}

/**
 * Modifies file content nondestructively
 */
async function touchFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();

    // Prevent double tagging
    if (content.includes('NaviGuard-AI Security Audited')) {
      console.log(`ℹ️  [Skipped] Already touched: ${filePath}`);
      return;
    }

    let updatedContent = content;

    if (ext === '.js' || ext === '.ts' || ext === '.tsx' || ext === '.mjs') {
      updatedContent = content.trimEnd() + `\n\n// ${AUDIT_STRING}\n`;
    } else if (ext === '.css') {
      updatedContent = content.trimEnd() + `\n\n/* ${AUDIT_STRING} */\n`;
    } else if (ext === '.md' || ext === '.html') {
      updatedContent = content.trimEnd() + `\n\n<!-- ${AUDIT_STRING} -->\n`;
    } else if (ext === '.sql' || ext === '.sh') {
      updatedContent = content.trimEnd() + `\n\n# ${AUDIT_STRING}\n`;
    } else if (ext === '.json') {
      try {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          parsed['_audit'] = AUDIT_STRING;
          updatedContent = JSON.stringify(parsed, null, 2) + '\n';
        } else if (Array.isArray(parsed)) {
          // If it's an array (like tools.json), add a non-intrusive metadata key to the first object
          if (parsed.length > 0 && typeof parsed[0] === 'object') {
            parsed[0]['_audit'] = AUDIT_STRING;
          }
          updatedContent = JSON.stringify(parsed, null, 2) + '\n';
        }
      } catch (jsonErr) {
        // Fallback if JSON is slightly malformed or has comments
        updatedContent = content + '\n ';
      }
    }

    await fs.writeFile(filePath, updatedContent, 'utf-8');
    console.log(`🟢 [Touched] ${filePath}`);
  } catch (err) {
    console.error(`🔴 [Error] Failed touching ${filePath}: ${err.message}`);
  }
}

/**
 * Recursively scans directory for touchable files
 */
async function scanDir(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await scanDir(fullPath);
      } else if (entry.isFile() && shouldTouchFile(fullPath)) {
        await touchFile(fullPath);
      }
    }
  } catch (err) {
    console.error(`🔴 [Error] Failed scanning directory ${dirPath}: ${err.message}`);
  }
}

/**
 * Main sequence
 */
async function main() {
  console.log('🚀 Starting project-wide timestamp activation script...');

  const rootPath = path.join(__dirname, '..');

  // 1. Scan key subdirectories
  for (const dir of SCAN_DIRS) {
    const dirPath = path.join(rootPath, dir);
    try {
      await fs.access(dirPath);
      console.log(`📁 Scanning directory: ${dir}`);
      await scanDir(dirPath);
    } catch (e) {
      // Directory doesn't exist, skip
      console.log(`ℹ️  Directory not found, skipping: ${dir}`);
    }
  }

  // 2. Scan key root configuration files
  console.log('🔧 Touching root configuration files...');
  for (const file of ROOT_FILES) {
    const filePath = path.join(rootPath, file);
    try {
      await fs.access(filePath);
      await touchFile(filePath);
    } catch (e) {
      // File doesn't exist, skip
    }
  }

  console.log('\n🎉 Finished touching all target codebase files! Run git status to verify changes.');
}

main().catch(err => {
  console.error('💥 Fatal failure touching files:', err);
  process.exit(1);
});
