/**
 * Framework & Language-Agnostic Architecture Flow Engine.
 * Maps component connections, call metrics, and structural framework roles across languages.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { formatSize } = require('./formatter.js');

// ─── Framework Role Definitions ───────────────────────────────────────────────

const ROLES = {
  ENTRY:       { role: 'ENTRY',       icon: '🚀', label: 'Entry Point' },
  LAYOUT:      { role: 'LAYOUT',      icon: '📋', label: 'Layout' },
  PAGE:        { role: 'PAGE',        icon: '💻', label: 'Page' },
  CLIENT_COMP: { role: 'CLIENT_COMP', icon: '🧱', label: 'Client Component' },
  ROUTE:       { role: 'ROUTE',       icon: '🌐', label: 'Route/Endpoint' },
  CONTROLLER:  { role: 'CONTROLLER',  icon: '⚙️',  label: 'Controller' },
  SERVICE:     { role: 'SERVICE',     icon: '💼', label: 'Business Logic' },
  MODEL:       { role: 'MODEL',       icon: '🗄️', label: 'Model/Database' },
  MIDDLEWARE:  { role: 'MIDDLEWARE',  icon: '🛡️', label: 'Middleware' },
  COMPONENT:   { role: 'COMPONENT',   icon: '🧩', label: 'UI Component' },
  UTILITY:     { role: 'UTILITY',     icon: '🛠️', label: 'Utility/Helper' },
  MODULE:      { role: 'MODULE',      icon: '📦', label: 'Module' },
};

/**
 * Detect structural framework role of a file using path conventions and content checks.
 *
 * @param {string} filePath
 * @param {string} [fileContent]
 * @returns {{ role: string, icon: string, label: string }}
 */
function detectFrameworkRole(filePath, fileContent = '') {
  const normPath = filePath.replace(/\\/g, '/').toLowerCase();
  const baseName = path.basename(normPath);
  const ext = path.extname(normPath);

  // 1. Entry point check
  if (/^(?:index|main|app|server)\.(?:js|ts|tsx|jsx|py|go|php|rb|rs|java|dart|c|cpp)$/i.test(baseName)) {
    // Only classify as ENTRY if in root, src top level, or lib/main.dart
    if (!normPath.includes('/src/') || normPath.split('/').length <= 3 || normPath.endsWith('lib/main.dart')) {
      return ROLES.ENTRY;
    }
  }

  // 2. Next.js / React Layout & Page
  if (/^layout\.(?:tsx|jsx|js)$/i.test(baseName)) return ROLES.LAYOUT;
  if (/^(?:page\.(?:tsx|jsx|js)|view\.vue|index\.html)$/i.test(baseName)) return ROLES.PAGE;

  // 3. React Client Component directive (must appear as top-level directive in first 500 chars)
  if (['.jsx', '.tsx', '.js', '.ts', '.vue'].includes(ext)) {
    if (fileContent) {
      const topContent = fileContent.substring(0, 500);
      if (/^\s*['"]use client['"]/m.test(topContent)) {
        return ROLES.CLIENT_COMP;
      }
    }
  }

  // 4. Backend & API Patterns
  if (/(?:route|routing|urls\.py|endpoint|endpoints|api\/)/i.test(normPath)) return ROLES.ROUTE;
  if (/(?:controller|ctrl|views\.py|handler|handlers)/i.test(normPath)) return ROLES.CONTROLLER;
  if (/(?:service|services|provider|providers|logic|services\.py|usecase)/i.test(normPath)) return ROLES.SERVICE;
  if (/(?:model|models|schema|schemas|entity|entities|models\.py|\.db|prisma)/i.test(normPath)) return ROLES.MODEL;
  if (/(?:middleware|middlewares|interceptor|guard|guards)/i.test(normPath)) return ROLES.MIDDLEWARE;

  // 5. Frontend & Utility Patterns
  if (/(?:component|components|widget|widgets|ui\/)/i.test(normPath)) return ROLES.COMPONENT;
  if (ext === '.dart' && fileContent && /extends\s+StatelessWidget|extends\s+StatefulWidget/.test(fileContent)) return ROLES.COMPONENT;
  if (/(?:util|utils|helper|helpers|lib|tools)/i.test(normPath)) return ROLES.UTILITY;

  return ROLES.MODULE;
}

// ─── Multi-Language Dependency Resolver ───────────────────────────────────────

/**
 * Try resolving a relative target path to an existing file on disk.
 *
 * @param {string} baseDir
 * @param {string} target
 * @returns {string|null} absolute file path or null
 */
function resolveFileTarget(baseDir, target) {
  const candidate = path.resolve(baseDir, target);

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }

  const exts = ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs', '.py', '.go', '.php', '.dart', '.c', '.cpp', '.h'];
  for (const e of exts) {
    if (fs.existsSync(candidate + e) && fs.statSync(candidate + e).isFile()) {
      return candidate + e;
    }
  }

  // Directory index check
  for (const e of exts) {
    const idx = path.join(candidate, 'index' + e);
    if (fs.existsSync(idx) && fs.statSync(idx).isFile()) {
      return idx;
    }
  }

  return null;
}

