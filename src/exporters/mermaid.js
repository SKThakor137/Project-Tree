/**
 * Exports project directory tree structure into Mermaid diagram graph syntax.
 */
'use strict';

/** @typedef {import('../core/scanner').ScanNode} ScanNode */

/**
 * Generate a Mermaid graph definition from the tree.
 * @param {ScanNode} tree
 * @returns {string}
 */
function toMermaid(tree) {
  const lines = ['graph TD'];
  let idCounter = 0;

  function genId() { return `n${idCounter++}`; }

  function traverse(node, parentId) {
    const id = genId();
    const label = node.isSensitive
      ? `${node.name} - hidden`
      : node.collapsed
        ? `${node.name} - ${node.collapsedCount} files`
        : node.name;

    const isDir = node.children !== undefined;

    if (isDir) {
      lines.push(`  ${id}["📁 ${escapeMermaid(label)}"]`);
    } else {
      lines.push(`  ${id}("📄 ${escapeMermaid(label)}")`);
    }

    if (parentId !== null) {
      lines.push(`  ${parentId} --> ${id}`);
    }

    if (node.children && node.children.length && !node.collapsed) {
      node.children.forEach(child => traverse(child, id));
    }
  }

  traverse(tree, null);
  return lines.join('\n');
}

function escapeMermaid(s) {
  return String(s).replace(/"/g, "'").replace(/[[\](){}]/g, '');
}

module.exports = { toMermaid };
