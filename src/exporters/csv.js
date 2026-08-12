'use strict';

/* CSV and TSV exporters have been commented out per project requirements.
const path = require('path');

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

function escapeCSV(value) {
  const str = String(value === undefined || value === null ? '' : value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

const HEADERS = ['path', 'name', 'type', 'extension', 'size', 'depth', 'lines', 'binary', 'sensitive', 'symlink'];

function toCsv(tree, stats = {}, rootDir = '') {
  const rows = flattenTree(tree, rootDir || (tree.path || '.'));
  const lines = [HEADERS.join(',')];

  for (const row of rows) {
    const values = HEADERS.map(h => escapeCSV(row[h]));
    lines.push(values.join(','));
  }

  return lines.join('\n') + '\n';
}

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
*/

function toCsv() { return ''; }
function toTsv() { return ''; }
function flattenTree() { return []; }
const HEADERS = [];

module.exports = { toCsv, toTsv, flattenTree, HEADERS };
