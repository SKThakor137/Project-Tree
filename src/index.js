const dirTree = require("directory-tree");
const fs = require("fs");
const path = require("path");

const DEFAULT_EXCLUDE = /node_modules|\.next|\.git|dist|build|coverage|\.turbo|\.env.*/;

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
 * Generates a Markdown-wrapped folder tree and writes it to disk.
 *
 * @param {Object} options
 * @param {string} [options.rootDir=process.cwd()] - Directory to scan.
 * @param {string} [options.outputFile="PROJECT_STRUCTURE.md"] - Output filename.
 * @param {RegExp} [options.exclude=DEFAULT_EXCLUDE] - Exclude pattern.
 * @param {number} [options.maxDepth] - Optional max recursion depth.
 * @returns {string} The generated markdown content.
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
  const timestamp = new Date().toISOString();

  const markdown = [
    "# Project Structure",
    "",
    `_Auto-generated on ${timestamp}_`,
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

  return { markdown, outputPath };
}

module.exports = { generateTree, buildTreeText, DEFAULT_EXCLUDE };
