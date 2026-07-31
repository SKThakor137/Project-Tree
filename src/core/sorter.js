'use strict';

/**
 * Tree node sorter — multiple strategies for ordering directory entries.
 *
 * Sorting modes:
 *   alpha        — alphabetical (locale-aware)
 *   folders-first — directories before files, then alpha
 *   files-first  — files before directories, then alpha
 *   extension    — group by file extension, then alpha
 *   size         — by file size (smallest first)
 *   modified     — by last modified time (newest first)
 *   created      — by creation time (newest first)
 *   natural      — natural number-aware sorting (file2 < file10)
 *
 * Zero dependencies.
 */

/**
 * Natural sort comparator — handles numeric segments properly.
 * "file2.js" < "file10.js"
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function naturalCompare(a, b) {
  const ax = a.toLowerCase();
  const bx = b.toLowerCase();
  const aParts = ax.split(/(\d+)/);
  const bParts = bx.split(/(\d+)/);
  const len = Math.min(aParts.length, bParts.length);

  for (let i = 0; i < len; i++) {
    const ap = aParts[i];
    const bp = bParts[i];
    if (ap === bp) continue;

    const aNum = Number(ap);
    const bNum = Number(bp);

    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }

    return ap < bp ? -1 : 1;
  }

  return aParts.length - bParts.length;
}

/**
 * Check if a node is a directory.
 * @param {Object} node — ScanNode
 * @returns {boolean}
 */
function isDir(node) {
  return node.children !== undefined;
}

/**
 * Get the sort comparator for a given sort mode.
 *
 * @param {string} mode — one of the sort modes
 * @param {string} [order='asc'] — 'asc' or 'desc'
 * @returns {function(Object, Object): number}
 */
function getSortComparator(mode, order = 'asc') {
  const dir = order === 'desc' ? -1 : 1;

  switch (mode) {
    case 'alpha':
      return (a, b) => dir * a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

    case 'folders-first':
      return (a, b) => {
        const aDir = isDir(a);
        const bDir = isDir(b);
        if (aDir !== bDir) return aDir ? -1 : 1;
        return dir * a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true });
      };

    case 'files-first':
      return (a, b) => {
        const aDir = isDir(a);
        const bDir = isDir(b);
        if (aDir !== bDir) return aDir ? 1 : -1;
        return dir * a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true });
      };

    case 'extension':
      return (a, b) => {
        const aExt = (a.ext || '').toLowerCase();
        const bExt = (b.ext || '').toLowerCase();
        // Directories first, then group by extension
        const aDir = isDir(a);
        const bDir = isDir(b);
        if (aDir !== bDir) return aDir ? -1 : 1;
        if (aDir && bDir) return dir * a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        if (aExt !== bExt) return dir * aExt.localeCompare(bExt);
        return dir * a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      };

    case 'size':
      return (a, b) => {
        const aDir = isDir(a);
        const bDir = isDir(b);
        if (aDir !== bDir) return aDir ? -1 : 1;
        if (aDir && bDir) return dir * a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        return dir * ((a.size || 0) - (b.size || 0));
      };

    case 'modified':
      return (a, b) => {
        const aTime = a.modifiedMs || 0;
        const bTime = b.modifiedMs || 0;
        if (aTime !== bTime) return dir * (bTime - aTime); // newest first by default
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      };

    case 'created':
      return (a, b) => {
        const aTime = a.createdMs || 0;
        const bTime = b.createdMs || 0;
        if (aTime !== bTime) return dir * (bTime - aTime); // newest first by default
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      };

    case 'natural':
      return (a, b) => {
        const aDir = isDir(a);
        const bDir = isDir(b);
        if (aDir !== bDir) return aDir ? -1 : 1;
        return dir * naturalCompare(a.name, b.name);
      };

    default:
      // Fallback to locale sort (existing behavior)
      return (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true });
  }
}

/**
 * Sort a tree's children recursively using the given mode.
 *
 * @param {Object} node — ScanNode (root of tree or subtree)
 * @param {string} mode — sort mode
 * @param {string} [order='asc'] — 'asc' or 'desc'
 * @returns {Object} — the same node, mutated in place
 */
function sortTree(node, mode, order = 'asc') {
  if (!node || !node.children || node.children.length === 0) return node;

  const comparator = getSortComparator(mode, order);
  node.children.sort(comparator);

  for (const child of node.children) {
    if (child.children) {
      sortTree(child, mode, order);
    }
  }

  return node;
}

/** List of valid sort modes for validation. */
const SORT_MODES = ['alpha', 'folders-first', 'files-first', 'extension', 'size', 'modified', 'created', 'natural'];

module.exports = { sortTree, getSortComparator, naturalCompare, SORT_MODES };