/**
 * Extract relative import/require file paths from source code.
 *
 * @param {string} filePath
 * @param {string} rootDir
 * @param {string} fileContent
 * @returns {string[]} array of resolved relative file paths from rootDir
 */
function getFileImports(filePath, rootDir, fileContent) {
  if (!fileContent) return [];

  const ext = path.extname(filePath).toLowerCase();
  const fileDir = path.dirname(filePath);
  const rawTargets = new Set();

  // 1. JavaScript / TypeScript
  if (['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'].includes(ext)) {
    const jsRegex = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?['"](.*?)['"]|require\(['"](.*?)['"]\)|import\(['"](.*?)['"]\)/g;
    let m;
    while ((m = jsRegex.exec(fileContent)) !== null) {
      const imp = m[1] || m[2] || m[3];
      if (imp && (imp.startsWith('.') || imp.startsWith('@/'))) {
        rawTargets.add(imp.replace(/^@\//, './'));
      }
    }
  }

  // 2. Python
  if (ext === '.py') {
    const pyRegex = /from\s+(\.?\.?[a-zA-Z0-9_\.]+)\s+import|import\s+([a-zA-Z0-9_\.]+)/g;
    let m;
    while ((m = pyRegex.exec(fileContent)) !== null) {
      const imp = m[1] || m[2];
      if (imp) {
        if (imp.startsWith('.')) {
          const relPath = imp.replace(/\./g, '/') + '.py';
          rawTargets.add(relPath);
        } else {
          const pyPath = imp.replace(/\./g, '/') + '.py';
          rawTargets.add(pyPath);
          rawTargets.add('./' + pyPath);
        }
      }
    }
  }

  // 3. PHP
  if (ext === '.php') {
    const phpRegex = /(?:require|require_once|include|include_once)\s*\(?\s*['"](.*?)['"]\s*\)?/g;
    let m;
    while ((m = phpRegex.exec(fileContent)) !== null) {
      if (m[1]) rawTargets.add(m[1]);
    }
  }

  // 4. C / C++
  if (['.c', '.cpp', '.h', '.hpp'].includes(ext)) {
    const cRegex = /#include\s*["'](.*?)["']/g;
    let m;
    while ((m = cRegex.exec(fileContent)) !== null) {
      if (m[1]) rawTargets.add(m[1]);
    }
  }

  // 5. Go
  if (ext === '.go') {
    const goRegex = /import\s*\(([\s\S]*?)\)|import\s+["'](.*?)["']/g;
    let m;
    while ((m = goRegex.exec(fileContent)) !== null) {
      const block = m[1] || m[2];
      if (block) {
        const lines = block.split(/\r?\n/);
        for (const l of lines) {
          const lineMatch = l.match(/["'](.*?)["']/);
          if (lineMatch && lineMatch[1]) {
            const imp = lineMatch[1];
            if (imp.startsWith('.') || imp.includes('/')) {
              rawTargets.add(imp);
            }
          }
        }
      }
    }
  }

  // 6. Dart / Flutter
  if (ext === '.dart') {
    const dartRegex = /import\s+['"](.+?)['"]/g;
    let m;
    let pkgName = null;
    const pubspecPath = path.join(rootDir, 'pubspec.yaml');
    if (fs.existsSync(pubspecPath)) {
      try {
        const pContent = fs.readFileSync(pubspecPath, 'utf8');
        const nm = pContent.match(/^name:\s*([a-zA-Z0-9_]+)/m);
        if (nm) pkgName = nm[1];
      } catch (_) {}
    }

    while ((m = dartRegex.exec(fileContent)) !== null) {
      const imp = m[1];
      if (imp.startsWith('package:')) {
        const afterPkg = imp.replace(/^package:/, '');
        const slashIdx = afterPkg.indexOf('/');
        const importPkgName = slashIdx !== -1 ? afterPkg.substring(0, slashIdx) : afterPkg;
        const subPath = slashIdx !== -1 ? afterPkg.substring(slashIdx + 1) : '';

        if (pkgName && importPkgName === pkgName) {
          rawTargets.add(path.join('lib', subPath));
          rawTargets.add(subPath);
        } else if (subPath) {
          rawTargets.add(path.join('lib', subPath));
          rawTargets.add(subPath);
        }
      } else {
        rawTargets.add(imp);
        rawTargets.add(path.join('lib', imp));
      }
    }
  }

  // Resolve raw targets to clean relative paths from rootDir
  const resolvedRelPaths = [];
  for (const target of rawTargets) {
    const resolvedAbs = resolveFileTarget(fileDir, target) || resolveFileTarget(rootDir, target);
    if (resolvedAbs) {
      const rel = path.relative(rootDir, resolvedAbs).replace(/\\/g, '/');
      if (rel && rel !== path.relative(rootDir, filePath).replace(/\\/g, '/')) {
        resolvedRelPaths.push(rel);
      }
    }
  }

  return Array.from(new Set(resolvedRelPaths));
}

// ─── Scan Helper ─────────────────────────────────────────────────────────────

/**
 * Collect all file ScanNodes from a directory scan tree recursively.
 *
 * @param {Object} node
 * @returns {Object[]} list of file nodes
 */
function collectAllFiles(node) {
  if (!node) return [];
  const files = [];
  function traverse(n) {
    if (!n) return;
    if (!n.children) {
      files.push(n);
    } else {
      for (const c of n.children) traverse(c);
    }
  }
  traverse(node);
  return files;
}

/**
 * Read text content of a file safely.
 *
 * @param {string} absPath
 * @returns {string|null}
 */
function readContentSafely(absPath) {
  try {
    const stat = fs.statSync(absPath);
    if (stat.size > 2 * 1024 * 1024) return null; // Skip files > 2MB
    const buf = fs.readFileSync(absPath);
    // Null byte check
    for (let i = 0; i < Math.min(buf.length, 1024); i++) {
      if (buf[i] === 0) return null;
    }
    return buf.toString('utf8');
  } catch (_) {
    return null;
  }
}

// ─── Frequency Map & Entry Point Detector ─────────────────────────────────────

/**
 * Build frequency call map for files across the codebase.
 *
 * @param {Object[]} files
 * @param {string} rootDir
 * @returns {{ frequencyMap: Object<string, number>, importsMap: Object<string, string[]>, contentMap: Object<string, string> }}
 */
function analyzeCodebase(files, rootDir) {
  const frequencyMap = {};
  const importsMap = {};
  const contentMap = {};

  for (const file of files) {
    const relPath = path.relative(rootDir, file.path).replace(/\\/g, '/');
    const content = readContentSafely(file.path);
    contentMap[relPath] = content || '';

    const imports = content ? getFileImports(file.path, rootDir, content) : [];
    importsMap[relPath] = imports;

    for (const imp of imports) {
      frequencyMap[imp] = (frequencyMap[imp] || 0) + 1;
    }
  }

  return { frequencyMap, importsMap, contentMap };
}

/**
 * Automatically detect project entry point.
 *
 * @param {Object[]} files
 * @param {string} rootDir
 * @param {Object} frequencyMap
 * @returns {string|null}
 */
function detectEntryPoint(files, rootDir, frequencyMap) {
  const candidates = [
    'src/index.js', 'src/index.ts', 'src/main.ts', 'src/main.js', 'src/app.js', 'src/app.ts',
    'bin/cli.js', 'index.js', 'index.ts', 'main.js', 'main.py', 'app.py', 'main.go', 'server.js', 'app.ts'
  ];

  for (const cand of candidates) {
    const absCand = path.resolve(rootDir, cand);
    if (fs.existsSync(absCand)) {
      return cand;
    }
  }

  // Fallback: pick a file with 0 incoming calls that has outgoing imports
  let bestEntry = null;
  for (const f of files) {
    const rel = path.relative(rootDir, f.path).replace(/\\/g, '/');
    if (!frequencyMap[rel]) {
      const role = detectFrameworkRole(rel);
      if (role.role === 'ENTRY' || role.role === 'ROUTE' || role.role === 'PAGE') {
        return rel;
      }
      if (!bestEntry) bestEntry = rel;
    }
  }

  return bestEntry || (files[0] ? path.relative(rootDir, files[0].path).replace(/\\/g, '/') : null);
}

// ─── Execution Tree Builder ───────────────────────────────────────────────────

/**
 * Recursively build parent-child architecture execution tree.
 *
 * @param {string} currentRelPath
 * @param {string} rootDir
 * @param {Object} importsMap
 * @param {Object} frequencyMap
 * @param {Object} contentMap
 * @param {Set<string>} [visitedInBranch]
 * @returns {Object}
 */
function buildDependencyTree(currentRelPath, rootDir, importsMap, frequencyMap, contentMap, visitedInBranch = new Set()) {
  const absPath = path.resolve(rootDir, currentRelPath);
  let size = 0;
  try { size = fs.statSync(absPath).size; } catch (_) {}

  const content = contentMap[currentRelPath] || '';
  const roleInfo = detectFrameworkRole(currentRelPath, content);
  const calls = frequencyMap[currentRelPath] || 0;

  const node = {
    relPath: currentRelPath,
    size,
    role: roleInfo,
    calls,
    children: [],
    isCircular: false,
  };

  if (visitedInBranch.has(currentRelPath)) {
    node.isCircular = true;
    return node;
  }

  const nextVisited = new Set(visitedInBranch);
  nextVisited.add(currentRelPath);

  const imports = importsMap[currentRelPath] || [];
  for (const imp of imports) {
    const childNode = buildDependencyTree(imp, rootDir, importsMap, frequencyMap, contentMap, nextVisited);
    node.children.push(childNode);
  }

  return node;
}

// ─── High-Clarity Tabular Text Formatter ──────────────────────────────────────

/**
 * Format architecture flow tree into plain ASCII text.
 *
 * @param {Object} treeNode
 * @param {Object} [options]
 * @param {string} [prefix]
 * @param {boolean} [isLast]
 * @param {boolean} [isRoot]
 * @returns {string}
 */
function formatArchitectureFlowText(treeNode, options = {}, prefix = '', isLast = true, isRoot = true) {
  if (!treeNode) return '';
  const lines = [];

  if (isRoot) {
    lines.push('📦 Global Application Architecture Flow');
    lines.push('│');
  }

  const connector = isRoot ? '└── ' : (isLast ? '└── ' : '├── ');
  const itemPrefix = isRoot ? '' : prefix;
  const roleBadge = `[${treeNode.role.role}]`;
  const icon = treeNode.role.icon;

  const lineLeft = `${itemPrefix}${connector}${icon} ${roleBadge} ${treeNode.relPath}`;
  const padLen = Math.max(3, 62 - lineLeft.length);
  const dashes = '─'.repeat(padLen);
  const sizeText = formatSize(treeNode.size) || '0 B';

  let typeText = `──> Type: ${treeNode.role.label}`;
  if (treeNode.calls > 0) {
    typeText += ` (${treeNode.calls} call${treeNode.calls > 1 ? 's' : ''})`;
  }
  if (treeNode.isCircular) {
    typeText += ' (circular)';
  }

  lines.push(`${lineLeft} ${dashes} [${sizeText}] ${typeText}`);

  if (treeNode.children && treeNode.children.length && !treeNode.isCircular) {
    const childPrefix = isRoot ? '    ' : prefix + (isLast ? '    ' : '│   ');
    treeNode.children.forEach((child, i) => {
      lines.push(formatArchitectureFlowText(child, options, childPrefix, i === treeNode.children.length - 1, false));
    });
  }

  return lines.join('\n');
}

/**
 * Format architecture flow tree into colorized terminal text.
 *
 * @param {Object} treeNode
 * @param {Object} [options]
 * @param {string} [prefix]
 * @param {boolean} [isLast]
 * @param {boolean} [isRoot]
 * @returns {string}
 */
function formatArchitectureFlowColored(treeNode, options = {}, prefix = '', isLast = true, isRoot = true) {
  if (!treeNode) return '';
  const lines = [];

  const R = '\x1b[0m';
  const G = '\x1b[90m';
  const B = '\x1b[34m';
  const C = '\x1b[36m';
  const Y = '\x1b[33m';
  const W = '\x1b[37m';

  if (isRoot) {
    lines.push(`${B}📦 Global Application Architecture Flow${R}`);
    lines.push(`${G}│${R}`);
  }

  const connector = isRoot ? '└── ' : (isLast ? '└── ' : '├── ');
  const itemPrefix = isRoot ? '' : prefix;
  const roleBadge = `[${treeNode.role.role}]`;
  const icon = treeNode.role.icon;

  const rawLeft = `${itemPrefix}${connector}${icon} ${roleBadge} ${treeNode.relPath}`;
  const padLen = Math.max(3, 62 - rawLeft.length);
  const dashes = '─'.repeat(padLen);
  const sizeText = formatSize(treeNode.size) || '0 B';

  let typeText = `──> Type: ${treeNode.role.label}`;
  if (treeNode.calls > 0) {
    typeText += ` (${treeNode.calls} call${treeNode.calls > 1 ? 's' : ''})`;
  }
  if (treeNode.isCircular) {
    typeText += ' (circular)';
  }

  const coloredPrefix = itemPrefix.replace(/│/g, `${G}│${R}`);
  const coloredConnector = `${G}${connector}${R}`;
  const coloredRole = `${C}${roleBadge}${R}`;
  const coloredPath = `${W}${treeNode.relPath}${R}`;
  const coloredDashes = `${G}${dashes}${R}`;
  const coloredSize = `${Y}[${sizeText}]${R}`;
  const coloredType = `${G}${typeText}${R}`;

  lines.push(`${coloredPrefix}${coloredConnector}${icon} ${coloredRole} ${coloredPath} ${coloredDashes} ${coloredSize} ${coloredType}`);

  if (treeNode.children && treeNode.children.length && !treeNode.isCircular) {
    const childPrefix = isRoot ? '    ' : prefix + (isLast ? '    ' : '│   ');
    treeNode.children.forEach((child, i) => {
      lines.push(formatArchitectureFlowColored(child, options, childPrefix, i === treeNode.children.length - 1, false));
    });
  }

  return lines.join('\n');
}

// ─── Main Architecture Flow Orchestrator ──────────────────────────────────────

/**
 * Generate architecture flow for a directory project.
 *
 * @param {string} rootDir
 * @param {Object} [scannedTree]
 * @returns {{ flowText: string, coloredFlowText: string, entryPoint: string, treeNode: Object }}
 */
function generateArchitectureFlow(rootDir, scannedTree = null) {
  const absRoot = path.resolve(rootDir);

  let tree = scannedTree;
  if (!tree) {
    const { scan } = require('./scanner.js');
    tree = scan(absRoot);
  }

  if (!tree) {
    throw new Error(`Could not scan directory for architecture flow: ${rootDir}`);
  }

  const files = collectAllFiles(tree);
  const { frequencyMap, importsMap, contentMap } = analyzeCodebase(files, absRoot);

  const entryPoint = detectEntryPoint(files, absRoot, frequencyMap);
  if (!entryPoint) {
    throw new Error('No valid entry point or application code found.');
  }

  const dependencyTree = buildDependencyTree(entryPoint, absRoot, importsMap, frequencyMap, contentMap);
  const flowText = formatArchitectureFlowText(dependencyTree);
  const coloredFlowText = formatArchitectureFlowColored(dependencyTree);

  return {
    flowText,
    coloredFlowText,
    entryPoint,
    treeNode: dependencyTree,
  };
}

module.exports = {
  generateArchitectureFlow,
  detectFrameworkRole,
  getFileImports,
  detectEntryPoint,
  ROLES,
};
