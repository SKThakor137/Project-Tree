/**
 * Mind Map HTML Visualizer Exporter for project-tree-md.
 * Generates a self-contained, horizontal interactive node-based mind map from scanned project tree.
 */
'use strict';

const { computeStats } = require('../core/stats.js');

/**
 * Format bytes into human readable string
 */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Recursively count files in a directory node.
 */
function countFiles(node) {
  if (!node.children) return 1;
  let count = 0;
  for (const child of node.children) {
    count += countFiles(child);
  }
  return count;
}

/**
 * Convert ScanNode directory tree into Mind Map JSON structure.
 * @param {import('../core/scanner').ScanNode} node
 * @returns {Object}
 */
function convertToMindMapJson(node) {
  const isDir = Boolean(node.children);
  const result = {
    text: node.name,
  };

  if (isDir) {
    const totalFiles = countFiles(node);
    if (totalFiles > 0) {
      result.badge = `${totalFiles} item${totalFiles === 1 ? '' : 's'}`;
    }
    result.children = (node.children || []).map(child => convertToMindMapJson(child));
  } else {
    if (node.size) {
      result.badge = formatBytes(node.size);
    }
  }

  return result;
}

/**
 * Generate self-contained HTML Mind Map visualizer string.
 * @param {import('../core/scanner').ScanNode} tree
 * @param {Object} [stats]
 * @returns {string} html
 */
