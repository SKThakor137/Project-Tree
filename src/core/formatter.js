/**
 * Formats directory trees into plain text and colorized terminal outputs with aligned summaries.
 */
'use strict';

const path = require('path');
const { loadTheme, PRESETS: THEMES } = require('./themeEngine.js');
const { createIconResolver, BUILT_IN_ICONS: FILE_ICONS, DIR_ICON } = require('./iconEngine.js');

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
 * @param {Object} [options]
 * @returns {string}
 */
function getIcon(node, options = {}) {
  const resolver = createIconResolver(options.icons || null);
  return resolver.getIcon(node);
}

/**
 * Build the display name for a node.
 * @param {ScanNode} node
 * @param {Object} opts
 * @returns {string}
 */
function renderName(node, opts = {}) {
  const { theme = 'unicode', details = false, includeSummary = true, icons = null } = opts;
  if (node.isSensitive) return `${node.name} (hidden)`;

  const useIcons = icons !== null ? icons : theme === 'emoji';
  const iconStr = useIcons ? getIcon(node, { icons }) : '';
  let name = `${iconStr}${node.name}`;

  if (node.isSymlink && node.symlinkTarget) name += ` → ${node.symlinkTarget}`;
  if (node.collapsed) name += ` (${node.collapsedCount} files)`;
  if (node.isEmpty && node.children !== undefined) name += ' [empty]';
  if (node.gitStatus) name += ` [${node.gitStatus}]`;

  const metaParts = [];

  if (details && !node.children && node.size !== undefined) {
    metaParts.push(formatSize(node.size));
    if (node.lineCount) metaParts.push(`${node.lineCount} lines`);
  }

  if (node.permissions) metaParts.push(node.permissions);
  if (node.owner) metaParts.push(`owner:${node.owner}`);
  if (node.modified) metaParts.push(`mod:${node.modified}`);
  if (node.created) metaParts.push(`created:${node.created}`);
  if (node.hash) metaParts.push(`hash:${node.hash.slice(0, 8)}`);

  if (metaParts.length > 0) {
    name += ` (${metaParts.join(', ')})`;
  }

  if (includeSummary && node.summary) {
    name += `   # ${node.summary}`;
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
  const t = loadTheme(theme);
  const lines = [];

  const connector = isRoot ? '' : (isLast ? `${t.last}${t.dash} ` : `${t.tee}${t.dash} `);
  const baseLine = `${prefix}${connector}${renderName(node, { ...options, includeSummary: false })}`;

  let line = baseLine;
  if (node.summary) {
    const padLen = Math.max(3, 40 - baseLine.length);
    line += ' '.repeat(padLen) + `# ${node.summary}`;
  }
  lines.push(line);

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
  const t = loadTheme(theme);
  const lines = [];

  const connector = isRoot
    ? ''
    : isLast
      ? `${G}${t.last}${t.dash} ${R}`
      : `${G}${t.tee}${t.dash} ${R}`;

  // Re-colorize the pipe characters in prefix
  const pipeRegex = t.pipe ? new RegExp(t.pipe.replace(/[|\\]/g, '\\$&'), 'g') : /\|/g;
  const coloredPrefix = prefix.replace(pipeRegex, `${G}${t.pipe}${R}`);

  const baseName = renderName(node, { ...options, includeSummary: false });
  const rawLineLength = `${prefix}${isRoot ? '' : (isLast ? `${t.last}${t.dash} ` : `${t.tee}${t.dash} `)}${baseName}`.length;

  let summaryStr = '';
  if (node.summary) {
    const padLen = Math.max(3, 40 - rawLineLength);
    summaryStr = ' '.repeat(padLen) + `${G}# ${node.summary}${R}`;
  }

  let nameStr;
  if (node.isSensitive) {
    nameStr = `${Y}${node.name} (hidden)${R}`;
  } else if (isRoot) {
    nameStr = `${BB}${baseName}${R}`;
  } else if (node.children !== undefined) {
    nameStr = `${B}${baseName}${R}`;
  } else if (node.isSymlink) {
    nameStr = `${C}${baseName}${R}`;
  } else {
    nameStr = `${W}${baseName}${R}`;
  }

  lines.push(`${coloredPrefix}${connector}${nameStr}${summaryStr}`);

  if (node.children && node.children.length && !node.collapsed) {
    const childPrefix = isRoot ? '' : prefix + (isLast ? t.indent : `${t.pipe}   `);
    node.children.forEach((child, i) =>
      lines.push(buildColoredTreeText(child, options, childPrefix, i === node.children.length - 1, false)));
  }
  return lines.join('\n');
}

module.exports = { buildTreeText, buildColoredTreeText, formatSize, getIcon, renderName, THEMES, FILE_ICONS };

