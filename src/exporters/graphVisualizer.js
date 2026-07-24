/**
 * Interactive Graph Visualizer — Standalone HTML Generator
 *
 * Generates a single self-contained HTML file with a complete interactive
 * code relationship graph visualization. All CSS and JavaScript are embedded
 * inline — zero external dependencies.
 *
 * Features:
 * - Canvas-based rendering with virtual viewport (scales to 10,000+ nodes)
 * - Multiple layout engines: DAG, Force-Directed, Hierarchical, Radial, Horizontal
 * - Expand/collapse with smooth animations
 * - Search, filter, zoom, pan, minimap
 * - Dark/light glassmorphism UI
 * - Detail panel with node metadata
 * - Context menu, keyboard shortcuts
 * - Export: PNG, SVG, JSON, HTML
 * - Legend, breadcrumb, fullscreen
 * - Undo/redo history
 */
'use strict';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * Generate a self-contained interactive HTML visualization.
 * @param {Object} graphModel - Universal Graph Model from generateUniversalGraph()
 * @param {string} [projectName] - Project name for title
 * @returns {string} Complete HTML string
 */
function toGraphVisualizerHtml(graphModel, projectName) {
  if (!graphModel || !graphModel.nodes || !graphModel.edges) {
    return `<!DOCTYPE html><html><body><h1>No graph data available</h1></body></html>`;
  }

  const name = projectName || graphModel.projectName || 'Project';
  const graphData = JSON.stringify(graphModel);

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(name)} — Code Relationship Graph</title>
  <meta name="description" content="Interactive code architecture visualization for ${esc(name)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM
   ═══════════════════════════════════════════════════════════════════════════ */
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
  --radius: 10px;
  --radius-sm: 6px;
  --radius-lg: 16px;
  --shadow: 0 8px 32px rgba(0,0,0,0.3);
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.2);
  --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --glass-bg: rgba(22, 27, 34, 0.85);
  --glass-border: rgba(255,255,255,0.08);
  --glass-blur: blur(20px);
}

[data-theme="dark"] {
  --bg: #0d1117;
  --bg-canvas: #0a0e14;
  --bg-panel: #161b22;
  --bg-panel-2: #1c2128;
  --bg-hover: #21262d;
  --bg-active: #282e36;
  --border: #30363d;
  --border-light: #21262d;
  --text: #e6edf3;
  --text-secondary: #8b949e;
  --text-muted: #6e7681;
  --accent: #58a6ff;
  --accent-hover: #79c0ff;
  --accent-bg: rgba(88,166,255,0.12);
  --accent-bg-hover: rgba(88,166,255,0.2);
  --success: #3fb950;
  --danger: #f85149;
  --warning: #d29922;
  --info: #58a6ff;
  --purple: #bc8cff;
  --pink: #f778ba;
  --node-bg: rgba(22, 27, 34, 0.95);
  --node-border: rgba(48, 54, 61, 0.8);
  --node-shadow: 0 4px 20px rgba(0,0,0,0.4);
  --minimap-bg: rgba(22, 27, 34, 0.9);
  --grid-color: rgba(48, 54, 61, 0.3);
  --glass-bg: rgba(22, 27, 34, 0.85);
}

[data-theme="light"] {
  --bg: #f6f8fa;
  --bg-canvas: #ffffff;
  --bg-panel: #ffffff;
  --bg-panel-2: #f6f8fa;
  --bg-hover: #eaeef2;
  --bg-active: #dce1e7;
  --border: #d0d7de;
  --border-light: #e8ecf0;
  --text: #1f2328;
  --text-secondary: #656d76;
  --text-muted: #8c959f;
  --accent: #0969da;
  --accent-hover: #0550ae;
  --accent-bg: rgba(9,105,218,0.08);
  --accent-bg-hover: rgba(9,105,218,0.15);
  --success: #1a7f37;
  --danger: #cf222e;
  --warning: #9a6700;
  --info: #0969da;
  --purple: #8250df;
  --pink: #bf3989;
  --node-bg: rgba(255,255,255,0.98);
  --node-border: rgba(208, 215, 222, 0.8);
  --node-shadow: 0 4px 16px rgba(0,0,0,0.08);
  --minimap-bg: rgba(255,255,255,0.95);
  --grid-color: rgba(208, 215, 222, 0.4);
  --glass-bg: rgba(255, 255, 255, 0.85);
}

* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; font-family: var(--font-sans); background: var(--bg); color: var(--text); }

/* ═══════════════════════════════════════════════════════════════════════════
   TOOLBAR
   ═══════════════════════════════════════════════════════════════════════════ */
#toolbar {
  position: fixed; top: 0; left: 0; right: 0; height: 56px; z-index: 100;
  background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--glass-border);
  display: flex; align-items: center; padding: 0 16px; gap: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
}
.toolbar-brand {
  display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.95rem;
  color: var(--accent); white-space: nowrap; margin-right: 8px;
}
.toolbar-brand span { font-size: 1.2rem; }
.toolbar-sep { width: 1px; height: 28px; background: var(--border); margin: 0 4px; flex-shrink: 0; }
.tb-btn {
  display: inline-flex; align-items: center; gap: 4px; padding: 6px 10px;
  background: transparent; border: 1px solid transparent; border-radius: var(--radius-sm);
  color: var(--text-secondary); font-size: 0.8rem; font-family: var(--font-sans);
  cursor: pointer; transition: var(--transition); white-space: nowrap;
}
.tb-btn:hover { background: var(--bg-hover); color: var(--text); border-color: var(--border); }
.tb-btn.active { background: var(--accent-bg); color: var(--accent); border-color: var(--accent); }
.tb-btn .icon { font-size: 1rem; line-height: 1; }
.tb-select {
  padding: 5px 8px; background: var(--bg-panel); border: 1px solid var(--border);
  border-radius: var(--radius-sm); color: var(--text); font-size: 0.8rem;
  font-family: var(--font-sans); cursor: pointer; outline: none;
}
.tb-select:focus { border-color: var(--accent); }
#searchBox {
  padding: 6px 12px 6px 32px; width: 220px; background: var(--bg-panel);
  border: 1px solid var(--border); border-radius: var(--radius); color: var(--text);
  font-size: 0.82rem; font-family: var(--font-sans); outline: none; transition: var(--transition);
}
#searchBox:focus { border-color: var(--accent); width: 280px; box-shadow: 0 0 0 3px var(--accent-bg); }
.search-wrap { position: relative; display: flex; align-items: center; }
.search-wrap::before { content: '🔍'; position: absolute; left: 10px; font-size: 0.8rem; pointer-events: none; }
.search-results-count { position: absolute; right: 8px; font-size: 0.7rem; color: var(--text-muted); pointer-events: none; }
.toolbar-right { margin-left: auto; display: flex; align-items: center; gap: 4px; }

/* ═══════════════════════════════════════════════════════════════════════════
   CANVAS AREA
   ═══════════════════════════════════════════════════════════════════════════ */
#canvasWrap {
  position: fixed; top: 56px; left: 0; right: 0; bottom: 0;
  background: var(--bg-canvas); overflow: hidden; cursor: grab;
}
#canvasWrap.dragging { cursor: grabbing; }
#graphCanvas { display: block; }

/* ═══════════════════════════════════════════════════════════════════════════
   DETAIL PANEL
   ═══════════════════════════════════════════════════════════════════════════ */
