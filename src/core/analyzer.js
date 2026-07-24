'use strict';

const path = require('path');

/**
 * Parses file content to extract imports, exports, functions and components.
 *
 * @param {string} content - The content of the file.
 * @param {string} filepath - The path to the file.
 * @returns {Object} Extracted data
 */
function parseFile(content, filepath) {
  const ext = path.extname(filepath).toLowerCase();

  const results = {
    imports: [],
    exports: [],
    components: [],
    functions: [],
    lines: 0,
    complexity: 1,
  };

  if (!content) {
    return results;
  }

  results.lines = content.split('\n').length;

  // Basic Cyclomatic Complexity estimation
  const flowControlRegex = /\b(if|else if|for|while|case|catch|switch)\b/g;
  const matches = content.match(flowControlRegex);
  if (matches) {
    results.complexity += matches.length;
  }
  const logicOpsRegex = /(&&|\|\||\?)/g;
  const logicMatches = content.match(logicOpsRegex);
  if (logicMatches) {
    results.complexity += logicMatches.length;
  }

  if (!['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.vue', '.svelte'].includes(ext)) {
    return results;
  }

  // Check for JSX usage to flag potential components broadly
  const hasJSX = /<\w+[\s\S]*?>[\s\S]*?<\/\w+>|<\w+[\s\S]*?\/>/.test(content);

  // Extract Functions and Components
  const funcRegex = /(?:function\s+([a-zA-Z0-9_$]+))|(?:(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>)/g;
  let funcMatch;
  while ((funcMatch = funcRegex.exec(content)) !== null) {
    const name = funcMatch[1] || funcMatch[2];
    if (name) {
      results.functions.push(name);
      // Heuristic: PascalCase function + file has JSX = Component
      if (/^[A-Z]/.test(name) && hasJSX) {
        results.components.push(name);
      }
    }
  }

  // Extract classes (could be React components)
  const classRegex = /class\s+([a-zA-Z0-9_$]+)/g;
  while ((funcMatch = classRegex.exec(content)) !== null) {
    if (funcMatch[1]) {
      results.functions.push(funcMatch[1]);
      if (/^[A-Z]/.test(funcMatch[1]) && hasJSX) {
        results.components.push(funcMatch[1]);
      }
    }
  }

  // Vue / Svelte single file components
  if (ext === '.vue' || ext === '.svelte') {
    const name = path.basename(filepath, ext);
    results.components.push(name);
  }

  results.functions = [...new Set(results.functions)];
  results.components = [...new Set(results.components)];


  // Extract Imports
  // 1. import { x } from 'y'
  // 2. import x from 'y'
  // 3. import * as x from 'y'
  // 4. import 'y'
  const importRegex = /import\s+(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    if (match[1]) results.imports.push(match[1]);
  }

  // 5. require('y')
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    if (match[1]) results.imports.push(match[1]);
  }

  // 6. import('y')
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    if (match[1]) results.imports.push(match[1]);
  }

  // Deduplicate imports
  results.imports = [...new Set(results.imports)];

  // Extract Exports
  // 1. export const x
  // 2. export let x
  // 3. export var x
  // 4. export function x
  // 5. export class x
  const namedExportRegex = /export\s+(?:const|let|var|function|class)\s+([a-zA-Z0-9_$]+)/g;
  while ((match = namedExportRegex.exec(content)) !== null) {
    if (match[1]) results.exports.push(match[1]);
  }

  // 6. export default x
  const defaultExportRegex = /export\s+default\s+([a-zA-Z0-9_$]+)?/g;
  while ((match = defaultExportRegex.exec(content)) !== null) {
    results.exports.push('default'); // Standardize default exports
  }

  // 7. export { x, y as z }
  const blockExportRegex = /export\s+\{([^}]+)\}/g;
  while ((match = blockExportRegex.exec(content)) !== null) {
    const vars = match[1].split(',').map(s => {
      const parts = s.trim().split(/\s+as\s+/);
      return parts.length > 1 ? parts[1] : parts[0];
    }).filter(s => s);
    results.exports.push(...vars);
  }

  // 8. module.exports = ...
  if (/module\.exports\s*=/.test(content)) {
    results.exports.push('default');
  }

  // 9. exports.x = ...
  const commonJsExportRegex = /exports\.([a-zA-Z0-9_$]+)\s*=/g;
  while ((match = commonJsExportRegex.exec(content)) !== null) {
    if (match[1]) results.exports.push(match[1]);
  }

  // Deduplicate exports
  results.exports = [...new Set(results.exports)];

  return results;
}

