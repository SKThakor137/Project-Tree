'use strict';

const path = require('path');
const { formatSize } = require('./formatter.js');

/** @typedef {import('./scanner').ScanNode} ScanNode */

// ─── Language map (ext → display name) ───────────────────────────────────────

const LANGUAGE_MAP = {
  '.ts': 'TypeScript', '.tsx': 'TypeScript',
  '.js': 'JavaScript', '.jsx': 'JavaScript', '.mjs': 'JavaScript', '.cjs': 'JavaScript',
  '.json': 'JSON', '.jsonc': 'JSON',
  '.md': 'Markdown', '.mdx': 'Markdown',
  '.css': 'CSS', '.scss': 'SCSS', '.sass': 'SASS', '.less': 'LESS',
  '.html': 'HTML', '.htm': 'HTML',
  '.py': 'Python',
  '.go': 'Go',
  '.rs': 'Rust',
  '.java': 'Java',
  '.kt': 'Kotlin',
  '.swift': 'Swift',
  '.php': 'PHP',
  '.rb': 'Ruby',
  '.sh': 'Shell', '.bash': 'Shell', '.zsh': 'Shell', '.fish': 'Shell',
  '.ps1': 'PowerShell',
  '.yml': 'YAML', '.yaml': 'YAML',
  '.toml': 'TOML',
  '.xml': 'XML',
  '.sql': 'SQL',
  '.graphql': 'GraphQL', '.gql': 'GraphQL',
  '.prisma': 'Prisma',
  '.vue': 'Vue',
  '.svelte': 'Svelte',
  '.astro': 'Astro',
  '.lock': 'Lockfile',
  '.txt': 'Text',
  '.csv': 'CSV',
  '.env': 'Env',
};

// ─── Core stats computation ───────────────────────────────────────────────────

/**
 * Recursively sum file sizes under a node.
 * @param {ScanNode} node
 * @returns {number}
 */
function getDirSize(node) {
  if (!node.children) return node.size || 0;
  return node.children.reduce((sum, c) => sum + getDirSize(c), 0);
}

/**
 * Compute comprehensive statistics from a scan tree.
 * @param {ScanNode} root
 * @returns {Object}
 */
function computeStats(root) {
  let dirs = 0, files = 0, totalSize = 0;
  let largestFile = null;
  let maxDepth = 0, totalDepth = 0, fileCount = 0;
  const extCount = {}, langCount = {};
  const dirSizes = [];

  function traverse(node, depth) {
    if (depth > 0) {
      if (node.children !== undefined) {
        dirs++;
        dirSizes.push({ name: node.path || node.name, size: getDirSize(node) });
      } else {
        files++;
        const size = node.size || 0;
        totalSize += size;
        totalDepth += depth;
        fileCount++;
        if (depth > maxDepth) maxDepth = depth;
        if (!largestFile || size > largestFile.size) {
          largestFile = { name: node.name, path: node.path, size };
        }
        const ext = node.ext || '(no ext)';
        extCount[ext] = (extCount[ext] || 0) + 1;
        const lang = LANGUAGE_MAP[ext] || 'Other';
        langCount[lang] = (langCount[lang] || 0) + 1;
      }
    }
    if (node.children) {
      node.children.forEach(child => traverse(child, depth + 1));
    }
  }

  traverse(root, 0);

  const langTotal = Object.values(langCount).reduce((a, b) => a + b, 0);
  const languageBreakdown = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => ({
      lang,
      count,
      pct: langTotal > 0 ? Math.round((count / langTotal) * 100) : 0,
    }));

  const extensionBreakdown = Object.entries(extCount)
    .sort((a, b) => b[1] - a[1])
    .map(([ext, count]) => ({ ext, count }));

  const largestFolders = dirSizes
    .sort((a, b) => b.size - a.size)
    .slice(0, 5)
    .map(d => ({ name: path.basename(d.name), size: d.size }));

  const avgDepth = fileCount > 0 ? (totalDepth / fileCount).toFixed(1) : '0';

  const statsText = `${dirs === 1 ? '1 directory' : `${dirs} directories`}, ${files === 1 ? '1 file' : `${files} files`}`;

  return {
    dirs,
    files,
    totalSize,
    totalSizeText: formatSize(totalSize),
    largestFile,
    maxDepth,
    avgDepth,
    languageBreakdown,
    extensionBreakdown,
    largestFolders,
    statsText,
  };
}

// ─── Terminal dashboard ───────────────────────────────────────────────────────

/**
 * Print a rich stats dashboard to the terminal.
 * @param {Object} stats - output of computeStats()
 */
function printDashboard(stats) {
  const { c, isColorEnabled, divider } = require('../utils/colors.js');
  const W = 54;

  console.log(`\n${c.bold}${c.cyan}📊 Project Statistics${c.reset}`);
  divider(W);
  console.log(`  📁 Directories     ${c.bold}${stats.dirs}${c.reset}`);
  console.log(`  📄 Files           ${c.bold}${stats.files}${c.reset}`);
  console.log(`  💾 Total Size      ${c.bold}${stats.totalSizeText}${c.reset}`);
  if (stats.largestFile) {
    console.log(`  🏆 Largest File    ${c.bold}${stats.largestFile.name}${c.reset} (${formatSize(stats.largestFile.size)})`);
  }
  console.log(`  🌊 Max Depth       ${c.bold}${stats.maxDepth}${c.reset}`);
  console.log(`  📐 Avg Depth       ${c.bold}${stats.avgDepth}${c.reset}`);

  if (stats.languageBreakdown.length > 0) {
    console.log(`\n  ${c.bold}Language Breakdown${c.reset}`);
    stats.languageBreakdown.slice(0, 8).forEach(({ lang, count, pct }) => {
      const bars = '█'.repeat(Math.max(1, Math.round(pct / 4)));
      const label = lang.padEnd(16);
      if (isColorEnabled()) {
        console.log(`  ${c.cyan}${label}${c.reset} ${c.green}${bars.padEnd(25)}${c.reset} ${pct}% (${count})`);
      } else {
        console.log(`  ${label} ${'#'.repeat(Math.max(1, Math.round(pct / 4))).padEnd(25)} ${pct}% (${count})`);
      }
    });
  }

  if (stats.largestFolders.length > 0) {
    console.log(`\n  ${c.bold}Largest Folders${c.reset}`);
    stats.largestFolders.forEach(({ name, size }) => {
      console.log(`  ${c.blue}${name.padEnd(22)}${c.reset} ${formatSize(size)}`);
    });
  }

  if (stats.extensionBreakdown.length > 0) {
    const top5 = stats.extensionBreakdown.slice(0, 5).map(e => `${e.ext}(${e.count})`).join('  ');
    console.log(`\n  ${c.bold}Top Extensions${c.reset}  ${top5}`);
  }

  divider(W);
}

module.exports = { computeStats, getDirSize, printDashboard, LANGUAGE_MAP };
