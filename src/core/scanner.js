/**
 * Directory tree scanner module for building project hierarchy nodes.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { isSensitive } = require('../utils/sensitive.js');
const { extractFileSummary } = require('../features/summarize.js');
const { parseFile } = require('./analyzer.js');
const { sortTree } = require('./sorter.js');
const { hashFileSync } = require('../utils/hasher.js');

/** Default exclusion pattern (kept for backward compatibility). */
const DEFAULT_EXCLUDE = /node_modules|\.next|\.git|dist|build|coverage|\.turbo|venv|\.venv|__pycache__|\.dart_tool|\.cache|\.pytest_cache|\.idea|\.vscode/;

/** Binary file extensions — skipped unless --include-binary. */
const BINARY_EXTENSIONS = new Set([
  '.png','.jpg','.jpeg','.gif','.webp','.ico','.bmp','.tiff',
  '.zip','.tar','.gz','.rar','.7z','.exe','.dll','.so','.dylib','.lib',
  '.pdf','.mp4','.mov','.mp3','.wav','.avi','.mkv','.flac','.ogg',
  '.woff','.woff2','.ttf','.eot','.otf',
  '.pyc','.class','.o','.a','.pdb',
  '.db','.sqlite','.sqlite3',
]);

/**
 * @typedef {Object} ScanNode
 * @property {string}      name
 * @property {string}      path
 * @property {boolean}     isSymlink
 * @property {boolean}     isEmpty
 * @property {boolean}     isSensitive
 * @property {boolean}     isBinary
 * @property {number}      [size]
 * @property {string}      [ext]
 * @property {string}      [symlinkTarget]
 * @property {string}      [summary]
 * @property {boolean}     [collapsed]
 * @property {number}      [collapsedCount]
 * @property {ScanNode[]}  [children]  — present for directories
 */

/**
 * Check if a file extension is binary.
 * @param {string} name
 * @returns {boolean}
 */
function isBinaryFile(name) {
  return BINARY_EXTENSIONS.has(path.extname(name).toLowerCase());
}

/**
 * Parse a human-readable size string (e.g. "5MB", "500KB") to bytes.
 * @param {string|number|undefined} sizeStr
 * @returns {number} bytes (Infinity if unspecified / invalid)
 */
function parseSize(sizeStr) {
  if (sizeStr === undefined || sizeStr === null) return Infinity;
  const s = String(sizeStr);
  const m = s.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)?$/i);
  if (!m) return Infinity;
  const multipliers = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 };
  return parseFloat(m[1]) * (multipliers[(m[2] || 'B').toUpperCase()] || 1);
}

/**
 * Compress single-child directory chains into combined names (a/b/c).
 * @param {ScanNode} node
 * @returns {ScanNode}
 */
function compressTree(node) {
  if (!node.children) return node;
  const compressedChildren = node.children.map(compressTree);
  if (
    compressedChildren.length === 1 &&
    compressedChildren[0].children !== undefined &&
    !compressedChildren[0].collapsed
  ) {
    const child = compressedChildren[0];
    return { ...child, name: `${node.name}/${child.name}`, children: child.children };
  }
  return { ...node, children: compressedChildren };
}

/**
 * Format file mode octal permissions to rwxr-xr-x format.
 * @param {number} mode
 * @returns {string}
 */
function formatPermissions(mode) {
  const octal = (mode & 0o777).toString(8).padStart(3, '0');
  const map = { '0': '---', '1': '--x', '2': '-w-', '3': '-wx', '4': 'r--', '5': 'r-x', '6': 'rw-', '7': 'rwx' };
  return octal.split('').map(c => map[c] || '---').join('');
}

/**
 * Scan a directory tree, returning a ScanNode hierarchy.
 *
 * @param {string} rootDir
 * @param {Object} [options]
 * @returns {ScanNode|null}
 */
