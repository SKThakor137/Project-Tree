'use strict';

/**
 * XML exporter — generates well-formed XML from the project tree.
 *
 * Zero dependencies — manual XML serialization.
 */

const path = require('path');

/**
 * Escape special XML characters.
 *
 * @param {string} str
 * @returns {string}
 */
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Convert a ScanNode to XML string recursively.
 *
 * @param {Object} node — ScanNode
 * @param {number} [indent=2] — current indent level
 * @returns {string}
 */
function nodeToXml(node, indent = 2) {
  const pad = ' '.repeat(indent);
  const isDir = node.children !== undefined;
  const tag = isDir ? 'directory' : 'file';

  const attrs = [`name="${escapeXml(node.name)}"`];

  if (!isDir) {
    if (node.size !== undefined) attrs.push(`size="${node.size}"`);
    if (node.ext) attrs.push(`extension="${escapeXml(node.ext)}"`);
    if (node.lineCount) attrs.push(`lines="${node.lineCount}"`);
    if (node.isBinary) attrs.push(`binary="true"`);
    if (node.isSensitive) attrs.push(`sensitive="true"`);
  }

  if (node.isSymlink) {
    attrs.push(`symlink="true"`);
    if (node.symlinkTarget) attrs.push(`target="${escapeXml(node.symlinkTarget)}"`);
  }

  if (node.collapsed) {
    attrs.push(`collapsed="true" collapsedCount="${node.collapsedCount || 0}"`);
  }

  if (node.isEmpty) attrs.push(`empty="true"`);

  const attrStr = attrs.join(' ');

  if (isDir && node.children && node.children.length > 0) {
    const lines = [`${pad}<${tag} ${attrStr}>`];
    for (const child of node.children) {
      lines.push(nodeToXml(child, indent + 2));
    }
    lines.push(`${pad}</${tag}>`);
    return lines.join('\n');
  }

  return `${pad}<${tag} ${attrStr} />`;
}

/**
 * Export tree as well-formed XML.
 *
 * @param {Object} tree — ScanNode root
 * @param {Object} [stats] — optional stats
 * @returns {string}
 */
function toXml(tree, stats = {}) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<project-tree>',
  ];

  // Metadata
  if (stats.dirs !== undefined || stats.files !== undefined) {
    lines.push('  <metadata>');
    if (stats.dirs !== undefined) lines.push(`    <directories>${stats.dirs}</directories>`);
    if (stats.files !== undefined) lines.push(`    <files>${stats.files}</files>`);
    if (stats.totalSize !== undefined) lines.push(`    <totalSize>${stats.totalSize}</totalSize>`);
    if (stats.maxDepth !== undefined) lines.push(`    <maxDepth>${stats.maxDepth}</maxDepth>`);
    lines.push('  </metadata>');
  }

  // Tree
  lines.push(nodeToXml(tree, 2));
  lines.push('</project-tree>');

  return lines.join('\n') + '\n';
}

module.exports = { toXml, escapeXml };
