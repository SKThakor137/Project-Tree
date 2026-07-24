/**
 * Exports project directory tree structure as SVG vector diagram image.
 */
'use strict';

/** @typedef {import('../core/scanner').ScanNode} ScanNode */

/**
 * Generate a clean SVG tree diagram with proper indentation and connector lines.
 * @param {ScanNode} tree
 * @param {Object}   [stats]
 * @returns {string} svg
 */
function toSvg(tree, stats = null) {
  const LINE_HEIGHT = 22;
  const INDENT_PX = 20;
  const LEFT_PAD = 20;
  const TOP_PAD = 55;
  const FONT = "'Consolas', 'Courier New', monospace";
  const FONT_SIZE = 13;
  const CHAR_WIDTH = 7.8; // approximate monospace character width

  const svgLines = [];
  const connectorLines = [];
  let y = 0;
  let maxTextWidth = 0;

  function flatten(node, depth, isLast, parentConnectors) {
    const isDir = node.children !== undefined;
    const displayName = node.isSensitive
      ? `${node.name} (hidden)`
      : node.collapsed
        ? `${node.name} (${node.collapsedCount} files)`
        : node.isEmpty && isDir
          ? `${node.name} [empty]`
          : node.name;

    const color = depth === 0 ? '#58a6ff' : isDir ? '#79c0ff' : '#c9d1d9';
    const icon = isDir ? '📁' : '📄';
    const fontWeight = depth === 0 ? 'bold' : 'normal';

    const x = LEFT_PAD + depth * INDENT_PX;
    const currentY = TOP_PAD + y * LINE_HEIGHT;

    // Draw connector lines for non-root nodes
    if (depth > 0) {
      const parentX = x - INDENT_PX + 8;

      // Horizontal connector line
      connectorLines.push(
        `<line x1="${parentX}" y1="${currentY - 4}" x2="${x + 4}" y2="${currentY - 4}" stroke="#30363d" stroke-width="1"/>`
      );

      // Vertical connector from parent
      if (!isLast) {
        // Will be extended by siblings below
      }
    }

    // Draw vertical pipe lines for ancestor connections
    for (let d = 1; d < depth; d++) {
      if (parentConnectors[d]) {
        const pipeX = LEFT_PAD + d * INDENT_PX - INDENT_PX + 8;
        connectorLines.push(
          `<line x1="${pipeX}" y1="${currentY - LINE_HEIGHT + 4}" x2="${pipeX}" y2="${currentY - 4}" stroke="#30363d" stroke-width="1"/>`
        );
      }
    }

    // Vertical connector for current depth
    if (depth > 0) {
      const pipeX = x - INDENT_PX + 8;
      connectorLines.push(
        `<line x1="${pipeX}" y1="${currentY - LINE_HEIGHT + 4}" x2="${pipeX}" y2="${currentY - 4}" stroke="#30363d" stroke-width="1"/>`
      );
    }

    // Node circle/dot
    if (depth > 0) {
      const dotColor = isDir ? '#58a6ff' : '#484f58';
      connectorLines.push(
        `<circle cx="${x + 6}" cy="${currentY - 4}" r="2.5" fill="${dotColor}"/>`
      );
    }

    const textX = depth === 0 ? x : x + 14;
    const labelText = `${icon} ${escXml(displayName)}`;

    // Size info for files
    let sizeLabel = '';
    if (!isDir && node.size !== undefined) {
      sizeLabel = ` [${formatSizeSvg(node.size)}]`;
    }

    svgLines.push(
      `<text x="${textX}" y="${currentY}" fill="${color}" font-family="${FONT}" font-size="${FONT_SIZE}" font-weight="${fontWeight}">${labelText}${escXml(sizeLabel)}</text>`
    );

    const textLen = (labelText.length + sizeLabel.length) * CHAR_WIDTH + textX;
    if (textLen > maxTextWidth) maxTextWidth = textLen;

    y++;

    if (node.children && node.children.length && !node.collapsed) {
      const newConnectors = [...parentConnectors];
      node.children.forEach((child, i) => {
        const childIsLast = i === node.children.length - 1;
        newConnectors[depth + 1] = !childIsLast;
        flatten(child, depth + 1, childIsLast, newConnectors);
      });
    }
  }

  flatten(tree, 0, true, []);

  // Stats line at top
  const statsLine = stats ? stats.statsText || '' : '';
  const width = Math.max(700, maxTextWidth + 40);
  const contentHeight = TOP_PAD + y * LINE_HEIGHT + 15;

  // Architecture section
  let archVisuals = [];
  let archYOffset = contentHeight;

  if (stats && stats.architectureGraph) {
    const imports = stats.architectureGraph.imports || {};
    const depsCount = Object.keys(imports).reduce((a, k) => a + (imports[k] || []).length, 0);
    if (depsCount > 0) {
      archVisuals.push(`<rect x="${LEFT_PAD}" y="${archYOffset}" width="${width - LEFT_PAD * 2}" height="1" fill="#30363d"/>`);
      archYOffset += 20;
      archVisuals.push(`<text x="${LEFT_PAD}" y="${archYOffset}" fill="#58a6ff" font-family="${FONT}" font-size="13" font-weight="bold">🧬 Architecture Dependency Edges: ${depsCount}</text>`);
      archYOffset += 18;

      const MAX_LINES = 12;
      let linesDrawn = 0;
      for (const [file, deps] of Object.entries(imports)) {
        if (deps.length > 0 && linesDrawn < MAX_LINES) {
          const depText = deps.slice(0, 3).join(', ') + (deps.length > 3 ? '...' : '');
          archVisuals.push(`<text x="${LEFT_PAD + 12}" y="${archYOffset}" fill="#8b949e" font-family="${FONT}" font-size="11">▸ ${escXml(file)} → [ ${escXml(depText)} ]</text>`);
          archYOffset += 16;
          linesDrawn++;
        }
      }
      if (linesDrawn === MAX_LINES) {
        archVisuals.push(`<text x="${LEFT_PAD + 12}" y="${archYOffset}" fill="#484f58" font-family="${FONT}" font-size="11">... and more</text>`);
        archYOffset += 16;
      }
    }
  }

  const height = archVisuals.length > 0 ? archYOffset + 15 : contentHeight;

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
    `  <rect width="100%" height="100%" fill="#0d1117" rx="10"/>`,
    `  <text x="${LEFT_PAD}" y="22" fill="#58a6ff" font-family="${FONT}" font-size="15" font-weight="bold">📂 ${escXml(tree.name)}</text>`,
    statsLine ? `  <text x="${LEFT_PAD}" y="38" fill="#8b949e" font-family="${FONT}" font-size="10">${escXml(statsLine)}</text>` : '',
    `  <line x1="${LEFT_PAD}" y1="44" x2="${width - LEFT_PAD}" y2="44" stroke="#21262d" stroke-width="1"/>`,
    ...connectorLines.map(l => `  ${l}`),
    ...svgLines.map(l => `  ${l}`),
    ...archVisuals.map(l => `  ${l}`),
    `</svg>`,
  ].filter(Boolean).join('\n');
}

function formatSizeSvg(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function escXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = { toSvg };
