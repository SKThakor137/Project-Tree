/**
 * Exports project directory tree structure into Mermaid diagram graph syntax.
 */
'use strict';

/** @typedef {import('../core/scanner').ScanNode} ScanNode */

/**
 * Generate a Mermaid graph definition from the tree.
 * @param {ScanNode} tree
 * @param {Object} [stats]
 * @returns {string}
 */
function toMermaid(tree, stats) {
  const lines = ['graph TD'];
  let idCounter = 0;

  // Add Component Graph Dependency mappings if available
  if (stats && stats.architectureGraph && Object.keys(stats.architectureGraph.imports).length > 0) {
    lines.push('  %% Architecture Dependency Graph');
    const imports = stats.architectureGraph.imports;
    const addedNodes = new Set();
    const cleanId = (p) => p.replace(/[^a-zA-Z0-9]/g, '_');

    for (const [file, deps] of Object.entries(imports)) {
      if (deps.length > 0) {
        const fromId = cleanId(file);
        if (!addedNodes.has(fromId)) {
          lines.push(`  ${fromId}["📄 ${escapeMermaid(file)}"]`);
          addedNodes.add(fromId);
        }

        deps.forEach(dep => {
          // Simplistic matching for Mermaid visual output
          const depId = cleanId(dep);
          if (!addedNodes.has(depId)) {
            lines.push(`  ${depId}["📄 ${escapeMermaid(dep)}"]`);
            addedNodes.add(depId);
          }
          lines.push(`  ${fromId} --> ${depId}`);
        });
      }
    }
    lines.push('  %% End Architecture Graph');
    lines.push('');
  }


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
