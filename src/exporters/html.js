'use strict';

/** @typedef {import('../core/scanner').ScanNode} ScanNode */

/**
 * Generate a self-contained collapsible HTML tree.
 * @param {ScanNode} tree
 * @param {Object}   [stats]
 * @returns {string} html
 */
function toHtml(tree, stats = null) {
  const timestamp = new Date().toISOString();

  function renderNode(node, depth = 0) {
    const indent = '  '.repeat(depth + 3);
    if (!node.children || node.collapsed) {
      const icon = node.children !== undefined ? '📁' : '📄';
      const label = node.isSensitive
        ? `${node.name} <span class="hidden">(hidden)</span>`
        : node.name;
      const extra = node.collapsed ? ` <span class="count">(${node.collapsedCount} files)</span>` : '';
      const sym = node.isSymlink ? ` <span class="sym">→ ${node.symlinkTarget}</span>` : '';
      return `${indent}<li class="file">${icon} ${label}${extra}${sym}</li>`;
    }

    const childHtml = node.children.map(c => renderNode(c, depth + 1)).join('\n');
    return [
      `${indent}<li>`,
      `${indent}  <details${depth === 0 ? ' open' : ''}>`,
      `${indent}    <summary>📁 ${node.name}${node.isEmpty ? ' <span class="empty">[empty]</span>' : ''}</summary>`,
      `${indent}    <ul>`,
      childHtml,
      `${indent}    </ul>`,
      `${indent}  </details>`,
      `${indent}</li>`,
    ].join('\n');
  }

  const treeHtml = renderNode(tree);
  const statsSection = stats
    ? `<div class="stats">📊 ${stats.statsText} &bull; 💾 ${stats.totalSizeText || ''}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tree.name} — Project Structure</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Consolas, monospace;
      background: #0d1117; color: #c9d1d9;
      padding: 2rem; line-height: 1.6;
    }
    h1 { color: #58a6ff; margin-bottom: 0.5rem; }
    .meta { color: #8b949e; font-size: 0.85rem; margin-bottom: 1rem; }
    .stats {
      background: #161b22; border: 1px solid #30363d;
      border-radius: 6px; padding: 0.75rem 1rem;
      margin-bottom: 1.5rem; color: #8b949e;
    }
    ul { list-style: none; padding-left: 1.2rem; }
    li { padding: 2px 0; }
    details > summary {
      cursor: pointer; color: #79c0ff; font-weight: 600;
      padding: 2px 4px; border-radius: 4px;
    }
    details > summary:hover { background: #161b22; }
    .file { color: #c9d1d9; }
    .hidden { color: #f0883e; font-style: italic; }
    .empty { color: #8b949e; font-style: italic; }
    .sym { color: #d2a8ff; }
    .count { color: #8b949e; }
  </style>
</head>
<body>
  <h1>📂 ${tree.name}</h1>
  <p class="meta">Auto-generated on ${timestamp}</p>
  ${statsSection}
  <ul>
${treeHtml}
  </ul>
</body>
</html>`;
}

module.exports = { toHtml };
