/**
 * Exports project directory tree structure into JSON format.
 */
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
  const output = {
    project: {
      generatedAt: new Date().toISOString(),
    },
    tree: nodeToJson(tree),
  };

  if (stats) {
    output.stats = {
      dirs: stats.dirs,
      files: stats.files,
      totalSize: stats.totalSize,
      componentsCount: stats.componentsCount,
      totalLines: stats.totalLines,
      avgComplexity: stats.avgComplexity,
    };

    if (stats.architectureGraph) {
      output.imports = stats.architectureGraph.imports || {};
      output.exports = stats.architectureGraph.exports || {};
      output.unused = stats.architectureGraph.deadCode || {};
      output.circular = stats.architectureGraph.circular || [];
      output.usage = stats.architectureGraph.usage || {};
    }
  }

  return JSON.stringify(output, null, 2);
}

module.exports = { toJson, nodeToJson };
