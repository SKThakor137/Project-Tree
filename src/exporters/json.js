'use strict';

/** @typedef {import('../core/scanner').ScanNode} ScanNode */

/**
 * Convert a ScanNode tree to a JSON-serializable object.
 * @param {ScanNode} node
 * @returns {Object}
 */
function nodeToJson(node) {
  const obj = { name: node.name, type: node.children !== undefined ? 'directory' : 'file' };
  if (node.size !== undefined && !node.children) obj.size = node.size;
  if (node.ext) obj.extension = node.ext;
  if (node.isSymlink) { obj.isSymlink = true; obj.symlinkTarget = node.symlinkTarget; }
  if (node.isEmpty) obj.isEmpty = true;
  if (node.isSensitive) obj.isSensitive = true;
  if (node.isBinary) obj.isBinary = true;
  if (node.collapsed) { obj.collapsed = true; obj.collapsedCount = node.collapsedCount; }
  if (node.children && !node.collapsed) {
    obj.children = node.children.map(nodeToJson);
  }
  return obj;
}

/**
 * Export the full tree as pretty-printed JSON.
 * @param {ScanNode} tree
 * @param {Object}   [stats]
 * @returns {string}
 */
function toJson(tree, stats = null) {
  const output = { tree: nodeToJson(tree) };
  if (stats) output.stats = stats;
  output.generatedAt = new Date().toISOString();
  return JSON.stringify(output, null, 2);
}

module.exports = { toJson, nodeToJson };