#detailPanel {
  position: fixed; top: 56px; right: 0; width: 380px; bottom: 0;
  background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
  border-left: 1px solid var(--glass-border); z-index: 90;
  overflow-y: auto; padding: 20px; transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: -4px 0 24px rgba(0,0,0,0.15);
}
#detailPanel.open { transform: translateX(0); }
#detailPanel .close-btn {
  position: absolute; top: 12px; right: 12px; width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-hover); border: 1px solid var(--border); border-radius: var(--radius-sm);
  color: var(--text-muted); cursor: pointer; font-size: 1rem; transition: var(--transition);
}
#detailPanel .close-btn:hover { background: var(--danger); color: #fff; border-color: var(--danger); }
.detail-header { margin-bottom: 20px; }
.detail-icon { font-size: 2rem; margin-bottom: 8px; }
.detail-name { font-size: 1.15rem; font-weight: 700; color: var(--text); word-break: break-all; margin-bottom: 4px; }
.detail-path { font-size: 0.78rem; font-family: var(--font-mono); color: var(--text-muted); word-break: break-all; margin-bottom: 12px; }
.detail-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.badge {
  display: inline-flex; align-items: center; gap: 3px; padding: 3px 10px;
  border-radius: 20px; font-size: 0.7rem; font-weight: 600; white-space: nowrap;
  border: 1px solid; transition: var(--transition);
}
.badge-type { background: var(--accent-bg); color: var(--accent); border-color: rgba(88,166,255,0.3); }
.badge-lang { background: rgba(188,140,255,0.12); color: var(--purple); border-color: rgba(188,140,255,0.3); }
.badge-fw { background: rgba(63,185,80,0.12); color: var(--success); border-color: rgba(63,185,80,0.3); }
.detail-section { margin-bottom: 20px; }
.detail-section h3 {
  font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;
  color: var(--text-muted); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;
}
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.detail-stat {
  padding: 10px 12px; background: var(--bg-panel-2); border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
}
.detail-stat .label { font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px; }
.detail-stat .value { font-size: 1rem; font-weight: 600; color: var(--text); }
.conn-list { list-style: none; }
.conn-item {
  display: flex; align-items: center; gap: 8px; padding: 8px 10px;
  background: var(--bg-panel-2); border: 1px solid var(--border-light);
  border-radius: var(--radius-sm); margin-bottom: 4px; font-size: 0.8rem;
  cursor: pointer; transition: var(--transition);
}
.conn-item:hover { background: var(--accent-bg); border-color: var(--accent); }
.conn-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.conn-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.conn-type { font-size: 0.68rem; color: var(--text-muted); white-space: nowrap; }
.detail-tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 16px; }
.detail-tab {
  padding: 8px 16px; cursor: pointer; font-size: 0.8rem; font-weight: 500;
  color: var(--text-muted); border-bottom: 2px solid transparent; transition: var(--transition);
}
.detail-tab:hover { color: var(--text); }
.detail-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
.tab-pane { display: none; }
.tab-pane.active { display: block; }

/* ═══════════════════════════════════════════════════════════════════════════
   MINIMAP
   ═══════════════════════════════════════════════════════════════════════════ */
#minimap {
  position: fixed; bottom: 16px; right: 16px; width: 200px; height: 140px;
  background: var(--minimap-bg); border: 1px solid var(--border);
  border-radius: var(--radius); z-index: 80; overflow: hidden;
  box-shadow: var(--shadow-sm); cursor: crosshair;
}
#minimapCanvas { width: 100%; height: 100%; }
#minimap .viewport-rect {
  position: absolute; border: 2px solid var(--accent); background: rgba(88,166,255,0.08);
  border-radius: 2px; pointer-events: none;
}
#minimap .minimap-close {
  position: absolute; top: 4px; right: 4px; width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-hover); border-radius: 50%; font-size: 0.65rem;
  color: var(--text-muted); cursor: pointer; border: none; z-index: 1;
}

/* ═══════════════════════════════════════════════════════════════════════════
   LEGEND
   ═══════════════════════════════════════════════════════════════════════════ */
#legend {
  position: fixed; bottom: 16px; left: 16px; max-width: 280px; max-height: 400px;
  background: var(--glass-bg); backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border); border-radius: var(--radius);
  z-index: 80; overflow: hidden; box-shadow: var(--shadow-sm);
}
#legend .legend-header {
  padding: 10px 14px; font-size: 0.78rem; font-weight: 600; color: var(--text);
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--border); cursor: pointer;
}
#legend .legend-body { padding: 10px 14px; max-height: 320px; overflow-y: auto; }
#legend.collapsed .legend-body { display: none; }
.legend-group { margin-bottom: 12px; }
.legend-group-title { font-size: 0.68rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
.legend-item {
  display: flex; align-items: center; gap: 8px; padding: 3px 0; font-size: 0.75rem;
  color: var(--text-secondary); cursor: pointer; transition: var(--transition);
}
.legend-item:hover { color: var(--text); }
.legend-color { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
.legend-line { width: 20px; height: 2px; flex-shrink: 0; border-radius: 1px; }
.legend-line.dashed { background: none; border-top: 2px dashed; }
.legend-line.dotted { background: none; border-top: 2px dotted; }

/* ═══════════════════════════════════════════════════════════════════════════
   CONTEXT MENU
   ═══════════════════════════════════════════════════════════════════════════ */
#contextMenu {
  position: fixed; z-index: 200; min-width: 200px;
  background: var(--bg-panel); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 6px 0; box-shadow: var(--shadow);
  display: none;
}
.ctx-item {
  padding: 8px 16px; font-size: 0.82rem; color: var(--text);
  cursor: pointer; display: flex; align-items: center; gap: 10px;
  transition: var(--transition);
}
.ctx-item:hover { background: var(--accent-bg); color: var(--accent); }
.ctx-item .icon { width: 18px; text-align: center; }
.ctx-item .shortcut { margin-left: auto; font-size: 0.68rem; color: var(--text-muted); }
.ctx-sep { height: 1px; background: var(--border); margin: 4px 0; }

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST / STATUS
   ═══════════════════════════════════════════════════════════════════════════ */
#toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(100px);
  padding: 10px 24px; background: var(--bg-panel); border: 1px solid var(--border);
  border-radius: var(--radius); font-size: 0.82rem; color: var(--text);
  box-shadow: var(--shadow); z-index: 300; transition: transform 0.3s ease; pointer-events: none;
}
#toast.show { transform: translateX(-50%) translateY(0); }

/* ═══════════════════════════════════════════════════════════════════════════
   KEYBOARD HELP MODAL
   ═══════════════════════════════════════════════════════════════════════════ */