function toMindmapHtml(tree, stats = null) {
  const mindMapData = convertToMindMapJson(tree);
  const jsonString = JSON.stringify(mindMapData, null, 2);

  // Build inline JS as a separate string using concatenation (avoids template literal escaping issues)
  const jsCode = buildMindmapScript(jsonString);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mind Map — ${tree.name}</title>
  <style>
    :root {
      --bg-color: #0f172a;
      --panel-bg: rgba(30, 41, 59, 0.85);
      --panel-border: rgba(255, 255, 255, 0.1);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #6366f1;
      --accent-hover: #4f46e5;
      --node-bg: #1e293b;
      --node-border: #334155;
      --shadow-color: rgba(0, 0, 0, 0.35);
      --font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    [data-theme="light"] {
      --bg-color: #f8fafc;
      --panel-bg: rgba(255, 255, 255, 0.9);
      --panel-border: rgba(0, 0, 0, 0.08);
      --text-main: #0f172a;
      --text-muted: #64748b;
      --accent: #4f46e5;
      --accent-hover: #4338ca;
      --node-bg: #ffffff;
      --node-border: #e2e8f0;
      --shadow-color: rgba(0, 0, 0, 0.08);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    html, body {
      height: 100%;
      width: 100%;
      overflow: hidden;
      font-family: var(--font-family);
      background: var(--bg-color);
      color: var(--text-main);
    }

    #app {
      display: flex;
      height: 100vh;
      width: 100vw;
    }

    #sidebar {
      width: 280px;
      min-width: 280px;
      background: var(--panel-bg);
      backdrop-filter: blur(16px);
      border-right: 1px solid var(--panel-border);
      display: flex;
      flex-direction: column;
      z-index: 30;
      transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    #sidebar.collapsed {
      transform: translateX(-280px);
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--panel-border);
    }

    .sidebar-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      font-size: 1rem;
      color: var(--accent);
    }

    .json-editor-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 16px;
      gap: 12px;
      overflow: hidden;
    }

    .json-editor-container label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    #json-input {
      flex: 1;
      resize: none;
      border: 1px solid var(--panel-border);
      border-radius: 8px;
      padding: 12px;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 0.8rem;
      line-height: 1.5;
      background: var(--bg-color);
      color: var(--text-main);
      outline: none;
      transition: border-color 0.2s ease;
    }

    #json-input:focus {
      border-color: var(--accent);
    }

    .editor-actions {
      display: flex;
      gap: 8px;
    }

    .btn {
      padding: 8px 14px;
      border-radius: 8px;
      border: 1px solid var(--panel-border);
      background: var(--panel-bg);
      color: var(--text-main);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }

    .btn:hover {
      border-color: var(--accent);
      background: var(--accent);
      color: #ffffff;
    }

    .btn-primary {
      background: var(--accent);
      border-color: var(--accent);
      color: #ffffff;
    }

    .btn-primary:hover {
      background: var(--accent-hover);
      border-color: var(--accent-hover);
    }

    #sidebar-toggle {
      position: fixed;
      top: 50%;
      left: 280px;
      transform: translateY(-50%);
      z-index: 31;
      border-radius: 0 8px 8px 0;
      padding: 12px 6px;
      transition: left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    #sidebar.collapsed + #sidebar-toggle {
      left: 16px;
    }

    #viewport {
      flex: 1;
      height: 100%;
      position: relative;
      overflow: hidden;
      cursor: grab;
    }

    #viewport:active {
      cursor: grabbing;
    }

    .bg-grid {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(var(--panel-border) 1.5px, transparent 1.5px);
      background-size: 24px 24px;
      pointer-events: none;
    }

    #world {
      position: absolute;
      top: 0;
      left: 0;
      transform-origin: 0 0;
      will-change: transform;
    }

    #svg-layer {
      position: absolute;
      top: 0;
      left: 0;
      overflow: visible;
      pointer-events: none;
    }

    .connector-path {
      fill: none;
      stroke-linecap: round;
      transition: stroke 0.3s ease, stroke-width 0.3s ease;
    }

    #nodes-layer {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
    }

    .mind-node {
      position: absolute;
      pointer-events: auto;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
      border-radius: 12px;
      background: var(--node-bg);
      border: 2px solid var(--node-border);
      box-shadow: 0 4px 14px var(--shadow-color);
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      white-space: nowrap;
      cursor: pointer;
    }

    .mind-node:hover {
      transform: scale(1.04);
      box-shadow: 0 8px 24px var(--shadow-color);
      z-index: 10;
    }

    .mind-node.root-node {
      padding: 12px 24px;
      border-radius: 16px;
      font-weight: 800;
      font-size: 1.1rem;
      border-width: 3px;
    }

    .node-text {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-main);
      line-height: 1.2;
    }

    .root-node .node-text {
      font-size: 1.1rem;
    }

    .node-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
      color: #ffffff;
      background: var(--accent);
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }

    .toggle-btn {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--accent);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      position: absolute;
      right: -10px;
      top: 50%;
      transform: translateY(-50%);
      border: 2px solid var(--node-bg);
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: transform 0.2s ease, background 0.2s ease;
    }

    .toggle-btn:hover {
      transform: translateY(-50%) scale(1.2);
    }

    .floating-controls {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      gap: 8px;
      z-index: 20;
      background: var(--panel-bg);
      backdrop-filter: blur(12px);
      padding: 6px;
      border-radius: 10px;
      border: 1px solid var(--panel-border);
      box-shadow: 0 4px 16px var(--shadow-color);
    }

    #toast {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: rgba(15, 23, 42, 0.9);
      color: #f8fafc;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      z-index: 100;
    }

    #toast.show {
      transform: translateX(-50%) translateY(0);
    }

    @media (max-width: 768px) {
      #sidebar { width: 100vw; max-width: 100vw; }
      #sidebar.collapsed { transform: translateX(-100vw); }
      .floating-controls { top: 12px; right: 12px; gap: 4px; padding: 4px; }
      .btn { padding: 6px 10px; font-size: 0.8rem; }
    }
  </style>
</head>
<body>

  <div id="app">
    <div id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          <span>Project Mind Map</span>
        </div>
        <button class="btn" id="btn-theme" title="Toggle Light/Dark Theme">🌙</button>
      </div>

      <div class="json-editor-container">
        <label for="json-input">Scanned Structure (JSON)</label>
        <textarea id="json-input" spellcheck="false"></textarea>
        
        <div class="editor-actions">
          <button class="btn btn-primary" id="btn-render" style="flex:1;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            Render Map
          </button>
          <button class="btn" id="btn-reset" title="Reset to Scanned Data">Reset</button>
        </div>
      </div>
    </div>

    <button class="btn" id="sidebar-toggle">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>

    <div id="viewport">
      <div class="bg-grid"></div>

      <div class="floating-controls">
        <button class="btn" id="btn-zoom-in" title="Zoom In">+</button>
        <button class="btn" id="btn-zoom-out" title="Zoom Out">-</button>
        <button class="btn" id="btn-fit" title="Fit Content">Fit</button>
        <button class="btn" id="btn-export-svg" title="Export as SVG">Export SVG</button>
      </div>

      <div id="world">
        <svg id="svg-layer"></svg>
        <div id="nodes-layer"></div>
      </div>
    </div>
  </div>

  <div id="toast">Mind map rendered</div>

  <script>
