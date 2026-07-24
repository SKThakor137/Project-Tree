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
      const pathAttr = node.relPath ? ` data-path="${node.relPath}"` : '';
      return `${indent}<li class="file"${pathAttr}>${icon} ${label}${extra}${sym}${summaryHtml}</li>`;
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

  // Serialize architecture data for frontend JS
  const archData = stats && stats.architectureGraph ? stats.architectureGraph : { imports: {}, exports: {}, usage: {}, deadCode: { files: [], components: [] } };

  const treeHtml = renderNode(tree);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tree.name} — Architecture Dashboard</title>
  <style>
    :root {
      --bg: #0d1117;
      --bg-panel: #161b22;
      --bg-hover: #21262d;
      --border: #30363d;
      --text: #c9d1d9;
      --text-muted: #8b949e;
      --accent: #58a6ff;
      --danger: #f85149;
    }

    @media (prefers-color-scheme: light) {
      :root {
        --bg: #ffffff;
        --bg-panel: #f6f8fa;
        --bg-hover: #eaeef2;
        --border: #d0d7de;
        --text: #24292f;
        --text-muted: #57606a;
        --accent: #0969da;
        --danger: #cf222e;
      }
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      background: var(--bg); color: var(--text);
      display: flex; height: 100vh; overflow: hidden;
    }

    /* Layout */
    .sidebar { width: 350px; border-right: 1px solid var(--border); display: flex; flex-direction: column; background: var(--bg-panel); }
    .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

    /* Header */
    .header { padding: 1rem; border-bottom: 1px solid var(--border); }
    .header h1 { font-size: 1.2rem; color: var(--accent); margin-bottom: 0.5rem; }
    .search-input {
      width: 100%; background: var(--bg); border: 1px solid var(--border);
      border-radius: 4px; padding: 0.5rem; color: var(--text); outline: none;
    }
    .search-input:focus { border-color: var(--accent); }

    /* Tabs */
    .tabs { display: flex; border-bottom: 1px solid var(--border); }
    .tab { padding: 0.75rem 1rem; cursor: pointer; color: var(--text-muted); font-size: 0.9rem; flex: 1; text-align: center; }
    .tab:hover { background: var(--bg-hover); }
    .tab.active { color: var(--text); border-bottom: 2px solid var(--accent); font-weight: 600; }

    /* Scrollable areas */
    .tree-container { flex: 1; overflow-y: auto; padding: 1rem; }
    .panel-container { flex: 1; padding: 2rem; overflow-y: auto; }

    /* Tree */
    ul { list-style: none; padding-left: 1rem; }
    li { margin: 2px 0; }
    .file { cursor: pointer; padding: 2px 4px; border-radius: 4px; display: inline-block; width: 100%; }
    .file:hover { background: var(--bg-hover); }
    .file.active { background: var(--accent); color: white; }
    .file.active .summary { color: rgba(255,255,255,0.7); }
    details > summary { cursor: pointer; font-weight: 500; padding: 2px 4px; border-radius: 4px; outline: none; display: block; }
    details > summary:hover { background: var(--bg-hover); }

    .hidden { color: var(--danger); font-style: italic; }
    .summary { color: var(--text-muted); font-size: 0.85em; margin-left: 8px; }

    /* Cards & Stats */
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .card { background: var(--bg-panel); border: 1px solid var(--border); padding: 1rem; border-radius: 6px; }
    .card-val { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.25rem; }
    .card-label { font-size: 0.85rem; color: var(--text-muted); }

    .detail-section { margin-bottom: 2rem; }
    .detail-section h2 { font-size: 1.1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; margin-bottom: 1rem; }

    .tag { display: inline-block; padding: 2px 8px; background: var(--bg-hover); border: 1px solid var(--border); border-radius: 12px; font-size: 0.8rem; margin: 2px; }
    .tag.warn { color: var(--danger); border-color: var(--danger); }
  </style>
