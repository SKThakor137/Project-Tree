'use strict';

/**
 * CSV/TSV flat-table exporter for project trees.
 *
 * Exports each file/directory as a row with columns:
 *   path, name, type, extension, size, depth, lines
 *
 * Zero dependencies.
 */

const path = require('path');

/**
 * Flatten a tree into an array of row objects.
 *
 * @param {Object} node — ScanNode
 * @param {string} rootDir — root path for relative paths
 * @param {number} [depth=0]
 * @param {Object[]} [rows=[]]
 * @returns {Object[]}
 */
function flattenTree(node, rootDir, depth = 0, rows = []) {
  if (!node) return rows;

  const relPath = node.path
    ? path.relative(rootDir, node.path).replace(/\\/g, '/')
    : node.name;

  const isDir = node.children !== undefined;

  rows.push({
    path: relPath || '.',
    name: node.name,
    type: isDir ? 'directory' : 'file',
    extension: isDir ? '' : (node.ext || ''),
    size: isDir ? '' : (node.size || 0),
    depth,
    lines: node.lineCount || '',
    binary: node.isBinary ? 'yes' : 'no',
    sensitive: node.isSensitive ? 'yes' : 'no',
    symlink: node.isSymlink ? 'yes' : 'no',
  });

  if (node.children) {
    for (const child of node.children) {
      flattenTree(child, rootDir, depth + 1, rows);
    }
  }

  return rows;
}

/**
 * Escape a CSV field — quote if it contains commas, quotes, or newlines.
 *
 * @param {*} value
 * @returns {string}
 */
function escapeCSV(value) {
  const str = String(value === undefined || value === null ? '' : value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/** Column headers. */
const HEADERS = ['path', 'name', 'type', 'extension', 'size', 'depth', 'lines', 'binary', 'sensitive', 'symlink'];

/**
 * Export tree as CSV string.
 *
 * @param {Object} tree — ScanNode root
 * @param {Object} [stats] — optional stats object
 * @param {string} [rootDir] — root directory for relative paths
 * @returns {string}
 */
function toCsv(tree, stats = {}, rootDir = '') {
  const rows = flattenTree(tree, rootDir || (tree.path || '.'));
  const lines = [HEADERS.join(',')];

  for (const row of rows) {
    const values = HEADERS.map(h => escapeCSV(row[h]));
    lines.push(values.join(','));
  }

  return lines.join('\n') + '\n';
}

/**
 * Export tree as TSV (tab-separated) string.
 *
 * @param {Object} tree — ScanNode root
 * @param {Object} [stats]
 * @param {string} [rootDir]
 * @returns {string}
 */
function toTsv(tree, stats = {}, rootDir = '') {
  const rows = flattenTree(tree, rootDir || (tree.path || '.'));
  const lines = [HEADERS.join('\t')];

  for (const row of rows) {
    const values = HEADERS.map(h => {
      const val = String(row[h] === undefined || row[h] === null ? '' : row[h]);
      return val.replace(/\t/g, ' ');
    });
    lines.push(values.join('\t'));
  }

  return lines.join('\n') + '\n';
}

module.exports = { toCsv, toTsv, flattenTree, HEADERS };
