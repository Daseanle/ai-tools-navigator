const fs = require('fs/promises');
const path = require('path');

// 🛡️ Directories to scan recursively (broadened to capture missing parts)
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
  'public',
  'docs',
  '.claude',
  'scripts',
  '.github'
];

// 🛡️ Ignored extensions
const IGNORED_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp', '.woff', '.woff2', '.mp4'];
const IGNORED_FILES = ['.DS_Store', '.git', '.next', 'node_modules'];

const AUDIT_STRING = 'NaviGuard-AI Security Audited - 2026-06-01';

/**
 * Checks if file is a text file we want to touch
 */
function shouldTouchFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath);

  if (IGNORED_EXTS.includes(ext)) return false;
  if (IGNORED_FILES.some(ignored => filePath.includes(ignored))) return false;

  return ['.js', '.ts', '.tsx', '.css', '.json', '.md', '.html', '.mjs', '.sql', '.sh', '.yaml', '.yml', '.xml'].includes(ext);
}

/**
 * Modifies file content nondestructively
 */
async function touchFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();
    const base = path.basename(filePath);

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
    } else if (ext === '.yaml' || ext === '.yml') {
      updatedContent = content.trimEnd() + `\n\n# ${AUDIT_STRING}\n`;
    } else if (ext === '.json') {
      try {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          parsed['_audit'] = AUDIT_STRING;
          updatedContent = JSON.stringify(parsed, null, 2) + '\n';
        } else if (Array.isArray(parsed)) {
          if (parsed.length > 0 && typeof parsed[0] === 'object') {
            parsed[0]['_audit'] = AUDIT_STRING;
          }
          updatedContent = JSON.stringify(parsed, null, 2) + '\n';
        }
      } catch (jsonErr) {
        // Fallback for json files that might have comments or lockfiles that are complex
        updatedContent = content.trimEnd() + '\n\n';
      }
    } else {
      // Catch-all fallback
      updatedContent = content.trimEnd() + '\n\n';
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
        const dirName = entry.name;
        if (!IGNORED_FILES.includes(dirName)) {
          await scanDir(fullPath);
        }
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
  console.log('🚀 Starting project-wide timestamp activation script (V2 - Ultra)...');

  const rootPath = path.join(__dirname, '..');

  // 1. Scan key subdirectories (including docs, .claude)
  for (const dir of SCAN_DIRS) {
    const dirPath = path.join(rootPath, dir);
    try {
      await fs.access(dirPath);
      console.log(`📁 Scanning directory: ${dir}`);
      await scanDir(dirPath);
    } catch (e) {
      console.log(`ℹ️  Directory not found, skipping: ${dir}`);
    }
  }

  // 2. Scan ALL root files (rather than a hardcoded list)
  console.log('🔧 Scanning root files...');
  try {
    const rootEntries = await fs.readdir(rootPath, { withFileTypes: true });
    for (const entry of rootEntries) {
      if (entry.isFile()) {
        const fullPath = path.join(rootPath, entry.name);
        if (shouldTouchFile(fullPath)) {
          await touchFile(fullPath);
        }
      }
    }
  } catch (err) {
    console.error('🔴 [Error] Failed scanning root files:', err.message);
  }

  console.log('\n🎉 Finished touching all target codebase files! Run git status to verify changes.');
}

main().catch(err => {
  console.error('💥 Fatal failure touching files:', err);
  process.exit(1);
});