function scan(rootDir, options = {}) {
  const {
    exclude           = DEFAULT_EXCLUDE,
    maxDepth          = Infinity,
    ignoreFn          = () => false,
    includeBinary     = false,
    showSensitive     = false,
    maxSize           = Infinity,
    compress          = false,
    collapseThreshold = null,
    summarize         = false,
    modified          = false,
    created           = false,
    permissions       = false,
    owner             = false,
    hash              = null,
    sort              = null,
    sortOrder         = 'asc',
    maxFiles          = Infinity,
    maxFolders        = Infinity,
    signal            = null,
  } = options;

  const absoluteRoot = path.resolve(rootDir);
  if (!fs.existsSync(absoluteRoot)) return null;

  const visitedInodes = new Set();
  let fileCountAcc = 0;
  let folderCountAcc = 0;

  function buildNode(itemPath, currentDepth) {
    if (signal && signal.aborted) {
      throw new Error('Scan aborted by AbortSignal');
    }

    const name = path.basename(itemPath);
    const normalizedPath = itemPath.replace(/\\/g, '/');

    // Hard exclude
    if (exclude && exclude.test(normalizedPath)) return null;

    // Gitignore / ignore file check
    const relPath = path.relative(absoluteRoot, itemPath).replace(/\\/g, '/');
    if (relPath && ignoreFn(relPath, false)) return null;

    // Sensitive file
    const sensitive = isSensitive(name);
    if (sensitive && !showSensitive) {
      return {
        name, path: itemPath,
        isSensitive: true, isSymlink: false, isEmpty: false, isBinary: false,
      };
    }

    let stat;
    try { stat = fs.lstatSync(itemPath); } catch (_) { return null; }

    // Cycle detection via inode
    if (stat.ino && stat.dev) {
      const inodeId = `${stat.dev}:${stat.ino}`;
      if (visitedInodes.has(inodeId)) {
        // Already visited (circular symlink)
        return {
          name: `${name} (circular link)`,
          path: itemPath,
          isSymlink: true,
          isEmpty: true,
          isSensitive: false,
          isBinary: false,
        };
      }
      visitedInodes.add(inodeId);
    }

    const isSymlink = stat.isSymbolicLink();
    let symlinkTarget;
    if (isSymlink) {
      try { symlinkTarget = fs.readlinkSync(itemPath); } catch (_) { symlinkTarget = '?'; }
    }

    // Common metadata
    const extraMeta = {};
    if (modified) {
      extraMeta.modified = stat.mtime ? stat.mtime.toISOString().slice(0, 10) : undefined;
      extraMeta.modifiedMs = stat.mtimeMs;
    }
    if (created) {
      extraMeta.created = stat.birthtime ? stat.birthtime.toISOString().slice(0, 10) : undefined;
      extraMeta.createdMs = stat.birthtimeMs;
    }
    if (permissions) {
      extraMeta.permissions = formatPermissions(stat.mode);
    }
    if (owner && stat.uid !== undefined) {
      extraMeta.owner = `${stat.uid}:${stat.gid}`;
    }

    // File node
    if (stat.isFile() || (isSymlink && !stat.isDirectory())) {
      if (fileCountAcc >= maxFiles) return null;
      const binary = isBinaryFile(name);
      if (binary && !includeBinary) return null;
      if (stat.size > maxSize) return null;

      fileCountAcc++;

      const fileNode = {
        name, path: itemPath, size: stat.size,
        ext: path.extname(name).toLowerCase(),
        isSymlink, symlinkTarget,
        isEmpty: false, isSensitive: false, isBinary: binary,
        ...extraMeta,
      };

      if (hash && !binary && stat.size < 5 * 1024 * 1024) {
        fileNode.hash = hashFileSync(itemPath, hash);
      }

      // Count lines for non-binary files under 1MB (for --details display)
      if (!binary && stat.size < 1024 * 1024) {
        try {
          const content = fs.readFileSync(itemPath, 'utf8');
          fileNode.lineCount = content.split('\n').length;

          if (options.architecture && stat.size < 500000) {
            fileNode.parsed = parseFile(content, itemPath);
            fileNode.relPath = path.relative(absoluteRoot, itemPath).replace(/\\/g, '/');
          }
        } catch (_) {}
      } else if (options.architecture && !binary && stat.size < 500000) {
        try {
          const content = fs.readFileSync(itemPath, 'utf8');
          fileNode.parsed = parseFile(content, itemPath);
          fileNode.relPath = path.relative(absoluteRoot, itemPath).replace(/\\/g, '/');
        } catch (_) {}
      }

      if (summarize && !binary) {
        const summary = extractFileSummary(itemPath);
        if (summary) fileNode.summary = summary;
      }
      return fileNode;
    }

    // Directory node
    if (stat.isDirectory() || isSymlink) {
      if (folderCountAcc >= maxFolders && currentDepth > 0) return null;
      if (currentDepth > 0) folderCountAcc++;

      const node = {
        name, path: itemPath, isSymlink, symlinkTarget,
        isEmpty: false, isSensitive: false, isBinary: false,
        ...extraMeta,
      };

      if (currentDepth >= maxDepth) {
        node.children = [];
        return node;
      }

      let entries;
      try { entries = fs.readdirSync(itemPath); } catch (_) {
        node.children = [];
        return node;
      }

      entries.sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }));

      const children = [];
      for (const entry of entries) {
        const child = buildNode(path.join(itemPath, entry), currentDepth + 1);
        if (child) children.push(child);
      }

      node.isEmpty = children.length === 0;
      node.children = children;
      return node;
    }

    return null;
  }

  let root = buildNode(absoluteRoot, 0);
  if (!root) return null;

  // Apply sorting if requested
  if (sort) {
    sortTree(root, sort, sortOrder);
  }

  // Post-processing: compress first (merge single-child dirs), then collapse
  if (compress) root = compressTree(root);
  if (collapseThreshold !== null) root = collapseTree(root, collapseThreshold);

  return root;
}

/** Count all file descendants (non-directory nodes). */
function countFiles(nodes) {
  let count = 0;
  for (const n of nodes) {
    if (!n.children) count++;
    else count += countFiles(n.children);
  }
  return count;
}

/**
 * Collapse directories that have more than `threshold` direct children.
 * @param {ScanNode} node
 * @param {number} threshold
 * @returns {ScanNode}
 */
function collapseTree(node, threshold) {
  if (!node.children) return node;

  const processedChildren = node.children.map(c => collapseTree(c, threshold));
  const directFileCount = processedChildren.filter(c => !c.children).length;

  if (processedChildren.length > threshold) {
    const fileCount = countFiles(processedChildren);
    return {
      ...node,
      children: [],
      collapsed: true,
      collapsedCount: fileCount,
    };
  }

  return { ...node, children: processedChildren };
}

module.exports = { scan, isBinaryFile, parseSize, compressTree, collapseTree, DEFAULT_EXCLUDE, BINARY_EXTENSIONS };