${jsCode}
  </script>
</body>
</html>`;
}

/**
 * Build the client-side JavaScript for the mind map.
 * Uses string concatenation to avoid template literal escaping issues.
 * @param {string} jsonString - JSON string of tree data
 * @returns {string} JavaScript code
 */
function buildMindmapScript(jsonString) {
  return `
    var PROJECT_DATA = ${jsonString};

    var PALETTES = [
      { main: '#8b5cf6', bg: '#f5f3ff', border: '#c4b5fd', badge: '#7c3aed' },
      { main: '#06b6d4', bg: '#ecfeff', border: '#a5f3fc', badge: '#0891b2' },
      { main: '#10b981', bg: '#ecfdf5', border: '#6ee7b7', badge: '#059669' },
      { main: '#f59e0b', bg: '#fffbeb', border: '#fcd34d', badge: '#d97706' },
      { main: '#ec4899', bg: '#fdf2f8', border: '#f9a8d4', badge: '#db2777' },
      { main: '#3b82f6', bg: '#eff6ff', border: '#93c5fd', badge: '#2563eb' },
      { main: '#84cc16', bg: '#f7fee7', border: '#bef264', badge: '#65a30d' },
      { main: '#f97316', bg: '#fff7ed', border: '#ffedd5', badge: '#ea580c' }
    ];

    var PALETTES_DARK = [
      { main: '#a78bfa', bg: '#2e1065', border: '#6d28d9', badge: '#8b5cf6' },
      { main: '#22d3ee', bg: '#083344', border: '#0e7490', badge: '#06b6d4' },
      { main: '#34d399', bg: '#022c22', border: '#047857', badge: '#10b981' },
      { main: '#fbbf24', bg: '#451a03', border: '#b45309', badge: '#f59e0b' },
      { main: '#f472b6', bg: '#500724', border: '#be185d', badge: '#ec4899' },
      { main: '#60a5fa', bg: '#172554', border: '#1d4ed8', badge: '#3b82f6' },
      { main: '#a3e635', bg: '#1a2e05', border: '#4d7c0f', badge: '#84cc16' },
      { main: '#fb923c', bg: '#431407', border: '#c2410c', badge: '#f97316' }
    ];

    var currentData = JSON.parse(JSON.stringify(PROJECT_DATA));
    var transform = { x: 100, y: 300, scale: 0.85 };
    var isDragging = false;
    var dragStart = { x: 0, y: 0 };
    var isDarkMode = true;
    var lastLayoutNodes = [];
    var lastLayoutPaths = [];

    var viewport, world, svgLayer, nodesLayer, jsonInput, sidebar, sidebarToggle, toast;

    function init() {
      try {
        viewport = document.getElementById('viewport');
        world = document.getElementById('world');
        svgLayer = document.getElementById('svg-layer');
        nodesLayer = document.getElementById('nodes-layer');
        jsonInput = document.getElementById('json-input');
        sidebar = document.getElementById('sidebar');
        sidebarToggle = document.getElementById('sidebar-toggle');
        toast = document.getElementById('toast');

        if (!viewport || !world || !svgLayer || !nodesLayer || !jsonInput) {
          console.error('Mind Map: Missing DOM elements');
          return;
        }

        jsonInput.value = JSON.stringify(currentData, null, 2);
        setupEventListeners();
        render();
        setTimeout(centerView, 100);
        window.addEventListener('resize', function() { setTimeout(centerView, 50); });
      } catch (err) {
        console.error('Mind Map init error:', err);
      }
    }

    var LEVEL_GAP = 240;
    var NODE_MARGIN_Y = 16;

    function computeTreeLayout(root) {
      var isDark = document.body.getAttribute('data-theme') !== 'light';
      var paletteSet = isDark ? PALETTES_DARK : PALETTES;

      function measureNode(node, depth, colorIdx) {
        node.depth = depth;
        node.color = depth === 0
          ? { main: '#6366f1', bg: isDark ? '#1e1b4b' : '#e0e7ff', border: '#6366f1', badge: '#4f46e5' }
          : paletteSet[colorIdx % paletteSet.length];

        var charCount = (node.text || '').length;
        var hasBadge = !!node.badge;
        node.width = Math.max(150, charCount * 9 + (hasBadge ? 80 : 30));
        node.height = depth === 0 ? 50 : 42;

        if (!node.children || node.children.length === 0 || node.collapsed) {
          node.subtreeHeight = node.height;
        } else {
          var totalH = 0;
          node.children.forEach(function(child, i) {
            var childColorIdx = depth === 0 ? i : colorIdx;
            measureNode(child, depth + 1, childColorIdx);
            totalH += child.subtreeHeight;
          });
          totalH += (node.children.length - 1) * NODE_MARGIN_Y;
          node.subtreeHeight = Math.max(node.height, totalH);
        }
      }

      function positionNode(node, x, startY) {
        node.x = x;
        if (!node.children || node.children.length === 0 || node.collapsed) {
          node.y = startY + node.subtreeHeight / 2 - node.height / 2;
        } else {
          var currentY = startY;
          var childYCenterSum = 0;
          node.children.forEach(function(child) {
            positionNode(child, x + node.width + LEVEL_GAP, currentY);
            childYCenterSum += (child.y + child.height / 2);
            currentY += child.subtreeHeight + NODE_MARGIN_Y;
          });
          node.y = (childYCenterSum / node.children.length) - node.height / 2;
        }
      }

      measureNode(root, 0, 0);
      positionNode(root, 0, 0);
      return root;
    }

    function render() {
      try {
        nodesLayer.innerHTML = '';
        svgLayer.innerHTML = '';

        var layoutRoot = computeTreeLayout(currentData);
        var paths = [];
        var nodes = [];

        function traverse(node) {
          nodes.push(node);
          if (node.children && node.children.length > 0 && !node.collapsed) {
            node.children.forEach(function(child) {
              var x1 = node.x + node.width;
              var y1 = node.y + node.height / 2;
              var x2 = child.x;
              var y2 = child.y + child.height / 2;
              var dx = x2 - x1;
              var cpX = x1 + dx * 0.5;
              paths.push({
                d: 'M ' + x1 + ' ' + y1 + ' C ' + cpX + ' ' + y1 + ', ' + cpX + ' ' + y2 + ', ' + x2 + ' ' + y2,
                color: child.color.main
              });
              traverse(child);
            });
          }
        }

        traverse(layoutRoot);
        lastLayoutNodes = nodes;
        lastLayoutPaths = paths;

        paths.forEach(function(p) {
          var pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          pathEl.setAttribute('d', p.d);
          pathEl.setAttribute('class', 'connector-path');
          pathEl.setAttribute('stroke', p.color);
          pathEl.setAttribute('stroke-width', '2.5');
          pathEl.setAttribute('fill', 'none');
          svgLayer.appendChild(pathEl);
        });

        nodes.forEach(function(n) {
          var nodeEl = document.createElement('div');
          nodeEl.className = 'mind-node' + (n.depth === 0 ? ' root-node' : '');
          nodeEl.style.left = n.x + 'px';
          nodeEl.style.top = n.y + 'px';
          nodeEl.style.borderColor = n.color.border;
          nodeEl.style.backgroundColor = n.color.bg;

          var textSpan = document.createElement('span');
          textSpan.className = 'node-text';
          textSpan.textContent = n.text || 'Untitled';
          textSpan.style.color = n.color.main;
          nodeEl.appendChild(textSpan);

          if (n.badge) {
            var badgeSpan = document.createElement('span');
            badgeSpan.className = 'node-badge';
            badgeSpan.textContent = n.badge;
            badgeSpan.style.backgroundColor = n.color.badge || n.color.main;
            nodeEl.appendChild(badgeSpan);
          }

          if (n.children && n.children.length > 0) {
            var toggleBtn = document.createElement('div');
            toggleBtn.className = 'toggle-btn';
            toggleBtn.textContent = n.collapsed ? '+' : String.fromCharCode(8722);
            toggleBtn.style.backgroundColor = n.color.main;
            toggleBtn.addEventListener('click', (function(nodeRef) {
              return function(e) {
                e.stopPropagation();
                nodeRef.collapsed = !nodeRef.collapsed;
                render();
              };
            })(n));
            nodeEl.appendChild(toggleBtn);
          }

          nodesLayer.appendChild(nodeEl);
        });

        updateTransform();
      } catch (err) {
        console.error('Mind Map render error:', err);
      }
    }

    function updateTransform() {
      world.style.transform = 'translate(' + transform.x + 'px, ' + transform.y + 'px) scale(' + transform.scale + ')';
    }

    function setupEventListeners() {
      viewport.addEventListener('mousedown', function(e) {
        if (e.target.closest('#sidebar') || e.target.closest('.floating-controls') || e.target.closest('#sidebar-toggle')) return;
        isDragging = true;
        dragStart = { x: e.clientX - transform.x, y: e.clientY - transform.y };
      });

      window.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        transform.x = e.clientX - dragStart.x;
        transform.y = e.clientY - dragStart.y;
        updateTransform();
      });

      window.addEventListener('mouseup', function() { isDragging = false; });

      viewport.addEventListener('wheel', function(e) {
        e.preventDefault();
        var zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        var newScale = Math.min(Math.max(0.3, transform.scale * zoomFactor), 2.5);
        var rect = viewport.getBoundingClientRect();
        var mouseX = e.clientX - rect.left;
        var mouseY = e.clientY - rect.top;
        transform.x = mouseX - (mouseX - transform.x) * (newScale / transform.scale);
        transform.y = mouseY - (mouseY - transform.y) * (newScale / transform.scale);
        transform.scale = newScale;
        updateTransform();
      }, { passive: false });

      sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        var isCollapsed = sidebar.classList.contains('collapsed');
        sidebarToggle.querySelector('svg').innerHTML = isCollapsed
          ? '<path d="M9 18l6-6-6-6"/>'
          : '<path d="M15 18l-6-6 6-6"/>';
      });

      document.getElementById('btn-zoom-in').addEventListener('click', function() {
        transform.scale = Math.min(2.5, transform.scale * 1.2);
        updateTransform();
      });

      document.getElementById('btn-zoom-out').addEventListener('click', function() {
        transform.scale = Math.max(0.3, transform.scale / 1.2);
        updateTransform();
      });

      document.getElementById('btn-fit').addEventListener('click', centerView);

      document.getElementById('btn-render').addEventListener('click', function() {
        try {
          var parsed = JSON.parse(jsonInput.value);
          currentData = parsed;
          render();
          showToast('Mind map updated!');
        } catch (err) {
          showToast('Invalid JSON: ' + err.message);
        }
      });

      document.getElementById('btn-reset').addEventListener('click', function() {
        currentData = JSON.parse(JSON.stringify(PROJECT_DATA));
        jsonInput.value = JSON.stringify(currentData, null, 2);
        render();
        setTimeout(centerView, 50);
        showToast('Reset to scanned structure!');
      });

      document.getElementById('btn-theme').addEventListener('click', function() {
        isDarkMode = !isDarkMode;
        document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        document.getElementById('btn-theme').textContent = isDarkMode ? '\\u{1F319}' : '\\u{2600}\\u{FE0F}';
        render();
      });

      document.getElementById('btn-export-svg').addEventListener('click', exportSVG);
    }

    function centerView() {
      try {
        var nodeEls = document.querySelectorAll('.mind-node');
        if (!nodeEls || nodeEls.length === 0) {
          transform = { x: 80, y: (viewport.clientHeight || window.innerHeight) / 2 - 40, scale: 0.85 };
          updateTransform();
          return;
        }

        var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        nodeEls.forEach(function(el) {
          var left = parseFloat(el.style.left) || 0;
          var top = parseFloat(el.style.top) || 0;
          var w = el.offsetWidth || 160;
          var h = el.offsetHeight || 42;
          if (left < minX) minX = left;
          if (left + w > maxX) maxX = left + w;
          if (top < minY) minY = top;
          if (top + h > maxY) maxY = top + h;
        });

        var vpW = viewport.clientWidth || window.innerWidth;
        var vpH = viewport.clientHeight || window.innerHeight;
        var contentW = (maxX - minX) || 600;
        var contentH = (maxY - minY) || 400;
        var scaleX = (vpW - 80) / contentW;
        var scaleY = (vpH - 80) / contentH;
        var fitScale = Math.max(0.3, Math.min(1.1, Math.min(scaleX, scaleY)));

        transform.scale = fitScale;
        transform.x = (vpW - contentW * fitScale) / 2 - minX * fitScale;
        transform.y = (vpH - contentH * fitScale) / 2 - minY * fitScale;
        updateTransform();
      } catch (err) {
        console.error('centerView error:', err);
      }
    }

    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(function() { toast.classList.remove('show'); }, 2500);
    }

    function escXml(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function exportSVG() {
      try {
        var isDark = isDarkMode;
        var bgColor = isDark ? '#0f172a' : '#f8fafc';
        var nodes = lastLayoutNodes;
        var paths = lastLayoutPaths;

        if (!nodes || nodes.length === 0) {
          showToast('No nodes to export');
          return;
        }

        var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        nodes.forEach(function(n) {
          if (n.x < minX) minX = n.x;
          if (n.x + n.width > maxX) maxX = n.x + n.width;
          if (n.y < minY) minY = n.y;
          if (n.y + n.height > maxY) maxY = n.y + n.height;
        });

        var pad = 60;
        var width = Math.ceil(maxX - minX + pad * 2);
        var height = Math.ceil(maxY - minY + pad * 2);
        var ox = pad - minX;
        var oy = pad - minY;

        var parts = [];
        parts.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height + '" width="' + width + '" height="' + height + '">');
        parts.push('<rect width="100%" height="100%" fill="' + bgColor + '"/>');

        // Draw bezier connector paths
        paths.forEach(function(p) {
          // Parse the path data and offset coordinates
          var tokens = p.d.split(/[MCm,\\s]+/).filter(Boolean).map(Number);
          // M x1 y1 C cpx1 cpy1 cpx2 cpy2 x2 y2
          if (tokens.length >= 8) {
            var shifted = 'M ' + (tokens[0]+ox) + ' ' + (tokens[1]+oy) + ' C ' + (tokens[2]+ox) + ' ' + (tokens[3]+oy) + ', ' + (tokens[4]+ox) + ' ' + (tokens[5]+oy) + ', ' + (tokens[6]+ox) + ' ' + (tokens[7]+oy);
            parts.push('<path d="' + shifted + '" stroke="' + p.color + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>');
          }
        });

        // Draw node rectangles with text
        nodes.forEach(function(n) {
          var nx = n.x + ox;
          var ny = n.y + oy;
          var r = n.depth === 0 ? 16 : 12;

          parts.push('<rect x="' + nx + '" y="' + ny + '" width="' + n.width + '" height="' + n.height + '" rx="' + r + '" fill="' + n.color.bg + '" stroke="' + n.color.border + '" stroke-width="2"/>');

          var textX = nx + 16;
          var textY = ny + n.height / 2 + 5;
          var fontSize = n.depth === 0 ? 15 : 13;
          parts.push('<text x="' + textX + '" y="' + textY + '" fill="' + n.color.main + '" font-family="system-ui, sans-serif" font-size="' + fontSize + '" font-weight="600">' + escXml(n.text || '') + '</text>');

          if (n.badge) {
            var badgeX = nx + n.width - 56;
            var badgeY = ny + 6;
            var bh = n.height - 12;
            parts.push('<rect x="' + badgeX + '" y="' + badgeY + '" width="48" height="' + bh + '" rx="10" fill="' + (n.color.badge || n.color.main) + '"/>');
            parts.push('<text x="' + (badgeX + 24) + '" y="' + (badgeY + bh / 2 + 4) + '" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="700" text-anchor="middle">' + escXml(n.badge) + '</text>');
          }
        });

        parts.push('</svg>');

        var svgContent = parts.join('\\n');
        var blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'mindmap-' + Date.now() + '.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('SVG exported!');
      } catch (err) {
        console.error('Export SVG error:', err);
        showToast('Export failed: ' + err.message);
      }
    }

    window.addEventListener('DOMContentLoaded', init);
`;
}

module.exports = {
  toMindmapHtml,
};