</head>
<body>
  
  <div class="sidebar">
    <div class="header">
      <h1>${tree.name}</h1>
      <input type="text" id="treeSearch" class="search-input" placeholder="Search files, exports..." />
    </div>
    <div class="tabs">
      <div class="tab active" data-target="overview">Overview</div>
      <div class="tab" data-target="tree">Explorer</div>
    </div>
    <div class="tree-container" id="treeView" style="display: none;">
      <ul>${treeHtml}</ul>
    </div>
    <div class="tree-container" id="overviewView">
      <p style="color: var(--text-muted); font-size: 0.9rem;">Click Explorer to navigate codebase. Click on items below to view details.</p>
      <br/>
      ${stats ? `
        <div style="font-size: 0.9rem; margin-bottom: 8px;">Files: <b>${stats.files}</b></div>
        <div style="font-size: 0.9rem; margin-bottom: 8px;">Dirs: <b>${stats.dirs}</b></div>
        <div style="font-size: 0.9rem; margin-bottom: 8px;">Size: <b>${stats.totalSizeText}</b></div>
        <div style="font-size: 0.9rem; margin-bottom: 8px;">Components: <b>${stats.componentsCount || 0}</b></div>
      ` : ''}
    </div>
  </div>

  <div class="main">
    <div class="panel-container" id="detailPanel">
      <h2 style="color: var(--text-muted); font-weight: 400; margin-top: 2rem;">Select a file from the Explorer to view architecture details.</h2>
    </div>
  </div>

  <script>
    const ARCH_DATA = ${JSON.stringify(archData)};

    document.addEventListener('DOMContentLoaded', () => {
      const tabs = document.querySelectorAll('.tab');
      const treeView = document.getElementById('treeView');
      const overviewView = document.getElementById('overviewView');
      const detailPanel = document.getElementById('detailPanel');
      const searchInput = document.getElementById('treeSearch');

      const files = document.querySelectorAll('.file');

      // Tabs logic
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          if (tab.dataset.target === 'tree') {
            treeView.style.display = 'block';
            overviewView.style.display = 'none';
          } else {
            treeView.style.display = 'none';
            overviewView.style.display = 'block';
          }
        });
      });

      // Search Logic
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('li').forEach(li => {
          const text = li.textContent.toLowerCase();
          if (text.includes(query)) {
            li.style.display = '';
            // expand parent details
            let p = li.parentElement;
            while(p && p.tagName !== 'BODY') {
              if (p.tagName === 'DETAILS') p.open = true;
              if (p.tagName === 'LI') p.style.display = '';
              p = p.parentElement;
            }
          } else {
            li.style.display = 'none';
          }
        });
      });

      // Detail Panel logic
      files.forEach(f => {
        f.addEventListener('click', (e) => {
          files.forEach(el => el.classList.remove('active'));
          f.classList.add('active');

          // Resolve exactly to the dataset path encoded in the list item
          let relPath = f.dataset.path;

          const usage = ARCH_DATA.usage[relPath] || { count: 0, by: [] };
          const imports = ARCH_DATA.imports[relPath] || [];
          const exports = ARCH_DATA.exports[relPath] || [];
          const isDead = ARCH_DATA.deadCode.files.includes(relPath);

          let html = \`<div class="detail-section">
            <h2>\${relPath}</h2>
            \${isDead ? '<span class="tag warn">Unused</span>' : ''}
          </div>\`;

          if (usage.count > 0) {
            html += \`<div class="detail-section">
              <h3 style="margin-bottom:8px;">Used By (\${usage.count})</h3>
              <ul>\${usage.by.map(b => \`<li>\${b}</li>\`).join('')}</ul>
            </div>\`;
          }

          if (imports.length > 0) {
            html += \`<div class="detail-section">
              <h3 style="margin-bottom:8px;">Imports (\${imports.length})</h3>
              <ul>\${imports.map(i => \`<li>\${i}</li>\`).join('')}</ul>
            </div>\`;
          }

          if (exports.length > 0) {
            html += \`<div class="detail-section">
              <h3 style="margin-bottom:8px;">Exports (\${exports.length})</h3>
              <ul>\${exports.map(e => \`<li><span class="tag">\${e}</span></li>\`).join('')}</ul>
            </div>\`;
          }

          detailPanel.innerHTML = html;
          e.stopPropagation();
        });
      });
    });
  </script>
</body>
</html>`;
}

module.exports = { toHtml };
