/**
 * Self-contained interactive HTML exporter for Architecture Flow visualization.
 * Generates ARCHITECTURE_FLOW.html with connected file dependency tree, role badges, and JSON tree view.
 */
'use strict';

const path = require('path');

/**
 * Generate a self-contained interactive HTML page for architecture flow.
 * @param {Object} flowResult - Output from generateArchitectureFlow()
 * @param {string} projectName - Project root name
 * @returns {string} html
 */
function toArchitectureFlowHtml(flowResult, projectName = 'Project') {
  if (!flowResult || !flowResult.treeNode) {
    return `<!DOCTYPE html><html><body><h1>No architecture flow data</h1></body></html>`;
  }

  const treeData = JSON.stringify(flowResult.treeNode);

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(projectName)} — Architecture Flow</title>
  <meta name="description" content="Entry-to-leaf architecture execution flow and framework hierarchy visualizer for ${esc(projectName)}">
  <meta property="og:title" content="${esc(projectName)} — Architecture Flow">
  <meta property="og:description" content="Architecture execution flow and dependency visualizer.">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "project-tree-md",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Interactive Architecture Execution Flow Visualizer for Node.js.",
    "url": "https://github.com/SKThakor137/Project-Tree"
  }
  </script>
  <style>
    :root {
      --bg: #0d1117; --bg-panel: #161b22; --bg-hover: #21262d;
      --border: #30363d; --text: #c9d1d9; --text-muted: #8b949e;
      --accent: #58a6ff; --accent-bg: rgba(88,166,255,0.12);
      --success: #3fb950; --danger: #f85149; --warning: #d29922;
    }
    [data-theme="light"] {
      --bg: #fff; --bg-panel: #f6f8fa; --bg-hover: #eaeef2;
      --border: #d0d7de; --text: #24292f; --text-muted: #57606a;
      --accent: #0969da; --accent-bg: rgba(9,105,218,0.08);
      --success: #1a7f37; --danger: #cf222e; --warning: #9a6700;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif; background: var(--bg); color: var(--text); height: 100vh; display: flex; flex-direction: column; overflow: hidden; }

    .navbar { height: 52px; background: var(--bg-panel); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 1.25rem; flex-shrink: 0; }
    .brand { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 1rem; color: var(--accent); }
    .nav-actions { display: flex; gap: 0.5rem; }
    .btn { background: var(--bg-hover); border: 1px solid var(--border); color: var(--text); padding: 0.35rem 0.7rem; border-radius: 6px; font-size: 0.82rem; cursor: pointer; transition: all 0.15s; }
    .btn:hover { background: var(--accent-bg); border-color: var(--accent); color: var(--accent); }

    .layout { flex: 1; display: flex; overflow: hidden; }

    /* Left: Flow Tree */
    .flow-panel { flex: 1; overflow-y: auto; padding: 1.5rem; min-width: 0; }

    /* Right: Detail Panel */
    .detail-panel { width: 380px; border-left: 1px solid var(--border); background: var(--bg-panel); overflow-y: auto; padding: 1.5rem; flex-shrink: 0; }

    /* Tree Nodes */
    .flow-node { margin: 2px 0; }
    .flow-node-header { display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 0.88rem; transition: background 0.12s; position: relative; }
    .flow-node-header:hover { background: var(--bg-hover); }
    .flow-node-header.selected { background: var(--accent-bg); border: 1px solid var(--accent); }

    .role-badge { display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; border-radius: 10px; font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
    .role-ENTRY { background: rgba(63,185,80,0.15); color: var(--success); border: 1px solid rgba(63,185,80,0.3); }
    .role-ROUTE { background: rgba(88,166,255,0.15); color: var(--accent); border: 1px solid rgba(88,166,255,0.3); }
    .role-CONTROLLER { background: rgba(210,153,34,0.15); color: var(--warning); border: 1px solid rgba(210,153,34,0.3); }
    .role-SERVICE { background: rgba(139,148,158,0.15); color: var(--text-muted); border: 1px solid rgba(139,148,158,0.3); }
    .role-MODEL { background: rgba(248,81,73,0.15); color: var(--danger); border: 1px solid rgba(248,81,73,0.3); }
    .role-MIDDLEWARE { background: rgba(188,140,255,0.15); color: #bc8cff; border: 1px solid rgba(188,140,255,0.3); }
    .role-COMPONENT { background: rgba(63,185,80,0.15); color: var(--success); border: 1px solid rgba(63,185,80,0.3); }
    .role-UTILITY { background: rgba(139,148,158,0.15); color: var(--text-muted); border: 1px solid rgba(139,148,158,0.3); }
    .role-MODULE { background: rgba(139,148,158,0.1); color: var(--text-muted); border: 1px solid rgba(139,148,158,0.2); }
    .role-LAYOUT, .role-PAGE, .role-CLIENT_COMP { background: rgba(88,166,255,0.12); color: var(--accent); border: 1px solid rgba(88,166,255,0.25); }

    .file-path { color: var(--text); font-family: 'Consolas', 'Courier New', monospace; font-size: 0.82rem; }
    .file-size { color: var(--text-muted); font-size: 0.75rem; margin-left: auto; white-space: nowrap; }
    .circular-tag { color: var(--danger); font-size: 0.72rem; font-weight: 600; margin-left: 6px; }

    .flow-children { padding-left: 24px; border-left: 2px solid var(--border); margin-left: 16px; }

    .toggle-arrow { width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.7rem; color: var(--text-muted); transition: transform 0.15s; flex-shrink: 0; }
    .toggle-arrow.expanded { transform: rotate(90deg); }
    .toggle-arrow.leaf { visibility: hidden; }

    /* Detail Panel */
    .detail-title { font-size: 1.1rem; font-weight: 700; color: var(--accent); margin-bottom: 1rem; word-break: break-all; }
    .detail-section { margin-bottom: 1.5rem; }
    .detail-section h3 { font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-item { padding: 6px 10px; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; margin-bottom: 4px; font-size: 0.82rem; font-family: monospace; }
    .detail-kv { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid var(--border); font-size: 0.85rem; }
    .detail-kv:last-child { border-bottom: none; }
    .detail-kv .k { color: var(--text-muted); }
    .detail-kv .v { color: var(--text); font-weight: 500; }

    /* JSON Tree Tab */
    .tab-bar { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 1rem; }
    .tab-btn { padding: 6px 14px; cursor: pointer; color: var(--text-muted); font-size: 0.82rem; border-bottom: 2px solid transparent; }
    .tab-btn:hover { color: var(--text); }
    .tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 600; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }

    pre.json-tree { background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 1rem; overflow: auto; max-height: 400px; font-size: 0.78rem; font-family: 'Consolas', monospace; color: var(--text); line-height: 1.5; }

    /* Responsive */
    @media (max-width: 768px) {
      .navbar { padding: 0 0.75rem; height: 50px; }
      .brand { font-size: 0.9rem; }
      .btn { padding: 0.3rem 0.5rem; font-size: 0.78rem; }
      .layout { flex-direction: column; }
      .detail-panel { width: 100%; border-left: none; border-top: 1px solid var(--border); max-height: 45vh; padding: 1rem; }
      .flow-panel { padding: 1rem; }
    }

    @media (max-width: 480px) {
      .file-size { display: none; }
      .role-badge { padding: 1px 5px; font-size: 0.68rem; }
    }

    @media print {
      .navbar, .nav-actions { display: none !important; }
      body, .layout, .flow-panel, .detail-panel { height: auto; overflow: visible; background: #fff; color: #000; }
      .flow-children { border-left-color: #ccc; }
    }
  </style>
</head>
<body>
  <div class="navbar">
    <div class="brand"><span>🏗️</span> ${esc(projectName)} — Architecture Flow</div>
    <div class="nav-actions">
      <button class="btn" id="expandAllBtn">Expand All</button>
      <button class="btn" id="collapseAllBtn">Collapse All</button>
      <button class="btn" id="themeBtn">🌙 Theme</button>
    </div>
  </div>

  <div class="layout">
    <div class="flow-panel" id="flowPanel"></div>
    <div class="detail-panel" id="detailPanel">
      <div class="detail-title">Select a file</div>
      <p style="color:var(--text-muted);font-size:0.88rem;">Click any node in the flow tree to see its details, role, size, and connections.</p>
    </div>
  </div>

  <script>
    const TREE_DATA = ${treeData};

    function formatSize(bytes) {
      if (!bytes) return '0 B';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function esc(s) {
      const d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }

    let selectedEl = null;

    function renderNode(node, container) {
      const div = document.createElement('div');
      div.className = 'flow-node';

      const header = document.createElement('div');
      header.className = 'flow-node-header';

      const hasChildren = node.children && node.children.length > 0 && !node.isCircular;

      // Toggle arrow
      const arrow = document.createElement('span');
      arrow.className = 'toggle-arrow' + (hasChildren ? ' expanded' : ' leaf');
      arrow.textContent = '▶';
      header.appendChild(arrow);

      // Role icon
      const icon = document.createElement('span');
      icon.textContent = node.role.icon;
      header.appendChild(icon);

      // Role badge
      const badge = document.createElement('span');
      badge.className = 'role-badge role-' + node.role.role;
      badge.textContent = node.role.role;
      header.appendChild(badge);

      // File path
      const fp = document.createElement('span');
      fp.className = 'file-path';
      fp.textContent = node.relPath;
      header.appendChild(fp);

      // Circular tag
      if (node.isCircular) {
        const ctag = document.createElement('span');
        ctag.className = 'circular-tag';
        ctag.textContent = '🔄 CIRCULAR';
        header.appendChild(ctag);
      }

      // Size
      const sz = document.createElement('span');
      sz.className = 'file-size';
      sz.textContent = formatSize(node.size);
      header.appendChild(sz);

      div.appendChild(header);

      // Children container
      let childContainer = null;
      if (hasChildren) {
        childContainer = document.createElement('div');
        childContainer.className = 'flow-children';
        node.children.forEach(c => renderNode(c, childContainer));
        div.appendChild(childContainer);
      }

      // Click: toggle expand + show detail
      header.addEventListener('click', (e) => {
        e.stopPropagation();

        // Toggle children
        if (hasChildren && childContainer) {
          const isHidden = childContainer.style.display === 'none';
          childContainer.style.display = isHidden ? '' : 'none';
          arrow.classList.toggle('expanded', isHidden);
        }

        // Select
        if (selectedEl) selectedEl.classList.remove('selected');
        header.classList.add('selected');
        selectedEl = header;

        showDetail(node);
      });

      container.appendChild(div);
    }

    function showDetail(node) {
      const panel = document.getElementById('detailPanel');
      const childPaths = (node.children || []).filter(c => !c.isCircular).map(c => c.relPath);
      const circularPaths = (node.children || []).filter(c => c.isCircular).map(c => c.relPath);

      let html = '<div class="detail-title">' + node.role.icon + ' ' + esc(node.relPath) + '</div>';

      // Info section
      html += '<div class="detail-section"><h3>File Info</h3>';
      html += '<div class="detail-kv"><span class="k">Role</span><span class="v">' + esc(node.role.label) + '</span></div>';
      html += '<div class="detail-kv"><span class="k">Size</span><span class="v">' + formatSize(node.size) + '</span></div>';
      html += '<div class="detail-kv"><span class="k">Incoming Calls</span><span class="v">' + (node.calls || 0) + '</span></div>';
      html += '</div>';

      // Role badge
      html += '<div class="detail-section"><h3>Role Badge</h3>';
      html += '<span class="role-badge role-' + node.role.role + '">' + node.role.icon + ' ' + esc(node.role.role) + ' — ' + esc(node.role.label) + '</span>';
      html += '</div>';

      // Imports (children)
      if (childPaths.length > 0) {
        html += '<div class="detail-section"><h3>Imports (' + childPaths.length + ')</h3>';
        childPaths.forEach(p => { html += '<div class="detail-item">📦 ' + esc(p) + '</div>'; });
        html += '</div>';
      }

      // Circular
      if (circularPaths.length > 0) {
        html += '<div class="detail-section"><h3>🔄 Circular Dependencies</h3>';
        circularPaths.forEach(p => { html += '<div class="detail-item" style="border-color:var(--danger);">⚠️ ' + esc(p) + '</div>'; });
        html += '</div>';
      }

      // Tab: JSON Tree
      html += '<div class="detail-section">';
      html += '<div class="tab-bar"><div class="tab-btn active" data-tab="json">JSON Tree</div></div>';
      html += '<div class="tab-content active" id="tabJson"><pre class="json-tree">' + esc(JSON.stringify(simplifyNode(node), null, 2)) + '</pre></div>';
      html += '</div>';

      panel.innerHTML = html;
    }

    function simplifyNode(node) {
      const obj = {
        path: node.relPath,
        role: node.role.role,
        label: node.role.label,
        size: formatSize(node.size),
        calls: node.calls || 0,
      };
      if (node.isCircular) obj.circular = true;
      if (node.children && node.children.length > 0) {
        obj.imports = node.children.map(simplifyNode);
      }
      return obj;
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
      const flowPanel = document.getElementById('flowPanel');
      renderNode(TREE_DATA, flowPanel);

      // Expand/Collapse All
      document.getElementById('expandAllBtn').addEventListener('click', () => {
        flowPanel.querySelectorAll('.flow-children').forEach(c => c.style.display = '');
        flowPanel.querySelectorAll('.toggle-arrow:not(.leaf)').forEach(a => a.classList.add('expanded'));
      });
      document.getElementById('collapseAllBtn').addEventListener('click', () => {
        flowPanel.querySelectorAll('.flow-children').forEach(c => c.style.display = 'none');
        flowPanel.querySelectorAll('.toggle-arrow:not(.leaf)').forEach(a => a.classList.remove('expanded'));
      });

      // Theme
      document.getElementById('themeBtn').addEventListener('click', () => {
        const t = document.documentElement.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', t === 'light' ? 'dark' : 'light');
      });
    });
  </script>
</body>
</html>`;
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = { toArchitectureFlowHtml };
