'use strict';

/**
 * Duplicate file detector — finds files with identical names or identical content.
 *
 * Modes:
 *   name  — duplicates by filename (default)
 *   hash  — duplicates by content hash (requires crypto)
 *
 * Zero dependencies.
 */

const { hashFileSync } = require('../utils/hasher.js');

/**
 * @typedef {Object} DuplicateGroup
 * @property {string}   key     — filename or hash
 * @property {number}   count   — number of duplicates
 * @property {string[]} paths   — list of file paths
 * @property {number}   [size]  — file size (if available)
 */

/**
 * Collect all file nodes from a tree recursively.
 *
 * @param {Object} node — ScanNode
 * @param {Object[]} [files=[]]
 * @returns {Object[]}
 */
function collectFiles(node, files = []) {
  if (!node) return files;
  if (!node.children) {
    files.push(node);
  } else {
    for (const child of node.children) {
      collectFiles(child, files);
    }
  }
  return files;
}

/**
 * Find duplicate files in a tree by filename.
 *
 * @param {Object} tree — ScanNode root
 * @returns {DuplicateGroup[]}
 */
function findDuplicatesByName(tree) {
  const files = collectFiles(tree);
  const nameMap = new Map();

  for (const file of files) {
    const name = file.name;
    if (!nameMap.has(name)) {
      nameMap.set(name, []);
    }
    nameMap.get(name).push(file.path);
  }

  /** @type {DuplicateGroup[]} */
  const duplicates = [];
  for (const [name, paths] of nameMap) {
    if (paths.length > 1) {
      duplicates.push({ key: name, count: paths.length, paths });
    }
  }

  // Sort by count descending
  duplicates.sort((a, b) => b.count - a.count);
  return duplicates;
}

/**
 * Find duplicate files in a tree by content hash.
 *
 * @param {Object} tree — ScanNode root
 * @param {string} [algorithm='sha256'] — hash algorithm
 * @param {number} [maxSize=5242880] — skip files larger than 5 MB
 * @returns {DuplicateGroup[]}
 */
function findDuplicatesByHash(tree, algorithm = 'sha256', maxSize = 5 * 1024 * 1024) {
  const files = collectFiles(tree);
  const hashMap = new Map();

  for (const file of files) {
    if (file.isBinary || file.isSensitive) continue;
    if (file.size && file.size > maxSize) continue;

    const hash = hashFileSync(file.path, algorithm, maxSize);
    if (!hash) continue;

    if (!hashMap.has(hash)) {
      hashMap.set(hash, { paths: [], size: file.size || 0 });
    }
    hashMap.get(hash).paths.push(file.path);
  }

  /** @type {DuplicateGroup[]} */
  const duplicates = [];
  for (const [hash, { paths, size }] of hashMap) {
    if (paths.length > 1) {
      duplicates.push({ key: hash.slice(0, 12), count: paths.length, paths, size });
    }
  }

  duplicates.sort((a, b) => b.count - a.count);
  return duplicates;
}

/**
 * Format a duplicate report as a readable string.
 *
 * @param {DuplicateGroup[]} groups
 * @param {string} [mode='name'] — 'name' or 'hash'
 * @returns {string}
 */
function formatDuplicateReport(groups, mode = 'name') {
  if (groups.length === 0) {
    return '  No duplicate files found.';
  }

  const lines = [];
  const header = mode === 'hash' ? 'Duplicate Files (by content)' : 'Duplicate Files (by name)';
  lines.push(`  ${header}`);
  lines.push('  ' + '─'.repeat(48));

  for (const group of groups.slice(0, 20)) {
    const label = mode === 'hash' ? `[${group.key}]` : group.key;
    lines.push(`  ${label}  (${group.count} copies)`);
    for (const p of group.paths) {
      lines.push(`    → ${p}`);
    }
  }

  if (groups.length > 20) {
    lines.push(`  ... and ${groups.length - 20} more groups`);
  }

  const totalDuplicateFiles = groups.reduce((sum, g) => sum + g.count - 1, 0);
  lines.push('  ' + '─'.repeat(48));
  lines.push(`  Total: ${groups.length} groups, ${totalDuplicateFiles} extra copies`);

  return lines.join('\n');
}

module.exports = { findDuplicatesByName, findDuplicatesByHash, formatDuplicateReport, collectFiles };