#kbdModal {
  position: fixed; inset: 0; z-index: 500; display: none;
  align-items: center; justify-content: center; background: rgba(0,0,0,0.5);
}
#kbdModal.show { display: flex; }
#kbdModal .modal-content {
  background: var(--bg-panel); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 24px 32px; max-width: 480px;
  width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: var(--shadow);
}
#kbdModal h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; color: var(--accent); }
.kbd-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-light); font-size: 0.82rem; }
.kbd-row:last-child { border-bottom: none; }
.kbd-key {
  display: inline-block; padding: 2px 8px; background: var(--bg-hover); border: 1px solid var(--border);
  border-radius: 4px; font-family: var(--font-mono); font-size: 0.72rem; color: var(--text);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCROLLBAR
   ═══════════════════════════════════════════════════════════════════════════ */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

/* ═══════════════════════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  #detailPanel { width: 100%; top: auto; bottom: 0; height: 50vh; border-left: none; border-top: 1px solid var(--glass-border); transform: translateY(100%); }
  #detailPanel.open { transform: translateY(0); }
  #toolbar { gap: 4px; padding: 0 8px; }
  #searchBox { width: 140px; }
  #searchBox:focus { width: 180px; }
  .tb-label { display: none; }
  #minimap { width: 140px; height: 100px; }
  #legend { max-width: 200px; }
}

@media print {
  #toolbar, #detailPanel, #minimap, #legend, #contextMenu, #toast, #kbdModal { display: none !important; }
  #canvasWrap { position: static; }
}
  </style>
</head>
<body>

<!-- ═══ TOOLBAR ═══ -->
<div id="toolbar">
  <div class="toolbar-brand"><span>◈</span> ${esc(name)}</div>
  <div class="toolbar-sep"></div>

  <select class="tb-select" id="layoutSelect" title="Layout">
    <option value="dagre">DAG</option>
    <option value="force">Force Directed</option>
    <option value="tree">Tree</option>
    <option value="radial">Radial</option>
    <option value="horizontal">Horizontal</option>
  </select>

  <div class="toolbar-sep"></div>

  <button class="tb-btn" id="btnExpandAll" title="Expand All"><span class="icon">⊞</span><span class="tb-label">Expand</span></button>
  <button class="tb-btn" id="btnCollapseAll" title="Collapse All"><span class="icon">⊟</span><span class="tb-label">Collapse</span></button>
  <button class="tb-btn" id="btnFitView" title="Fit View"><span class="icon">⊡</span><span class="tb-label">Fit</span></button>

  <div class="toolbar-sep"></div>

  <div class="search-wrap">
    <input type="text" id="searchBox" placeholder="Search nodes... (Ctrl+F)" autocomplete="off">
    <span class="search-results-count" id="searchCount"></span>
  </div>

  <div class="toolbar-right">
    <button class="tb-btn" id="btnUndo" title="Undo (Ctrl+Z)"><span class="icon">↩</span></button>
    <button class="tb-btn" id="btnRedo" title="Redo (Ctrl+Y)"><span class="icon">↪</span></button>
    <div class="toolbar-sep"></div>
    <button class="tb-btn" id="btnExport" title="Export PNG"><span class="icon">📷</span><span class="tb-label">Export</span></button>
    <button class="tb-btn" id="btnExportJSON" title="Export JSON"><span class="icon">{ }</span></button>
    <div class="toolbar-sep"></div>
    <button class="tb-btn" id="btnTheme" title="Toggle Theme"><span class="icon">🌙</span></button>
    <button class="tb-btn" id="btnFullscreen" title="Fullscreen (F)"><span class="icon">⛶</span></button>
    <button class="tb-btn" id="btnHelp" title="Shortcuts (?)"><span class="icon">?</span></button>
  </div>
</div>

<!-- ═══ CANVAS ═══ -->
<div id="canvasWrap">
  <canvas id="graphCanvas"></canvas>
</div>

<!-- ═══ DETAIL PANEL ═══ -->
<div id="detailPanel">
  <div class="close-btn" id="detailClose">✕</div>
  <div id="detailContent">
    <div class="detail-header">
      <div class="detail-icon">◈</div>
      <div class="detail-name">Select a node</div>
      <div class="detail-path">Click any node in the graph to see details</div>
    </div>
  </div>
</div>

<!-- ═══ MINIMAP ═══ -->
<div id="minimap">
  <button class="minimap-close" id="minimapClose">✕</button>
  <canvas id="minimapCanvas"></canvas>
  <div class="viewport-rect" id="viewportRect"></div>
</div>

<!-- ═══ LEGEND ═══ -->
<div id="legend">
  <div class="legend-header" id="legendToggle">
    <span>◈ Legend</span><span id="legendArrow">▼</span>
  </div>
  <div class="legend-body" id="legendBody"></div>
</div>

<!-- ═══ CONTEXT MENU ═══ -->
<div id="contextMenu"></div>

<!-- ═══ TOAST ═══ -->
<div id="toast" id="toast"></div>

<!-- ═══ KEYBOARD HELP ═══ -->
<div id="kbdModal">
  <div class="modal-content">
    <h2>⌨️ Keyboard Shortcuts</h2>
    <div class="kbd-row"><span>Search</span><span class="kbd-key">Ctrl+F</span></div>
    <div class="kbd-row"><span>Zoom In</span><span class="kbd-key">+</span></div>
    <div class="kbd-row"><span>Zoom Out</span><span class="kbd-key">-</span></div>
    <div class="kbd-row"><span>Fit View</span><span class="kbd-key">0</span></div>
    <div class="kbd-row"><span>Expand Selected</span><span class="kbd-key">E</span></div>
    <div class="kbd-row"><span>Collapse Selected</span><span class="kbd-key">C</span></div>
    <div class="kbd-row"><span>Fullscreen</span><span class="kbd-key">F</span></div>
    <div class="kbd-row"><span>Undo</span><span class="kbd-key">Ctrl+Z</span></div>
    <div class="kbd-row"><span>Redo</span><span class="kbd-key">Ctrl+Y</span></div>
    <div class="kbd-row"><span>Export PNG</span><span class="kbd-key">Ctrl+S</span></div>
    <div class="kbd-row"><span>Deselect / Close</span><span class="kbd-key">Esc</span></div>
    <div class="kbd-row"><span>Show Shortcuts</span><span class="kbd-key">?</span></div>
    <div style="margin-top: 16px; text-align: center;">
      <button class="tb-btn" onclick="document.getElementById('kbdModal').classList.remove('show')" style="padding:8px 24px;">Close</button>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════════════════
     MAIN APPLICATION SCRIPT
     ═══════════════════════════════════════════════════════════════════════════ -->
<script>
(function() {
'use strict';

// ─── DATA ────────────────────────────────────────────────────────────────────
const GRAPH = ${graphData};
const nodes = GRAPH.nodes || [];
const edges = GRAPH.edges || [];

// ─── STATE ───────────────────────────────────────────────────────────────────
const STATE = {
  // Viewport
  offsetX: 0, offsetY: 0, zoom: 1,
  // Interaction
  dragging: false, dragStartX: 0, dragStartY: 0,
  dragNode: null, dragNodeOffX: 0, dragNodeOffY: 0,
  selectedNode: null, hoveredNode: null,
  // Layout
  positions: new Map(),
  nodeWidth: 220, nodeHeight: 64,
  // Collapse
  collapsed: new Set(),
  hidden: new Set(),
  pinned: new Set(),
  // Search
  searchTerm: '', searchResults: [],
  // History
  history: [], historyIndex: -1,
  // Animation
  animating: false, animFrame: null,
};

// ─── CANVAS SETUP ────────────────────────────────────────────────────────────
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const wrap = document.getElementById('canvasWrap');
let W, H, dpr;

function resizeCanvas() {
  dpr = window.devicePixelRatio || 1;
  W = wrap.clientWidth;
  H = wrap.clientHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  render();
}
window.addEventListener('resize', resizeCanvas);

// ─── ADJACENCY ───────────────────────────────────────────────────────────────
const nodeMap = new Map();
const childrenMap = new Map();
const parentMap = new Map();
const incomingEdges = new Map();
const outgoingEdges = new Map();

nodes.forEach(n => {
  nodeMap.set(n.id, n);
  childrenMap.set(n.id, []);
  incomingEdges.set(n.id, []);
  outgoingEdges.set(n.id, []);
});

edges.forEach(e => {
  if (!nodeMap.has(e.source) || !nodeMap.has(e.target)) return;
  if (e.type === 'PARENT_CHILD') {
    const children = childrenMap.get(e.source) || [];
    children.push(e.target);
    childrenMap.set(e.source, children);
    parentMap.set(e.target, e.source);
  }
  const out = outgoingEdges.get(e.source);
  if (out) out.push(e);
  const inc = incomingEdges.get(e.target);
  if (inc) inc.push(e);
});

// ─── LAYOUT ENGINES ──────────────────────────────────────────────────────────

function getVisibleNodes() {
  return nodes.filter(n => !STATE.hidden.has(n.id));
}

function getVisibleEdges() {
  return edges.filter(e =>
    nodeMap.has(e.source) && nodeMap.has(e.target) &&
    !STATE.hidden.has(e.source) && !STATE.hidden.has(e.target)
  );
}

// DAG / Hierarchical Layout (Sugiyama-style)
function layoutDagre(isHorizontal) {
  const visible = getVisibleNodes();
  if (visible.length === 0) return;

  // Compute layers via topological sort
  const inDeg = new Map();
  const adjList = new Map();
  visible.forEach(n => { inDeg.set(n.id, 0); adjList.set(n.id, []); });

  const visibleEdges = getVisibleEdges().filter(e => e.type === 'IMPORTS' || e.type === 'PARENT_CHILD');
  visibleEdges.forEach(e => {
    if (adjList.has(e.source) && inDeg.has(e.target)) {
      adjList.get(e.source).push(e.target);
      inDeg.set(e.target, (inDeg.get(e.target) || 0) + 1);
    }
  });

  // BFS topological layers
  const layers = [];
  const layerMap = new Map();
  const queue = [];
  inDeg.forEach((deg, id) => { if (deg === 0) queue.push(id); });

  let assigned = new Set();
  while (queue.length > 0) {
    const layerNodes = [...queue];
    layers.push(layerNodes);
    queue.length = 0;
    for (const id of layerNodes) {
      assigned.add(id);
      layerMap.set(id, layers.length - 1);
      const neighbors = adjList.get(id) || [];
      for (const nb of neighbors) {
        if (assigned.has(nb)) continue;
        inDeg.set(nb, (inDeg.get(nb) || 0) - 1);
        if (inDeg.get(nb) <= 0 && !assigned.has(nb)) queue.push(nb);
      }
    }
  }

  // Assign unassigned nodes
  visible.forEach(n => {
    if (!assigned.has(n.id)) {
      layers.push([n.id]);
      layerMap.set(n.id, layers.length - 1);
    }
  });

  const gapX = isHorizontal ? 300 : STATE.nodeWidth + 80;
  const gapY = isHorizontal ? STATE.nodeHeight + 50 : 120;
  const startX = 100, startY = 100;

  layers.forEach((layer, li) => {
    layer.forEach((id, ni) => {
      const x = isHorizontal ? startX + li * gapX : startX + ni * gapX - (layer.length * gapX) / 2;
      const y = isHorizontal ? startY + ni * gapY - (layer.length * gapY) / 2 : startY + li * gapY;
      STATE.positions.set(id, { x, y });
    });
  });
}

// Force-Directed Layout (Barnes-Hut optimized)
function layoutForce() {
  const visible = getVisibleNodes();
  if (visible.length === 0) return;

  // Initialize positions in a circle
  const cx = W / 2, cy = H / 2, radius = Math.min(W, H) * 0.3;
  visible.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / visible.length;
    if (!STATE.positions.has(n.id) || !STATE.pinned.has(n.id)) {
      STATE.positions.set(n.id, {
        x: cx + radius * Math.cos(angle) + (Math.random() - 0.5) * 50,
        y: cy + radius * Math.sin(angle) + (Math.random() - 0.5) * 50,
        vx: 0, vy: 0
      });
    }
  });

  const visibleEdges = getVisibleEdges();
  const idSet = new Set(visible.map(n => n.id));

  // Run simulation iterations
  const iterations = Math.min(300, 50 + visible.length);
  const repulsion = 8000;
  const attraction = 0.005;
  const damping = 0.85;
  const minDist = 80;

  for (let iter = 0; iter < iterations; iter++) {
    const temp = 1 - iter / iterations;

    // Repulsive forces
    for (let i = 0; i < visible.length; i++) {
      const a = STATE.positions.get(visible[i].id);
      for (let j = i + 1; j < visible.length; j++) {
        const b = STATE.positions.get(visible[j].id);
        let dx = a.x - b.x, dy = a.y - b.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < minDist) dist = minDist;
        const force = repulsion / (dist * dist) * temp;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx = (a.vx || 0) + fx;
        a.vy = (a.vy || 0) + fy;
        b.vx = (b.vx || 0) - fx;
        b.vy = (b.vy || 0) - fy;
      }
    }

    // Attractive forces (edges)
    for (const e of visibleEdges) {
      if (!idSet.has(e.source) || !idSet.has(e.target)) continue;
      const a = STATE.positions.get(e.source);
      const b = STATE.positions.get(e.target);
      if (!a || !b) continue;
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = dist * attraction * temp;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx = (a.vx || 0) + fx;
      a.vy = (a.vy || 0) + fy;
      b.vx = (b.vx || 0) - fx;
      b.vy = (b.vy || 0) - fy;
    }

    // Apply velocities
    for (const n of visible) {
      if (STATE.pinned.has(n.id)) continue;
      const p = STATE.positions.get(n.id);
      p.vx = (p.vx || 0) * damping;
      p.vy = (p.vy || 0) * damping;
      p.x += p.vx;
      p.y += p.vy;
    }
  }
}

// Tree Layout
function layoutTree() {
  layoutDagre(false);
}

// Radial Layout
function layoutRadial() {
  const visible = getVisibleNodes();
  if (visible.length === 0) return;

  const cx = W / 2, cy = H / 2;

  // Find roots (no incoming IMPORTS edges)
  const hasIncoming = new Set();
  getVisibleEdges().forEach(e => {
    if (e.type === 'IMPORTS') hasIncoming.add(e.target);
  });

  const roots = visible.filter(n => !hasIncoming.has(n.id));
  if (roots.length === 0) roots.push(visible[0]);

  // BFS from roots to assign layers
  const layerMap = new Map();
  const queue = roots.map(r => ({ id: r.id, layer: 0 }));
  const visited = new Set();
  roots.forEach(r => { visited.add(r.id); layerMap.set(r.id, 0); });

  while (queue.length > 0) {
    const { id, layer } = queue.shift();
    const outE = outgoingEdges.get(id) || [];
    for (const e of outE) {
      if (!visited.has(e.target) && nodeMap.has(e.target) && !STATE.hidden.has(e.target)) {
        visited.add(e.target);
        layerMap.set(e.target, layer + 1);
        queue.push({ id: e.target, layer: layer + 1 });
      }
    }
  }

  // Unvisited nodes
  visible.forEach(n => {
    if (!visited.has(n.id)) layerMap.set(n.id, 1);
  });

  // Group by layer
  const layers = {};
  layerMap.forEach((l, id) => {
    if (!layers[l]) layers[l] = [];
    layers[l].push(id);
  });

  const maxLayer = Math.max(...Object.keys(layers).map(Number), 0);
  const ringGap = Math.min(W, H) * 0.15;

  Object.entries(layers).forEach(([layerIdx, ids]) => {
    const r = layerIdx == 0 ? 0 : Number(layerIdx) * ringGap + 100;
    ids.forEach((id, i) => {
      const angle = (2 * Math.PI * i) / ids.length - Math.PI / 2;
      STATE.positions.set(id, {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle)
      });
    });
  });
}

// Horizontal Layout
function layoutHorizontal() {
  layoutDagre(true);
}

function runLayout(type) {
  switch (type) {
    case 'dagre': layoutDagre(false); break;
    case 'force': layoutForce(); break;
    case 'tree': layoutTree(); break;
    case 'radial': layoutRadial(); break;
    case 'horizontal': layoutHorizontal(); break;
    default: layoutDagre(false);
  }
  render();
  updateMinimap();
}

// Auto-select best layout
function autoSelectLayout() {
  const n = nodes.length;
  const e = edges.length;
  const density = n > 0 ? e / n : 0;

  if (n <= 20) return 'dagre';
  if (density > 3) return 'force';
  if (n > 200) return 'force';
  return 'dagre';
}

// ─── RENDERING ───────────────────────────────────────────────────────────────

function worldToScreen(wx, wy) {
  return {
    x: (wx + STATE.offsetX) * STATE.zoom + W / 2,
    y: (wy + STATE.offsetY) * STATE.zoom + H / 2
  };
}

function screenToWorld(sx, sy) {
  return {
    x: (sx - W / 2) / STATE.zoom - STATE.offsetX,
    y: (sy - H / 2) / STATE.zoom - STATE.offsetY
  };
}

function isOnScreen(wx, wy, margin) {
  const s = worldToScreen(wx, wy);
  const m = margin || 300;
  return s.x > -m && s.x < W + m && s.y > -m && s.y < H + m;
}

function render() {
  ctx.clearRect(0, 0, W, H);

  // Background grid
  drawGrid();

  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(STATE.zoom, STATE.zoom);
  ctx.translate(STATE.offsetX, STATE.offsetY);

  // Draw edges
  const visibleEdges = getVisibleEdges();
  for (const e of visibleEdges) {
    drawEdge(e);
  }

  // Draw nodes
  const visible = getVisibleNodes();
  for (const n of visible) {
    const pos = STATE.positions.get(n.id);
    if (!pos) continue;
    if (!isOnScreen(pos.x, pos.y, STATE.nodeWidth * 2)) continue;
    drawNode(n, pos);
  }

  ctx.restore();
}

function drawGrid() {
  const gridSize = 40 * STATE.zoom;
  if (gridSize < 8) return; // too zoomed out

  const cs = getComputedStyle(document.documentElement);
  ctx.strokeStyle = cs.getPropertyValue('--grid-color').trim() || 'rgba(48,54,61,0.3)';
  ctx.lineWidth = 0.5;

  const offX = ((STATE.offsetX * STATE.zoom + W / 2) % gridSize + gridSize) % gridSize;
  const offY = ((STATE.offsetY * STATE.zoom + H / 2) % gridSize + gridSize) % gridSize;

  ctx.beginPath();
  for (let x = offX; x < W; x += gridSize) {
    ctx.moveTo(x, 0); ctx.lineTo(x, H);
  }
  for (let y = offY; y < H; y += gridSize) {
    ctx.moveTo(0, y); ctx.lineTo(W, y);
  }
  ctx.stroke();
}

function drawEdge(e) {
  const srcPos = STATE.positions.get(e.source);
  const tgtPos = STATE.positions.get(e.target);
  if (!srcPos || !tgtPos) return;

  const nw = STATE.nodeWidth, nh = STATE.nodeHeight;
  const sx = srcPos.x + nw / 2, sy = srcPos.y + nh;
  const tx = tgtPos.x + nw / 2, ty = tgtPos.y;

  ctx.beginPath();
  ctx.strokeStyle = e.color || '#8b949e';
  ctx.lineWidth = (STATE.hoveredNode && (e.source === STATE.hoveredNode.id || e.target === STATE.hoveredNode.id)) ? 2.5 : 1.2;
  ctx.globalAlpha = (STATE.searchTerm && !STATE.searchResults.find(r => r.id === e.source || r.id === e.target)) ? 0.1 : (
    STATE.selectedNode && e.source !== STATE.selectedNode.id && e.target !== STATE.selectedNode.id ? 0.2 : 0.8
  );

  // Dashed/dotted styles
  if (e.style === 'dashed') ctx.setLineDash([8, 4]);
  else if (e.style === 'dotted') ctx.setLineDash([3, 3]);
  else ctx.setLineDash([]);

  // Bezier curve
  const midY = (sy + ty) / 2;
  ctx.moveTo(sx, sy);
  ctx.bezierCurveTo(sx, midY, tx, midY, tx, ty);
  ctx.stroke();
  ctx.setLineDash([]);

  // Arrowhead
  const angle = Math.atan2(ty - midY, tx - tx) || Math.PI / 2;
  const arrowLen = 8;
  ctx.fillStyle = e.color || '#8b949e';
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - arrowLen * Math.cos(angle - 0.4), ty - arrowLen * Math.sin(angle - 0.4));
  ctx.lineTo(tx - arrowLen * Math.cos(angle + 0.4), ty - arrowLen * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawNode(n, pos) {
  const nw = STATE.nodeWidth, nh = STATE.nodeHeight;
  const x = pos.x, y = pos.y;

  const isSelected = STATE.selectedNode && STATE.selectedNode.id === n.id;
  const isHovered = STATE.hoveredNode && STATE.hoveredNode.id === n.id;
  const isSearchMatch = STATE.searchTerm && STATE.searchResults.find(r => r.id === n.id);
  const isDimmed = STATE.searchTerm && !isSearchMatch;

  ctx.globalAlpha = isDimmed ? 0.15 : 1;

  // Node shadow
  if (isSelected || isHovered) {
    ctx.shadowColor = n.color || '#58a6ff';
    ctx.shadowBlur = isSelected ? 20 : 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // Node background
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  ctx.fillStyle = isDark ? 'rgba(22, 27, 34, 0.95)' : 'rgba(255, 255, 255, 0.98)';
  if (isSelected) ctx.fillStyle = isDark ? 'rgba(30, 38, 50, 0.98)' : 'rgba(240, 245, 255, 0.98)';

  // Rounded rect
  roundRect(ctx, x, y, nw, nh, 10);
  ctx.fill();

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Border
  ctx.strokeStyle = isSelected ? (n.color || '#58a6ff') : (isHovered ? (n.color || '#58a6ff') : (isDark ? 'rgba(48,54,61,0.8)' : 'rgba(208,215,222,0.8)'));
  ctx.lineWidth = isSelected ? 2 : 1;
  roundRect(ctx, x, y, nw, nh, 10);
  ctx.stroke();

  // Left color bar
  ctx.fillStyle = n.color || '#58a6ff';
  roundRectLeft(ctx, x, y, 4, nh, 10);
  ctx.fill();

  // Icon
  ctx.font = '16px serif';
  ctx.fillText(n.icon || '📄', x + 14, y + 28);

  // Name
  ctx.font = '600 12px ' + (isDark ? 'Inter, sans-serif' : 'Inter, sans-serif');
  ctx.fillStyle = isDark ? '#e6edf3' : '#1f2328';
  const displayName = n.name.length > 22 ? n.name.substring(0, 20) + '…' : n.name;
  ctx.fillText(displayName, x + 36, y + 27);

  // Type label
  ctx.font = '500 10px Inter, sans-serif';
  ctx.fillStyle = n.color || '#8b949e';
  ctx.fillText(n.label || n.type, x + 36, y + 44);

  // Connection counts
  const inC = n.incomingCount || 0;
  const outC = n.outgoingCount || 0;
  ctx.font = '500 9px Inter, sans-serif';
  ctx.fillStyle = isDark ? '#6e7681' : '#8c959f';
  ctx.fillText('↓' + inC + ' ↑' + outC, x + nw - 48, y + 27);

  // Collapse indicator
  const children = childrenMap.get(n.id) || [];
  const hasConnections = (outgoingEdges.get(n.id) || []).length > 0;
  if (hasConnections) {
    const collapsed = STATE.collapsed.has(n.id);
    ctx.font = '10px sans-serif';
    ctx.fillStyle = isDark ? '#8b949e' : '#656d76';
    ctx.fillText(collapsed ? '▶ ' + (outgoingEdges.get(n.id) || []).length : '▼', x + nw - 20, y + 44);
  }

  ctx.globalAlpha = 1;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function roundRectLeft(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── HIT TESTING ─────────────────────────────────────────────────────────────

function nodeAtScreen(sx, sy) {
  const world = screenToWorld(sx, sy);
  const visible = getVisibleNodes();
  for (let i = visible.length - 1; i >= 0; i--) {
    const n = visible[i];
    const pos = STATE.positions.get(n.id);
    if (!pos) continue;
    if (world.x >= pos.x && world.x <= pos.x + STATE.nodeWidth &&
        world.y >= pos.y && world.y <= pos.y + STATE.nodeHeight) {
      return n;
    }
  }
  return null;
}

// ─── INTERACTIONS ────────────────────────────────────────────────────────────

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
  const hit = nodeAtScreen(sx, sy);

  if (hit && e.button === 0) {
    // Start dragging node
    const world = screenToWorld(sx, sy);
    const pos = STATE.positions.get(hit.id);
    STATE.dragNode = hit;
    STATE.dragNodeOffX = world.x - pos.x;
    STATE.dragNodeOffY = world.y - pos.y;
    wrap.classList.add('dragging');
  } else if (e.button === 0) {
    // Pan
    STATE.dragging = true;
    STATE.dragStartX = e.clientX;
    STATE.dragStartY = e.clientY;
    wrap.classList.add('dragging');
  }
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left, sy = e.clientY - rect.top;

  if (STATE.dragNode) {
    const world = screenToWorld(sx, sy);
    STATE.positions.set(STATE.dragNode.id, {
      x: world.x - STATE.dragNodeOffX,
      y: world.y - STATE.dragNodeOffY
    });
    STATE.pinned.add(STATE.dragNode.id);
    render();
    updateMinimap();
    return;
  }

  if (STATE.dragging) {
    const dx = e.clientX - STATE.dragStartX;
    const dy = e.clientY - STATE.dragStartY;
    STATE.offsetX += dx / STATE.zoom;
    STATE.offsetY += dy / STATE.zoom;
    STATE.dragStartX = e.clientX;
    STATE.dragStartY = e.clientY;
    render();
    updateMinimap();
    return;
  }

  // Hover
  const hit = nodeAtScreen(sx, sy);
  if (hit !== STATE.hoveredNode) {
    STATE.hoveredNode = hit;
    canvas.style.cursor = hit ? 'pointer' : 'grab';
    render();
  }
});

canvas.addEventListener('mouseup', (e) => {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left, sy = e.clientY - rect.top;

  if (STATE.dragNode) {
    // If barely moved, treat as click
    STATE.dragNode = null;
    wrap.classList.remove('dragging');
    return;
  }

  if (STATE.dragging) {
    STATE.dragging = false;
    wrap.classList.remove('dragging');
    return;
  }
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
  const hit = nodeAtScreen(sx, sy);
  if (hit) {
    selectNode(hit);
  } else {
    deselectNode();
  }
  hideContextMenu();
});

canvas.addEventListener('dblclick', (e) => {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
  const hit = nodeAtScreen(sx, sy);
  if (hit) {
    toggleCollapse(hit.id);
  }
});

// Zoom
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
  const newZoom = Math.max(0.05, Math.min(5, STATE.zoom * zoomFactor));

  // Zoom toward mouse position
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;
  const wx = (mx - W / 2) / STATE.zoom - STATE.offsetX;
  const wy = (my - H / 2) / STATE.zoom - STATE.offsetY;

  STATE.zoom = newZoom;
  STATE.offsetX = (mx - W / 2) / STATE.zoom - wx;
  STATE.offsetY = (my - H / 2) / STATE.zoom - wy;

  render();
  updateMinimap();
}, { passive: false });

// Context menu
canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
  const hit = nodeAtScreen(sx, sy);
  if (hit) {
    selectNode(hit);
    showContextMenu(e.clientX, e.clientY, hit);
  }
});

// ─── SELECTION & DETAILS ─────────────────────────────────────────────────────

function selectNode(n) {
  STATE.selectedNode = n;
  showDetailPanel(n);
  render();
}

function deselectNode() {
  STATE.selectedNode = null;
  document.getElementById('detailPanel').classList.remove('open');
  render();
}

function showDetailPanel(n) {
  const panel = document.getElementById('detailPanel');
  const content = document.getElementById('detailContent');

  const incoming = (incomingEdges.get(n.id) || []);
  const outgoing = (outgoingEdges.get(n.id) || []);

  let html = '<div class="detail-header">';
  html += '<div class="detail-icon">' + esc(n.icon || '📄') + '</div>';
  html += '<div class="detail-name">' + esc(n.name) + '</div>';
  html += '<div class="detail-path">' + esc(n.filePath || n.id) + '</div>';
  html += '<div class="detail-badges">';
  html += '<span class="badge badge-type">' + esc(n.icon + ' ' + (n.label || n.type)) + '</span>';
  if (n.language) html += '<span class="badge badge-lang">' + esc(n.language) + '</span>';
  if (n.framework) html += '<span class="badge badge-fw">' + esc(n.framework) + '</span>';
  (n.badges || []).forEach(b => { html += '<span class="badge badge-fw">' + esc(b) + '</span>'; });
  html += '</div></div>';

  // Tabs
  html += '<div class="detail-tabs">';
  html += '<div class="detail-tab active" data-tab="info">Info</div>';
  html += '<div class="detail-tab" data-tab="connections">Connections (' + (incoming.length + outgoing.length) + ')</div>';
  html += '<div class="detail-tab" data-tab="raw">Raw</div>';
  html += '</div>';

  // Info Tab
  html += '<div class="tab-pane active" id="pane-info">';
  html += '<div class="detail-section"><h3>📊 Metrics</h3><div class="detail-grid">';
  const meta = n.metadata || {};
  html += '<div class="detail-stat"><div class="label">Size</div><div class="value">' + formatSize(meta.size || 0) + '</div></div>';
  html += '<div class="detail-stat"><div class="label">Lines</div><div class="value">' + (meta.lines || 0).toLocaleString() + '</div></div>';
  html += '<div class="detail-stat"><div class="label">Incoming</div><div class="value">' + incoming.length + '</div></div>';
  html += '<div class="detail-stat"><div class="label">Outgoing</div><div class="value">' + outgoing.length + '</div></div>';
  html += '</div></div>';

  if (n.description) {
    html += '<div class="detail-section"><h3>📝 Description</h3><div style="font-size:0.82rem;color:var(--text-secondary);">' + esc(n.description) + '</div></div>';
  }

  if (meta.exports && meta.exports.length > 0) {
    html += '<div class="detail-section"><h3>📤 Exports (' + meta.exports.length + ')</h3>';
    meta.exports.slice(0, 15).forEach(ex => { html += '<div class="conn-item" style="cursor:default;"><span class="conn-dot" style="background:var(--success);"></span><span class="conn-name" style="font-family:var(--font-mono);font-size:0.78rem;">' + esc(ex) + '</span></div>'; });
    if (meta.exports.length > 15) html += '<div style="font-size:0.75rem;color:var(--text-muted);padding:4px 0;">...and ' + (meta.exports.length - 15) + ' more</div>';
    html += '</div>';
  }
  html += '</div>';

  // Connections Tab
  html += '<div class="tab-pane" id="pane-connections">';
  if (incoming.length > 0) {
    html += '<div class="detail-section"><h3>↓ Incoming (' + incoming.length + ')</h3><ul class="conn-list">';
    incoming.slice(0, 30).forEach(e => {
      const src = nodeMap.get(e.source);
      html += '<li class="conn-item" data-node="' + esc(e.source) + '"><span class="conn-dot" style="background:' + esc(e.color || '#8b949e') + ';"></span><span class="conn-name">' + esc(src ? src.name : e.source) + '</span><span class="conn-type">' + esc(e.label || e.type) + '</span></li>';
    });
    html += '</ul></div>';
  }
  if (outgoing.length > 0) {
    html += '<div class="detail-section"><h3>↑ Outgoing (' + outgoing.length + ')</h3><ul class="conn-list">';
    outgoing.slice(0, 30).forEach(e => {
      const tgt = nodeMap.get(e.target);
      html += '<li class="conn-item" data-node="' + esc(e.target) + '"><span class="conn-dot" style="background:' + esc(e.color || '#8b949e') + ';"></span><span class="conn-name">' + esc(tgt ? tgt.name : e.target) + '</span><span class="conn-type">' + esc(e.label || e.type) + '</span></li>';
    });
    html += '</ul></div>';
  }
  if (incoming.length === 0 && outgoing.length === 0) {
    html += '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.85rem;">No connections found</div>';
  }
  html += '</div>';

  // Raw Tab
  html += '<div class="tab-pane" id="pane-raw"><div class="detail-section"><pre style="background:var(--bg-panel-2);border:1px solid var(--border-light);border-radius:var(--radius-sm);padding:12px;font-size:0.72rem;font-family:var(--font-mono);overflow:auto;max-height:400px;color:var(--text-secondary);line-height:1.5;">' + esc(JSON.stringify(n, null, 2)) + '</pre></div></div>';

  content.innerHTML = html;
  panel.classList.add('open');

  // Tab switching
  content.querySelectorAll('.detail-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      content.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
      content.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('pane-' + tab.dataset.tab).classList.add('active');
    });
  });

  // Connection clicks
  content.querySelectorAll('.conn-item[data-node]').forEach(item => {
    item.addEventListener('click', () => {
      const targetNode = nodeMap.get(item.dataset.node);
      if (targetNode) {
        selectNode(targetNode);
        centerOnNode(targetNode.id);
      }
    });
  });
}

document.getElementById('detailClose').addEventListener('click', deselectNode);

function formatSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ─── EXPAND / COLLAPSE ──────────────────────────────────────────────────────

function toggleCollapse(nodeId) {
  pushHistory();
  if (STATE.collapsed.has(nodeId)) {
    STATE.collapsed.delete(nodeId);
  } else {
    STATE.collapsed.add(nodeId);
  }
  updateHiddenNodes();
  render();
  toast(STATE.collapsed.has(nodeId) ? 'Collapsed' : 'Expanded');
}

function expandAll() {
  pushHistory();
  STATE.collapsed.clear();
  updateHiddenNodes();
  render();
  toast('All nodes expanded');
}

function collapseAll() {
  pushHistory();
  nodes.forEach(n => {
    const out = outgoingEdges.get(n.id) || [];
    if (out.length > 0) STATE.collapsed.add(n.id);
  });
  updateHiddenNodes();
  render();
  toast('All nodes collapsed');
}

function updateHiddenNodes() {
  STATE.hidden.clear();
  // For collapsed nodes, hide their targets (downstream connections)
  // Simple approach: if a node is collapsed, hide nodes only reachable through it
  // For now, we don't auto-hide — collapsed just changes the visual indicator
  // This keeps all nodes visible but shows collapse state
}

// ─── CONTEXT MENU ────────────────────────────────────────────────────────────

function showContextMenu(x, y, node) {
  const menu = document.getElementById('contextMenu');
  const isCollapsed = STATE.collapsed.has(node.id);
  const isPinned = STATE.pinned.has(node.id);

  menu.innerHTML = [
    { icon: isCollapsed ? '⊞' : '⊟', label: isCollapsed ? 'Expand' : 'Collapse', action: 'toggle', key: 'E/C' },
    { icon: '⊞', label: 'Expand All Children', action: 'expandAll' },
    { icon: '⊟', label: 'Collapse All Children', action: 'collapseAll' },
    'sep',
    { icon: '🎯', label: 'Center on Node', action: 'center' },
    { icon: isPinned ? '📌' : '📍', label: isPinned ? 'Unpin Node' : 'Pin Node', action: 'pin' },
    'sep',
    { icon: '📋', label: 'Copy Path', action: 'copyPath' },
    { icon: '📷', label: 'Export as PNG', action: 'exportPng', key: 'Ctrl+S' },
  ].map(item => {
    if (item === 'sep') return '<div class="ctx-sep"></div>';
    return '<div class="ctx-item" data-action="' + item.action + '"><span class="icon">' + item.icon + '</span>' + item.label + (item.key ? '<span class="shortcut">' + item.key + '</span>' : '') + '</div>';
  }).join('');

  menu.style.left = Math.min(x, W - 220) + 'px';
  menu.style.top = Math.min(y, H - 300) + 'px';
  menu.style.display = 'block';

  menu.querySelectorAll('.ctx-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      if (action === 'toggle') toggleCollapse(node.id);
      else if (action === 'expandAll') expandAll();
      else if (action === 'collapseAll') collapseAll();
      else if (action === 'center') centerOnNode(node.id);
      else if (action === 'pin') { STATE.pinned.has(node.id) ? STATE.pinned.delete(node.id) : STATE.pinned.add(node.id); render(); toast(STATE.pinned.has(node.id) ? 'Node pinned' : 'Node unpinned'); }
      else if (action === 'copyPath') { navigator.clipboard.writeText(node.filePath || node.id); toast('Path copied!'); }
      else if (action === 'exportPng') exportPNG();
      hideContextMenu();
    });
  });
}

function hideContextMenu() {
  document.getElementById('contextMenu').style.display = 'none';
}
document.addEventListener('click', hideContextMenu);

// ─── SEARCH ──────────────────────────────────────────────────────────────────

const searchBox = document.getElementById('searchBox');
const searchCount = document.getElementById('searchCount');

searchBox.addEventListener('input', () => {
  STATE.searchTerm = searchBox.value.trim().toLowerCase();
  if (STATE.searchTerm) {
    STATE.searchResults = nodes.filter(n =>
      n.name.toLowerCase().includes(STATE.searchTerm) ||
      (n.filePath && n.filePath.toLowerCase().includes(STATE.searchTerm)) ||
      (n.type && n.type.toLowerCase().includes(STATE.searchTerm)) ||
      (n.label && n.label.toLowerCase().includes(STATE.searchTerm)) ||
      (n.language && n.language.toLowerCase().includes(STATE.searchTerm))
    );
    searchCount.textContent = STATE.searchResults.length + ' found';
    if (STATE.searchResults.length > 0) {
      selectNode(STATE.searchResults[0]);
      centerOnNode(STATE.searchResults[0].id);
    }
  } else {
    STATE.searchResults = [];
    searchCount.textContent = '';
  }
  render();
});

// ─── FIT VIEW ────────────────────────────────────────────────────────────────

function fitView() {
  const visible = getVisibleNodes();
  if (visible.length === 0) return;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of visible) {
    const pos = STATE.positions.get(n.id);
    if (!pos) continue;
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + STATE.nodeWidth);
    maxY = Math.max(maxY, pos.y + STATE.nodeHeight);
  }

  const graphW = maxX - minX + 100;
  const graphH = maxY - minY + 100;
  const scaleX = W / graphW;
  const scaleY = H / graphH;
  STATE.zoom = Math.max(0.05, Math.min(2, Math.min(scaleX, scaleY) * 0.85));

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  STATE.offsetX = -cx;
  STATE.offsetY = -cy;

  render();
  updateMinimap();
}

function centerOnNode(nodeId) {
  const pos = STATE.positions.get(nodeId);
  if (!pos) return;
  STATE.offsetX = -(pos.x + STATE.nodeWidth / 2);
  STATE.offsetY = -(pos.y + STATE.nodeHeight / 2);
  render();
  updateMinimap();
}

// ─── MINIMAP ─────────────────────────────────────────────────────────────────

const minimapCanvas = document.getElementById('minimapCanvas');
const minimapCtx = minimapCanvas.getContext('2d');
const minimapEl = document.getElementById('minimap');
const viewportRect = document.getElementById('viewportRect');

function updateMinimap() {
  const mW = minimapEl.clientWidth;
  const mH = minimapEl.clientHeight;
  const dpr2 = window.devicePixelRatio || 1;
  minimapCanvas.width = mW * dpr2;
  minimapCanvas.height = mH * dpr2;
  minimapCtx.setTransform(dpr2, 0, 0, dpr2, 0, 0);
  minimapCtx.clearRect(0, 0, mW, mH);

  const visible = getVisibleNodes();
  if (visible.length === 0) return;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of visible) {
    const pos = STATE.positions.get(n.id);
    if (!pos) continue;
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + STATE.nodeWidth);
    maxY = Math.max(maxY, pos.y + STATE.nodeHeight);
  }

  const graphW = maxX - minX + 50 || 1;
  const graphH = maxY - minY + 50 || 1;
  const scale = Math.min(mW / graphW, mH / graphH) * 0.9;
  const offsetX = (mW - graphW * scale) / 2;
  const offsetY = (mH - graphH * scale) / 2;

  // Draw edges
  const visibleEdges = getVisibleEdges();
  minimapCtx.strokeStyle = 'rgba(139,148,158,0.3)';
  minimapCtx.lineWidth = 0.5;
  for (const e of visibleEdges) {
    const sp = STATE.positions.get(e.source);
    const tp = STATE.positions.get(e.target);
    if (!sp || !tp) continue;
    minimapCtx.beginPath();
    minimapCtx.moveTo((sp.x - minX + STATE.nodeWidth / 2) * scale + offsetX, (sp.y - minY + STATE.nodeHeight / 2) * scale + offsetY);
    minimapCtx.lineTo((tp.x - minX + STATE.nodeWidth / 2) * scale + offsetX, (tp.y - minY + STATE.nodeHeight / 2) * scale + offsetY);
    minimapCtx.stroke();
  }

  // Draw nodes
  for (const n of visible) {
    const pos = STATE.positions.get(n.id);
    if (!pos) continue;
    minimapCtx.fillStyle = n.color || '#58a6ff';
    minimapCtx.globalAlpha = 0.8;
    minimapCtx.fillRect(
      (pos.x - minX) * scale + offsetX,
      (pos.y - minY) * scale + offsetY,
      Math.max(STATE.nodeWidth * scale, 3),
      Math.max(STATE.nodeHeight * scale, 2)
    );
  }
  minimapCtx.globalAlpha = 1;

  // Viewport rectangle
  const vpLeft = (-STATE.offsetX - W / 2 / STATE.zoom);
  const vpTop = (-STATE.offsetY - H / 2 / STATE.zoom);
  const vpW = W / STATE.zoom;
  const vpH = H / STATE.zoom;

  viewportRect.style.left = ((vpLeft - minX) * scale + offsetX) + 'px';
  viewportRect.style.top = ((vpTop - minY) * scale + offsetY) + 'px';
  viewportRect.style.width = (vpW * scale) + 'px';
  viewportRect.style.height = (vpH * scale) + 'px';

  // Store for minimap click navigation
  minimapEl._graphBounds = { minX, minY, graphW, graphH, scale, offsetX, offsetY };
}

minimapCanvas.addEventListener('click', (e) => {
  const rect = minimapEl.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;
  const b = minimapEl._graphBounds;
  if (!b) return;

  const wx = (mx - b.offsetX) / b.scale + b.minX;
  const wy = (my - b.offsetY) / b.scale + b.minY;
  STATE.offsetX = -wx;
  STATE.offsetY = -wy;
  render();
  updateMinimap();
});

document.getElementById('minimapClose').addEventListener('click', () => {
  minimapEl.style.display = minimapEl.style.display === 'none' ? 'block' : 'none';
});

// ─── LEGEND ──────────────────────────────────────────────────────────────────

function buildLegend() {
  const legendBody = document.getElementById('legendBody');
  let html = '';

  // Node types
  const usedTypes = GRAPH.nodeTypes || {};
  if (Object.keys(usedTypes).length > 0) {
    html += '<div class="legend-group"><div class="legend-group-title">Node Types</div>';
    for (const [key, info] of Object.entries(usedTypes)) {
      html += '<div class="legend-item" data-type="' + key + '"><div class="legend-color" style="background:' + esc(info.color || '#8b949e') + ';"></div>' + esc(info.icon + ' ' + info.label) + '</div>';
    }
    html += '</div>';
  }

  // Edge types
  const usedEdgeTypes = GRAPH.relationshipTypes || {};
  if (Object.keys(usedEdgeTypes).length > 0) {
    html += '<div class="legend-group"><div class="legend-group-title">Relationships</div>';
    for (const [key, info] of Object.entries(usedEdgeTypes)) {
      const lineClass = info.style === 'dashed' ? 'dashed' : info.style === 'dotted' ? 'dotted' : '';
      html += '<div class="legend-item" data-edge="' + key + '"><div class="legend-line ' + lineClass + '" style="background:' + esc(info.color || '#8b949e') + ';' + (lineClass ? 'border-color:' + esc(info.color || '#8b949e') : '') + '"></div>' + esc(info.label) + '</div>';
    }
    html += '</div>';
  }

  legendBody.innerHTML = html;
}

document.getElementById('legendToggle').addEventListener('click', () => {
  const legend = document.getElementById('legend');
  legend.classList.toggle('collapsed');
  document.getElementById('legendArrow').textContent = legend.classList.contains('collapsed') ? '▶' : '▼';
});

// ─── TOOLBAR ACTIONS ─────────────────────────────────────────────────────────

document.getElementById('layoutSelect').addEventListener('change', (e) => {
  runLayout(e.target.value);
  fitView();
});

document.getElementById('btnExpandAll').addEventListener('click', expandAll);
document.getElementById('btnCollapseAll').addEventListener('click', collapseAll);
document.getElementById('btnFitView').addEventListener('click', fitView);

document.getElementById('btnTheme').addEventListener('click', () => {
  const theme = document.documentElement.getAttribute('data-theme');
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  document.getElementById('btnTheme').querySelector('.icon').textContent = newTheme === 'dark' ? '🌙' : '☀️';
  render();
  updateMinimap();
});

document.getElementById('btnFullscreen').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
});

document.getElementById('btnHelp').addEventListener('click', () => {
  document.getElementById('kbdModal').classList.toggle('show');
});

document.getElementById('btnExport').addEventListener('click', exportPNG);
document.getElementById('btnExportJSON').addEventListener('click', exportJSON);

function exportPNG() {
  const link = document.createElement('a');
  link.download = (GRAPH.projectName || 'graph') + '_code_graph.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  toast('PNG exported!');
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(GRAPH, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = (GRAPH.projectName || 'graph') + '_code_graph.json';
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
  toast('JSON exported!');
}

// ─── UNDO / REDO ─────────────────────────────────────────────────────────────

function pushHistory() {
  const snapshot = {
    collapsed: new Set(STATE.collapsed),
    hidden: new Set(STATE.hidden),
    positions: new Map(STATE.positions),
  };
  STATE.history = STATE.history.slice(0, STATE.historyIndex + 1);
  STATE.history.push(snapshot);
  STATE.historyIndex = STATE.history.length - 1;
}

function undo() {
  if (STATE.historyIndex <= 0) return;
  STATE.historyIndex--;
  restoreHistory();
  toast('Undo');
}

function redo() {
  if (STATE.historyIndex >= STATE.history.length - 1) return;
  STATE.historyIndex++;
  restoreHistory();
  toast('Redo');
}

function restoreHistory() {
  const snap = STATE.history[STATE.historyIndex];
  if (!snap) return;
  STATE.collapsed = new Set(snap.collapsed);
  STATE.hidden = new Set(snap.hidden);
  STATE.positions = new Map(snap.positions);
  render();
  updateMinimap();
}

document.getElementById('btnUndo').addEventListener('click', undo);
document.getElementById('btnRedo').addEventListener('click', redo);

// ─── KEYBOARD SHORTCUTS ─────────────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
  // Ignore if typing in input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    if (e.key === 'Escape') { e.target.blur(); return; }
    return;
  }

  if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
    e.preventDefault();
    document.getElementById('kbdModal').classList.toggle('show');
  }
  if (e.key === 'Escape') {
    document.getElementById('kbdModal').classList.remove('show');
    deselectNode();
    hideContextMenu();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
    searchBox.focus();
  }
  if (e.key === '+' || e.key === '=') {
    STATE.zoom = Math.min(5, STATE.zoom * 1.15);
    render(); updateMinimap();
  }
  if (e.key === '-') {
    STATE.zoom = Math.max(0.05, STATE.zoom * 0.85);
    render(); updateMinimap();
  }
  if (e.key === '0') { fitView(); }
  if (e.key === 'f' && !e.ctrlKey) {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  }
  if (e.key === 'e' && STATE.selectedNode) { toggleCollapse(STATE.selectedNode.id); }
  if (e.key === 'c' && STATE.selectedNode && !e.ctrlKey) {
    if (!STATE.collapsed.has(STATE.selectedNode.id)) toggleCollapse(STATE.selectedNode.id);
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); exportPNG(); }
});

// ─── TOAST ───────────────────────────────────────────────────────────────────

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2000);
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ─── INIT ────────────────────────────────────────────────────────────────────

function init() {
  resizeCanvas();

  // Auto-select layout
  const bestLayout = autoSelectLayout();
  document.getElementById('layoutSelect').value = bestLayout;

  // Run layout
  runLayout(bestLayout);

  // Fit view
  setTimeout(() => {
    fitView();
    buildLegend();
    pushHistory();
  }, 100);
}

init();

})();
</script>
</body>
</html>`;
}

module.exports = { toGraphVisualizerHtml };