/**
 * Builds architecture graph, calculates usage stats and detects dead code/circular dependencies.
 * @param {Array<Object>} parsedFiles - List of parsed file objects from scanner
 * @returns {Object} Architecture graph data
 */
function buildArchitectureGraph(parsedFiles) {
  const graph = {
    imports: {},
    exports: {},
    usage: {},
    deadCode: {
      files: [],
      exports: [],
      components: [],
    },
    circular: [],
  };

  const fileMap = new Map();
  parsedFiles.forEach(pf => fileMap.set(pf.relPath, pf));

  // Cache keys to optimize inner loop (O(N) instead of O(N^2) over entire Map entries)
  const allKeys = Array.from(fileMap.keys());

  // Build usage map
  parsedFiles.forEach(pf => {
    graph.imports[pf.relPath] = pf.parsed.imports || [];
    graph.exports[pf.relPath] = pf.parsed.exports || [];

    // Initialize usage counter for this file
    if (!graph.usage[pf.relPath]) {
      graph.usage[pf.relPath] = { count: 0, by: [] };
    }

    // Process imports to calculate usage
    const dir = path.dirname(pf.relPath);
    const imports = pf.parsed.imports || [];

    imports.forEach(imp => {
      if (imp.startsWith('.') || imp.startsWith('@/')) {
        let targetPath = imp;
        if (targetPath.startsWith('@/')) {
          targetPath = targetPath.replace(/^@\//, './');
        }

        let resolved = path.join(dir, targetPath).replace(/\\/g, '/');
        if (resolved.startsWith('./')) resolved = resolved.substring(2);

        // Optimized check: Direct O(1) checks first
        let matchedFile = null;
        if (fileMap.has(resolved)) {
           matchedFile = resolved;
        } else if (fileMap.has(`${resolved}.js`)) {
           matchedFile = `${resolved}.js`;
        } else if (fileMap.has(`${resolved}.ts`)) {
           matchedFile = `${resolved}.ts`;
        } else if (fileMap.has(`${resolved}.jsx`)) {
           matchedFile = `${resolved}.jsx`;
        } else if (fileMap.has(`${resolved}.tsx`)) {
           matchedFile = `${resolved}.tsx`;
        } else if (fileMap.has(`${resolved}/index.js`)) {
           matchedFile = `${resolved}/index.js`;
        } else if (fileMap.has(`${resolved}/index.ts`)) {
           matchedFile = `${resolved}/index.ts`;
        } else {
           // Fallback to array scan for partial matches (much rarer now)
           for (let i = 0; i < allKeys.length; i++) {
             const key = allKeys[i];
             if (key.startsWith(resolved + '.') || key.startsWith(resolved + '/index.')) {
               matchedFile = key;
               break;
             }
           }
        }

        if (matchedFile) {
          if (!graph.usage[matchedFile]) {
             graph.usage[matchedFile] = { count: 0, by: [] };
          }
          graph.usage[matchedFile].count++;
          graph.usage[matchedFile].by.push(pf.relPath);
        }
      }
    });
  });

  // Detect Dead Code (excluding config/meta files that are used by tools, not imports)
  const CONFIG_FILE_PATTERNS = [
    /^package\.json$/i, /^package-lock\.json$/i, /^yarn\.lock$/i, /^pnpm-lock\.yaml$/i,
    /^tsconfig[^/]*\.json$/i, /^jsconfig[^/]*\.json$/i,
    /\.config\.(js|ts|mjs|cjs)$/i, /\.config\.(json|yaml|yml|toml)$/i,
    /^\.env/i, /^\.gitignore$/i, /^\.npmignore$/i, /^\.eslintrc/i, /^\.prettierrc/i, /^\.babelrc/i,
    /^README/i, /^LICENSE/i, /^CHANGELOG/i, /^CONTRIBUTING/i, /^CODE_OF_CONDUCT/i,
    /^Dockerfile/i, /^docker-compose/i, /^Makefile$/i, /^Procfile$/i,
    /^jest\.config/i, /^vitest\.config/i, /^webpack\.config/i, /^rollup\.config/i,
    /^postcss\.config/i, /^tailwind\.config/i, /^vite\.config/i, /^next\.config/i,
    /^nuxt\.config/i, /^svelte\.config/i, /^angular\.json$/i,
    /^PROJECT_STRUCTURE/i, /^AI_CONTEXT/i, /^AI_PROMPT/i,
    /\.lock$/i, /\.db$/i, /\.db-shm$/i, /\.db-wal$/i,
    /^manifest\.json$/i, /^\.browserslistrc$/i,
  ];

  function isConfigFile(relPath) {
    const baseName = path.basename(relPath);
    return CONFIG_FILE_PATTERNS.some(p => p.test(baseName));
  }

  parsedFiles.forEach(pf => {
    const usage = graph.usage[pf.relPath];
    if (usage && usage.count === 0 && !pf.relPath.includes('index.') && !pf.relPath.includes('main.') && !pf.relPath.includes('app.') && !isConfigFile(pf.relPath)) {
      graph.deadCode.files.push(pf.relPath);
      if (pf.parsed.components && pf.parsed.components.length > 0) {
        graph.deadCode.components.push(...pf.parsed.components.map(c => `${pf.relPath}::${c}`));
      }
    }
  });

  // Detect Circular Dependencies (DFS)
  const visited = new Set();
  const recursionStack = new Set();
  const pathMap = new Map();

  function detectCycle(node, currentPath = []) {
    visited.add(node);
    recursionStack.add(node);
    pathMap.set(node, [...currentPath, node]);

    const imports = graph.imports[node] || [];

    const dir = path.dirname(node);
    imports.forEach(imp => {
      if (imp.startsWith('.') || imp.startsWith('@/')) {
        let targetPath = imp;
        if (targetPath.startsWith('@/')) {
          targetPath = targetPath.replace(/^@\//, './');
        }
        let resolved = path.join(dir, targetPath).replace(/\\/g, '/');
        if (resolved.startsWith('./')) resolved = resolved.substring(2);

        // Optimized check
        let matchedFile = null;
        if (fileMap.has(resolved)) {
           matchedFile = resolved;
        } else if (fileMap.has(`${resolved}.js`)) {
           matchedFile = `${resolved}.js`;
        } else if (fileMap.has(`${resolved}.ts`)) {
           matchedFile = `${resolved}.ts`;
        } else if (fileMap.has(`${resolved}.jsx`)) {
           matchedFile = `${resolved}.jsx`;
        } else if (fileMap.has(`${resolved}.tsx`)) {
           matchedFile = `${resolved}.tsx`;
        } else if (fileMap.has(`${resolved}/index.js`)) {
           matchedFile = `${resolved}/index.js`;
        } else if (fileMap.has(`${resolved}/index.ts`)) {
           matchedFile = `${resolved}/index.ts`;
        } else {
           for (let i = 0; i < allKeys.length; i++) {
             const key = allKeys[i];
             if (key.startsWith(resolved + '.') || key.startsWith(resolved + '/index.')) {
               matchedFile = key;
               break;
             }
           }
        }

        if (matchedFile) {
          if (!visited.has(matchedFile)) {
            detectCycle(matchedFile, pathMap.get(node));
          } else if (recursionStack.has(matchedFile)) {
            // Cycle detected
            const cyclePath = [...pathMap.get(node), matchedFile];
            // Extract just the cycle part
            const startIndex = cyclePath.indexOf(matchedFile);
            const pureCycle = cyclePath.slice(startIndex);
            graph.circular.push(pureCycle.join(' -> '));
          }
        }
      }
    });

    recursionStack.delete(node);
  }

  for (const node of Object.keys(graph.imports)) {
    if (!visited.has(node)) {
      detectCycle(node);
    }
  }

  // Deduplicate circular paths (rough approach)
  graph.circular = [...new Set(graph.circular)];

  return graph;
}

module.exports = {
  parseFile,
  buildArchitectureGraph,
};
