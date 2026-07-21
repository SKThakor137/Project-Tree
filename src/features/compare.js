'use strict';

const fs = require('fs');
const path = require('path');
const { scan } = require('../core/scanner.js');
const { buildTreeText } = require('../core/formatter.js');
const { toJson, nodeToJson } = require('../exporters/json.js');

/**
 * Compare two directory trees (or two JSON snapshots) and return diff.
 * Usage: project-tree-md compare <pathA> <pathB>
 *
 * @param {string} pathA
 * @param {string} pathB
 * @param {Object} [scanOptions]
 * @returns {{ added: string[], removed: string[], summary: string }}
 */
function compare(pathA, pathB, scanOptions = {}) {
  const setA = collectPaths(loadTree(pathA, scanOptions));
  const setB = collectPaths(loadTree(pathB, scanOptions));

  const added = [...setB].filter(p => !setA.has(p));
  const removed = [...setA].filter(p => !setB.has(p));

  const lines = [];
  lines.push(`Comparison: ${path.basename(pathA)} vs ${path.basename(pathB)}`);
  lines.push('');

  if (added.length > 0) {
    lines.push(`✅ Added (${added.length}):`);
    added.forEach(p => lines.push(`  + ${p}`));
    lines.push('');
  }

  if (removed.length > 0) {
    lines.push(`❌ Removed (${removed.length}):`);
    removed.forEach(p => lines.push(`  - ${p}`));
    lines.push('');
  }

  if (added.length === 0 && removed.length === 0) {
    lines.push('No differences found.');
  } else {
    lines.push(`Summary: ${added.length} added, ${removed.length} removed`);
  }

  return { added, removed, summary: lines.join('\n') };
}

/**
 * Load a tree from either a directory path or a JSON snapshot file.
 * @param {string} p
 * @param {Object} scanOptions
 * @returns {Object} tree node
 */
function loadTree(p, scanOptions) {
  const abs = path.resolve(p);
  if (fs.existsSync(abs)) {
    const stat = fs.lstatSync(abs);
    if (stat.isFile() && abs.endsWith('.json')) {
      const data = JSON.parse(fs.readFileSync(abs, 'utf8'));
      return data.tree || data;
    }
    if (stat.isDirectory()) {
      return scan(abs, scanOptions) || { name: path.basename(abs), children: [] };
    }
  }
  throw new Error(`Cannot load tree from: ${p}`);
}

/**
 * Recursively collect all relative paths from a tree node.
 * @param {Object} node
 * @param {string} prefix
 * @returns {Set<string>}
 */
function collectPaths(node, prefix = '') {
  const set = new Set();
  const current = prefix ? `${prefix}/${node.name}` : node.name;
  set.add(current);

  const children = node.children || [];
  for (const child of children) {
    collectPaths(child, current).forEach(p => set.add(p));
  }
  return set;
}

module.exports = { compare, loadTree, collectPaths };
