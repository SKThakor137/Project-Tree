/**
 * Exports project directory tree structure as SVG vector diagram image.
 */
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

  const width = 750;
  const statsLine = stats ? `${stats.statsText}` : '';

  let archVisuals = [];
  let currentYOffset = TOP_PAD + y * LINE_HEIGHT + 30;

  if (stats && stats.architectureGraph) {
    const depsCount = Object.keys(stats.architectureGraph.imports).reduce((a, k) => a + stats.architectureGraph.imports[k].length, 0);
    if (depsCount > 0) {
      archVisuals.push(`  <rect x="${LEFT_PAD}" y="${currentYOffset}" width="600" height="2" fill="#30363d" />`);
      currentYOffset += 24;
      archVisuals.push(`  <text x="${LEFT_PAD}" y="${currentYOffset}" fill="#58a6ff" font-family="${FONT}" font-size="14" font-weight="bold">🧬 Architecture Dependency Edges: ${depsCount}</text>`);
      currentYOffset += 20;

      const MAX_LINES = 15;
      let linesDrawn = 0;
      for (const [file, deps] of Object.entries(stats.architectureGraph.imports)) {
        if (deps.length > 0 && linesDrawn < MAX_LINES) {
          const depText = deps.slice(0, 3).join(', ') + (deps.length > 3 ? '...' : '');
          archVisuals.push(`  <text x="${LEFT_PAD + 15}" y="${currentYOffset}" fill="#c9d1d9" font-family="${FONT}" font-size="12">▪ ${escXml(file)} ➔ [ ${escXml(depText)} ]</text>`);
          currentYOffset += 18;
          linesDrawn++;
        }
      }
      if (linesDrawn === MAX_LINES) {
         archVisuals.push(`  <text x="${LEFT_PAD + 15}" y="${currentYOffset}" fill="#8b949e" font-family="${FONT}" font-size="12">... and more dependencies.</text>`);
         currentYOffset += 18;
      }
    }
  }

  const height = currentYOffset + 20;

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
    `  <rect width="100%" height="100%" fill="#0d1117" rx="8"/>`,
    `  <text x="${LEFT_PAD}" y="28" fill="#58a6ff" font-family="${FONT}" font-size="16" font-weight="bold">📂 ${escXml(tree.name)}</text>`,
    statsLine ? `  <text x="${LEFT_PAD}" y="42" fill="#8b949e" font-family="${FONT}" font-size="11">${escXml(statsLine)}</text>` : '',
    ...lines.filter(Boolean),
    ...archVisuals,
    `</svg>`,
  ].join('\n');
}

function escXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = { toSvg };
