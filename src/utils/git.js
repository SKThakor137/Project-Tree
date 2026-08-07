/**
 * Git Utilities Module
 *
 * Provides git repository detection, status checking, and change filtering.
 * Zero external dependencies — uses Node child_process safely.
 */
'use strict';

const { execSync } = require('child_process');
const path = require('path');

/**
 * Get git status for a project directory.
 * Returns a map of normalized relative file paths -> git status code ('M', 'A', 'D', '?', etc.)
 *
 * @param {string} rootDir
 * @returns {Record<string, string>}
 */
function getGitStatus(rootDir) {
  const statusMap = {};
  try {
    const output = execSync('git status --porcelain -u', {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 5000,
    });

    const lines = output.split(/\r?\n/);
    for (const line of lines) {
      if (!line || line.length < 4) continue;
      const x = line[0];
      const y = line[1];
      let statusCode = (x !== ' ' && x !== '?') ? x : y;
      if (x === '?' && y === '?') statusCode = '?';

      let filePath = line.substring(3).trim();
      // Handle renamed files "old -> new"
      if (filePath.includes(' -> ')) {
        filePath = filePath.split(' -> ')[1].trim();
      }
      // Normalize slashes
      filePath = filePath.replace(/\\/g, '/');
      statusMap[filePath] = statusCode;
    }
  } catch (_) {
    // Return empty status map if git is unavailable or not a repository
  }
  return statusMap;
}

/**
 * Check if a file or any of its descendants have git changes.
 *
 * @param {object} node - ScanNode
 * @param {Record<string, string>} gitStatusMap
 * @param {string} rootDir
 * @returns {boolean}
 */
function hasGitChanges(node, gitStatusMap, rootDir) {
  const relPath = path.relative(rootDir, node.path).replace(/\\/g, '/');
  if (gitStatusMap[relPath]) return true;

  if (node.children && Array.isArray(node.children)) {
    return node.children.some(child => hasGitChanges(child, gitStatusMap, rootDir));
  }
  return false;
}

/**
 * Filter tree node hierarchy to include only changed files and their parent directories.
 *
 * @param {object} node - ScanNode
 * @param {Record<string, string>} gitStatusMap
 * @param {string} rootDir
 * @returns {object|null}
 */
function filterTreeByChanged(node, gitStatusMap, rootDir) {
  if (!node) return null;
  const relPath = path.relative(rootDir, node.path).replace(/\\/g, '/');

  if (!node.children) {
    // Leaf node: keep if it has a git status
    return gitStatusMap[relPath] ? node : null;
  }

  // Directory node: keep matching children
  const filteredChildren = node.children
    .map(child => filterTreeByChanged(child, gitStatusMap, rootDir))
    .filter(Boolean);

  if (filteredChildren.length > 0 || gitStatusMap[relPath]) {
    return { ...node, children: filteredChildren };
  }

  return null;
}

module.exports = {
  getGitStatus,
  hasGitChanges,
  filterTreeByChanged,
};
