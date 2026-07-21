'use strict';

/** @typedef {import('../core/scanner').ScanNode} ScanNode */

/**
 * Generate a clean SVG tree diagram.
 * @param {ScanNode} tree
 * @param {Object}   [stats]
 * @returns {string} svg
 */
function toSvg(tree, stats = null) {
  const LINE_HEIGHT = 24;
  const INDENT_PX = 22;
  const LEFT_PAD = 16;
  const TOP_PAD = 50;
  const FONT = "'Consolas', 'Courier New', monospace";

  const lines = [];
  let y = 0;

  function flatten(node, depth, isLast, prefixSegments) {
    const displayName = node.isSensitive
      ? `${node.name} (hidden)`
      : node.collapsed
        ? `${node.name} (${node.collapsedCount} files)`
        : node.isEmpty && node.children !== undefined
          ? `${node.name} [empty]`
          : node.name;

    const isDir = node.children !== undefined;
    const color = isDir ? '#58a6ff' : '#c9d1d9';
    const icon = isDir ? '📁' : '📄';
    const fontWeight = depth === 0 ? 'bold' : 'normal';

    const x = LEFT_PAD + depth * INDENT_PX;
    const currentY = TOP_PAD + y * LINE_HEIGHT;

    // Connector
    let connector = '';
    if (depth > 0) {
      const cx = x - INDENT_PX + 6;
      const connChar = isLast ? '└── ' : '├── ';
      connector = `<text x="${cx}" y="${currentY}" fill="#484f58" font-family="${FONT}" font-size="13">${escXml(connChar)}</text>`;
    }

    lines.push(
      connector,
      `<text x="${x + 18}" y="${currentY}" fill="${color}" font-family="${FONT}" font-size="13" font-weight="${fontWeight}">`,
      `  ${icon} ${escXml(displayName)}`,
      `</text>`
    );
    y++;

    if (node.children && node.children.length && !node.collapsed) {
      node.children.forEach((child, i) =>
        flatten(child, depth + 1, i === node.children.length - 1, prefixSegments));
    }
  }

  flatten(tree, 0, true, []);

  const width = 700;
  const height = TOP_PAD + y * LINE_HEIGHT + 20;
  const statsLine = stats ? `${stats.statsText}` : '';

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
    `  <rect width="100%" height="100%" fill="#0d1117" rx="8"/>`,
    `  <text x="${LEFT_PAD}" y="28" fill="#58a6ff" font-family="${FONT}" font-size="16" font-weight="bold">📂 ${escXml(tree.name)}</text>`,
    statsLine ? `  <text x="${LEFT_PAD}" y="42" fill="#8b949e" font-family="${FONT}" font-size="11">${escXml(statsLine)}</text>` : '',
    ...lines.filter(Boolean),
    `</svg>`,
  ].join('\n');
}

function escXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = { toSvg };
