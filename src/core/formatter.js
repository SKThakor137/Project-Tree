'use strict';

const path = require('path');

/** @typedef {import('./scanner').ScanNode} ScanNode */

// ─── Theme definitions ────────────────────────────────────────────────────────

const THEMES = {
  unicode: { pipe: '│', tee: '├', last: '└', dash: '──', indent: '    ' },
  ascii:   { pipe: '|', tee: '+', last: '\\', dash: '--', indent: '    ' },
  box:     { pipe: '┃', tee: '┣', last: '┗', dash: '━━', indent: '    ' },
  emoji:   { pipe: '│', tee: '├', last: '└', dash: '──', indent: '    ' },
  compact: { pipe: '│', tee: '├', last: '└', dash: '──', indent: '    ' },
};

// ─── File icons (emoji theme) ─────────────────────────────────────────────────

const FILE_ICONS = {
  '.js': '📄', '.mjs': '📄', '.cjs': '📄',
  '.ts': '📘', '.tsx': '⚛️ ', '.jsx': '⚛️ ',
  '.json': '📋', '.jsonc': '📋',
  '.md': '📝', '.mdx': '📝',
  '.css': '🎨', '.scss': '🎨', '.sass': '🎨', '.less': '🎨',
  '.html': '🌐', '.htm': '🌐',
  '.svg': '🖼️ ', '.png': '🖼️ ', '.jpg': '🖼️ ', '.jpeg': '🖼️ ', '.gif': '🖼️ ', '.webp': '🖼️ ',
  '.env': '🔐', '.gitignore': '🙈',
  '.yml': '⚙️ ', '.yaml': '⚙️ ',
  '.sh': '💻', '.bash': '💻', '.zsh': '💻', '.ps1': '💻',
  '.py': '🐍', '.go': '🐹', '.rs': '🦀', '.java': '☕',
  '.prisma': '🔷', '.graphql': '📡', '.gql': '📡',
  '.toml': '⚙️ ', '.lock': '🔒',
  default: '📄',
};
const DIR_ICON = '📁';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format bytes to human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
function formatSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get an emoji icon for a node.
 * @param {ScanNode} node
 * @returns {string}
 */
function getIcon(node) {
  if (node.children !== undefined) return `${DIR_ICON} `;
  const icon = FILE_ICONS[node.ext || ''] || FILE_ICONS.default;
  return `${icon} `;
}

/**
 * Build the display name for a node.
 * @param {ScanNode} node
 * @param {Object} opts
 * @param {string}  [opts.theme]
 * @param {boolean} [opts.details]
 * @returns {string}
 */
function renderName(node, { theme = 'unicode', details = false } = {}) {
  if (node.isSensitive) return `${node.name} (hidden)`;

  let name = theme === 'emoji' ? `${getIcon(node)}${node.name}` : node.name;

  if (node.isSymlink && node.symlinkTarget) name += ` → ${node.symlinkTarget}`;
  if (node.collapsed) name += ` (${node.collapsedCount} files)`;
  if (node.isEmpty && node.children !== undefined) name += ' [empty]';

  if (details && !node.children && node.size !== undefined) {
    const parts = [formatSize(node.size)];
    if (node.ext) parts.push(node.ext);
    name += ` (${parts.join(', ')})`;
  }
  return name;
}

// ─── Plain text tree ──────────────────────────────────────────────────────────

/**
 * Recursively build a plain ASCII/unicode tree string.
 * @param {ScanNode} node
 * @param {Object}   [options]
 * @param {string}   [prefix]
 * @param {boolean}  [isLast]
 * @param {boolean}  [isRoot]
 * @returns {string}
 */
function buildTreeText(node, options = {}, prefix = '', isLast = true, isRoot = true) {
  if (!node) return '';
  const { theme = 'unicode', details = false } = options;
  const t = THEMES[theme] || THEMES.unicode;
  const lines = [];

  const connector = isRoot ? '' : (isLast ? `${t.last}${t.dash} ` : `${t.tee}${t.dash} `);
  lines.push(`${prefix}${connector}${renderName(node, { theme, details })}`);

  if (node.children && node.children.length && !node.collapsed) {
    const childPrefix = isRoot ? '' : prefix + (isLast ? t.indent : `${t.pipe}   `);
    node.children.forEach((child, i) =>
      lines.push(buildTreeText(child, options, childPrefix, i === node.children.length - 1, false)));
  }
  return lines.join('\n');
}

// ─── Colored tree ─────────────────────────────────────────────────────────────

const R  = '\x1b[0m';   // reset
const G  = '\x1b[90m';  // gray
const B  = '\x1b[34m';  // blue (dir)
const BB = '\x1b[1;34m';// bold blue (root)
const W  = '\x1b[37m';  // white (file)
const Y  = '\x1b[33m';  // yellow (sensitive)
const C  = '\x1b[36m';  // cyan (symlink)

/**
 * Recursively build a colorized tree string for terminal output.
 * @param {ScanNode} node
 * @param {Object}   [options]
 * @param {string}   [prefix]
 * @param {boolean}  [isLast]
 * @param {boolean}  [isRoot]
 * @returns {string}
 */
function buildColoredTreeText(node, options = {}, prefix = '', isLast = true, isRoot = true) {
  if (!node) return '';
  const { theme = 'unicode', details = false } = options;
  const t = THEMES[theme] || THEMES.unicode;
  const lines = [];

  const connector = isRoot
    ? ''
    : isLast
      ? `${G}${t.last}${t.dash} ${R}`
      : `${G}${t.tee}${t.dash} ${R}`;

  // Re-colorize the pipe characters in prefix
  const coloredPrefix = prefix.replace(
    new RegExp(t.pipe.replace(/[|\\]/g, '\\$&'), 'g'),
    `${G}${t.pipe}${R}`
  );

  let nameStr;
  if (node.isSensitive) {
    nameStr = `${Y}${node.name} (hidden)${R}`;
  } else if (isRoot) {
    nameStr = `${BB}${renderName(node, { theme, details })}${R}`;
  } else if (node.children !== undefined) {
    nameStr = `${B}${renderName(node, { theme, details })}${R}`;
  } else if (node.isSymlink) {
    nameStr = `${C}${renderName(node, { theme, details })}${R}`;
  } else {
    nameStr = `${W}${renderName(node, { theme, details })}${R}`;
  }

  lines.push(`${coloredPrefix}${connector}${nameStr}`);

  if (node.children && node.children.length && !node.collapsed) {
    const childPrefix = isRoot ? '' : prefix + (isLast ? t.indent : `${t.pipe}   `);
    node.children.forEach((child, i) =>
      lines.push(buildColoredTreeText(child, options, childPrefix, i === node.children.length - 1, false)));
  }
  return lines.join('\n');
}

module.exports = { buildTreeText, buildColoredTreeText, formatSize, getIcon, renderName, THEMES };
