/**
 * Self-contained HTML project tree generator with interactive search.
 */
/** @typedef {import('../core/scanner').ScanNode} ScanNode */

/**
 * Generate a self-contained collapsible HTML tree with interactive search.
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
      const summaryHtml = node.summary ? ` <span class="summary"># ${node.summary}</span>` : '';
      return `${indent}<li class="file">${icon} ${label}${extra}${sym}${summaryHtml}</li>`;
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
    .search-container {
      position: sticky; top: 0; z-index: 100;
      background: #0d1117; padding: 0.75rem 0; margin-bottom: 1rem;
      border-bottom: 1px solid #30363d; display: flex; align-items: center; gap: 1rem;
    }
    .search-input {
      flex: 1; background: #161b22; border: 1px solid #30363d;
      border-radius: 6px; padding: 0.6rem 1rem; color: #c9d1d9;
      font-family: inherit; font-size: 0.95rem; outline: none; transition: border-color 0.2s;
    }
    .search-input:focus { border-color: #58a6ff; box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.15); }
    .search-stats { color: #8b949e; font-size: 0.85rem; white-space: nowrap; }
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
    .summary { color: #8b949e; font-style: italic; font-size: 0.9em; margin-left: 6px; }
  </style>
</head>
<body>
  <h1>📂 ${tree.name}</h1>
  <p class="meta">Auto-generated on ${timestamp}</p>
  
  <div class="search-container">
    <input type="text" id="treeSearch" class="search-input" placeholder="🔍 Search files or folders..." autocomplete="off" />
    <span id="searchStats" class="search-stats"></span>
  </div>

  ${statsSection}
  <ul>
${treeHtml}
  </ul>

  <script>
    (function() {
      const searchInput = document.getElementById('treeSearch');
      const searchStats = document.getElementById('searchStats');
      const allListItems = Array.from(document.querySelectorAll('li'));

      searchInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();

        if (!query) {
          allListItems.forEach(el => { el.style.display = ''; });
          searchStats.textContent = '';
          return;
        }

        let matchCount = 0;
        allListItems.forEach(el => { el.style.display = 'none'; });

        allListItems.forEach(el => {
          const text = el.textContent.toLowerCase();
          if (text.includes(query)) {
            matchCount++;
            el.style.display = '';
            let parent = el.parentElement;
            while (parent && parent.tagName !== 'BODY') {
              if (parent.tagName === 'LI') {
                parent.style.display = '';
              }
              if (parent.tagName === 'DETAILS') {
                parent.open = true;
              }
              parent = parent.parentElement;
            }
          }
        });

        searchStats.textContent = matchCount > 0
          ? matchCount + ' match' + (matchCount > 1 ? 'es' : '')
          : 'No matches';
      });
    })();
  </script>
</body>
</html>`;
}

module.exports = { toHtml };
