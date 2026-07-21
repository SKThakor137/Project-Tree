const fs = require("fs");
const path = require("path");

const DEFAULT_EXCLUDE = /node_modules|\.next|\.git|dist|build|coverage|\.turbo|\.env.*/;

/**
 * Custom replacement for directory-tree dependency.
 * Recursively builds a directory tree structure.
 */
function dirTree(rootDir, options = {}) {
  const { exclude, depth } = options;
  const absoluteRoot = path.resolve(rootDir);

  if (!fs.existsSync(absoluteRoot)) {
    return null;
  }

  const maxDepth = typeof depth === "number" ? depth : Infinity;

  function buildTree(itemPath, currentDepth = 0) {
    const name = path.basename(itemPath);
    const normalizedPath = itemPath.replace(/\\/g, "/");

    if (exclude && exclude.test(normalizedPath)) {
      return null;
    }

    let stats;
    try {
      stats = fs.lstatSync(itemPath);
    } catch (e) {
      return null;
    }

    const node = { name, path: itemPath };

    if (stats.isDirectory()) {
      if (currentDepth >= maxDepth) {
        return node;
      }

      let files;
      try {
        files = fs.readdirSync(itemPath);
      } catch (e) {
        return node;
      }

      // Sort files alphabetically (case-insensitive) to ensure cross-platform consistency
      files.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base", numeric: true }));

      const children = [];
      for (const file of files) {
        const childPath = path.join(itemPath, file);
        const childNode = buildTree(childPath, currentDepth + 1);
        if (childNode) {
          children.push(childNode);
        }
      }
      node.children = children;
    }

    return node;
  }

  return buildTree(absoluteRoot, 0);
}


/**
 * Recursively builds an ASCII tree string from a directory-tree node.
 */
function buildTreeText(node, prefix = "", isLast = true, isRoot = true) {
  if (!node) return "";

  const lines = [];
  const connector = isRoot ? "" : (isLast ? "└── " : "├── ");
  lines.push(`${prefix}${connector}${node.name}`);

  if (node.children && node.children.length) {
    const childPrefix = isRoot ? "" : (prefix + (isLast ? "    " : "│   "));
    node.children.forEach((child, index) => {
      lines.push(buildTreeText(child, childPrefix, index === node.children.length - 1, false));
    });
  }

  return lines.join("\n");
}

/**
 * Recursively builds a colored ASCII tree string for console output.
 */
function buildColoredTreeText(node, prefix = "", isLast = true, isRoot = true) {
  if (!node) return "";

  const lines = [];
  const connector = isRoot ? "" : (isLast ? "\x1b[90m└── \x1b[0m" : "\x1b[90m├── \x1b[0m");
  const prefixColored = prefix.replace(/│/g, "\x1b[90m│\x1b[0m");

  const isDir = !!node.children;
  const nameColor = isRoot ? "\x1b[1;34m" : (isDir ? "\x1b[34m" : "\x1b[37m");

  lines.push(`${prefixColored}${connector}${nameColor}${node.name}\x1b[0m`);

  if (node.children && node.children.length) {
    const childPrefix = isRoot ? "" : (prefix + (isLast ? "    " : "│   "));
    node.children.forEach((child, index) => {
      lines.push(buildColoredTreeText(child, childPrefix, index === node.children.length - 1, false));
    });
  }

  return lines.join("\n");
}

/**
 * Counts total files and directories inside the tree (excluding root).
 */
function countStats(node) {
  let dirs = 0;
  let files = 0;

  function traverse(n, isRootNode = false) {
    if (!isRootNode) {
      if (n.children) {
        dirs++;
      } else {
        files++;
      }
    }
    if (n.children) {
      n.children.forEach(child => traverse(child, false));
    }
  }

  traverse(node, true);
  return { dirs, files };
}

/**
 * Generates a Markdown-wrapped folder tree and writes it to disk.
 *
 * @param {Object} options
 * @param {string} [options.rootDir=process.cwd()] - Directory to scan.
 * @param {string} [options.outputFile="PROJECT_STRUCTURE.md"] - Output filename.
 * @param {RegExp} [options.exclude=DEFAULT_EXCLUDE] - Exclude pattern.
 * @param {number} [options.maxDepth] - Optional max recursion depth.
 * @returns {Object} The generated markdown content, outputPath, raw tree, colored tree, and stats.
 */
function generateTree(options = {}) {
  const {
    rootDir = process.cwd(),
    outputFile = "PROJECT_STRUCTURE.md",
    exclude = DEFAULT_EXCLUDE,
    maxDepth,
  } = options;

  const treeOptions = { exclude };
  if (maxDepth) treeOptions.depth = maxDepth;

  const tree = dirTree(rootDir, treeOptions);
  if (!tree) {
    throw new Error(`Could not read directory: ${rootDir}`);
  }

  const treeText = buildTreeText(tree);
  const coloredTreeText = buildColoredTreeText(tree);
  const stats = countStats(tree);
  const statsText = `${stats.dirs === 1 ? "1 directory" : `${stats.dirs} directories`}, ${stats.files === 1 ? "1 file" : `${stats.files} files`}`;
  const timestamp = new Date().toISOString();

  const markdown = [
    "# Project Structure",
    "",
    `_Auto-generated on ${timestamp}_`,
    `_Total: ${statsText}_`,
    "",
    "```",
    treeText,
    "```",
    "",
  ].join("\n");

  const outputPath = path.isAbsolute(outputFile)
    ? outputFile
    : path.join(rootDir, outputFile);

  fs.writeFileSync(outputPath, markdown, "utf-8");

  return { markdown, outputPath, treeText, coloredTreeText, stats, statsText };
}

module.exports = { generateTree, buildTreeText, buildColoredTreeText, countStats, DEFAULT_EXCLUDE };

