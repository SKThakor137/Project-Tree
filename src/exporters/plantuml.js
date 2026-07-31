'use strict';

/**
 * PlantUML exporter — generates PlantUML salt/tree diagram from the project tree.
 *
 * Output is a valid PlantUML source that can be rendered by any PlantUML processor.
 * Zero dependencies.
 */

/**
 * Escape PlantUML special characters in a name.
 *
 * @param {string} str
 * @returns {string}
 */
function escapePuml(str) {
  if (!str) return '';
  return String(str)
    .replace(/[{}|]/g, '\\$&');
}

/**
 * Convert a ScanNode tree to PlantUML tree lines.
 *
 * Uses the salt tree syntax:
 *   {T
 *   + root
 *   ++ child1
 *   +++ grandchild
 *   }
 *
 * @param {Object} node — ScanNode
 * @param {number} [depth=1]
 * @param {string[]} [lines=[]]
 * @returns {string[]}
 */
function nodeToPlantUml(node, depth = 1, lines = []) {
  const prefix = '+'.repeat(depth);
  const isDir = node.children !== undefined;

  let label = escapePuml(node.name);
  if (isDir) {
    label = `<b>${label}</b>`;
  }
  if (node.isSymlink && node.symlinkTarget) {
    label += ` → ${escapePuml(node.symlinkTarget)}`;
  }
  if (node.collapsed) {
    label += ` (${node.collapsedCount} files)`;
  }
  if (node.isEmpty && isDir) {
    label += ' [empty]';
  }
  if (node.isSensitive) {
    label += ' (hidden)';
  }

  lines.push(`${prefix} ${label}`);

  if (isDir && node.children && !node.collapsed) {
    for (const child of node.children) {
      nodeToPlantUml(child, depth + 1, lines);
    }
  }

  return lines;
}

/**
 * Generate a PlantUML component diagram showing the tree.
 *
 * @param {Object} node — ScanNode
 * @param {number} [depth=0]
 * @param {string[]} [lines=[]]
 * @returns {string[]}
 */
function nodeToComponentDiagram(node, depth = 0, lines = []) {
  const isDir = node.children !== undefined;
  const indent = '  '.repeat(depth);
  const safeName = node.name.replace(/[^a-zA-Z0-9_]/g, '_');

  if (isDir) {
    lines.push(`${indent}folder "${escapePuml(node.name)}" as ${safeName}_${depth} {`);
    if (node.children && !node.collapsed) {
      for (const child of node.children) {
        nodeToComponentDiagram(child, depth + 1, lines);
      }
    }
    lines.push(`${indent}}`);
  } else {
    const stereo = node.isBinary ? '<<binary>>' : (node.isSensitive ? '<<sensitive>>' : '');
    lines.push(`${indent}file "${escapePuml(node.name)}" ${stereo} as ${safeName}_${depth}`);
  }

  return lines;
}

/**
 * Export tree as PlantUML salt tree diagram.
 *
 * @param {Object} tree — ScanNode root
 * @param {Object} [stats]
 * @param {Object} [options]
 * @param {string} [options.style='salt'] — 'salt' or 'component'
 * @returns {string}
 */
function toPlantUml(tree, stats = {}, options = {}) {
  const { style = 'salt' } = options;
  const lines = ['@startuml'];

  if (style === 'component') {
    lines.push('!theme plain');
    lines.push('');
    const diagramLines = nodeToComponentDiagram(tree);
    lines.push(...diagramLines);
  } else {
    // Salt tree (default)
    lines.push('salt');
    lines.push('{');
    lines.push('{T');

    const treeLines = nodeToPlantUml(tree);
    lines.push(...treeLines);

    lines.push('}');
    lines.push('}');
  }

  // Add stats as note
  if (stats.dirs !== undefined || stats.files !== undefined) {
    lines.push('');
    lines.push('note bottom');
    if (stats.dirs !== undefined) lines.push(`  Directories: ${stats.dirs}`);
    if (stats.files !== undefined) lines.push(`  Files: ${stats.files}`);
    if (stats.totalSizeText) lines.push(`  Total Size: ${stats.totalSizeText}`);
    lines.push('end note');
  }

  lines.push('@enduml');
  return lines.join('\n') + '\n';
}

module.exports = { toPlantUml, escapePuml };
