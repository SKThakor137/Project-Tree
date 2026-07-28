/**
 * 3D Interactive Graph Visualizer — Standalone HTML Generator
 *
 * Generates a single self-contained HTML file with an interactive 3D
 * force-directed code relationship graph using 3d-force-graph (CDN).
 *
 * Features:
 * - 3D force-directed layout with Three.js (via 3d-force-graph)
 * - Color-coded spheres per node type with billboard text labels
 * - Directional animated particles on edges showing data flow
 * - Glassmorphism sidebar with node info & connections
 * - Smooth camera focus animation on node click
 * - Search, legend, dark/light theme toggle
 * - OrbitControls: left-drag rotate, right-drag pan, scroll zoom
 */
'use strict';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * Generate a self-contained interactive 3D HTML visualization.
 * @param {Object} graphModel - Universal Graph Model from generateUniversalGraph()
 * @param {string} [projectName] - Project name for title
 * @returns {string} Complete HTML string
 */
function toGraph3dVisualizerHtml(graphModel, projectName) {
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
  <title>${esc(name)} — 3D Code Relationship Graph</title>
  <meta name="description" content="Interactive 3D code architecture visualization for ${esc(name)}">
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
  --purple: #bc8cff;
  --pink: #f778ba;
  --glass-bg: rgba(22, 27, 34, 0.88);
  --glass-border: rgba(255,255,255,0.08);
  --glass-blur: blur(20px);
  --fog-color: #0a0e14;
  --particle-color: #58a6ff;
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
  --purple: #8250df;
  --pink: #bf3989;
  --glass-bg: rgba(255, 255, 255, 0.88);
  --glass-border: rgba(0,0,0,0.08);
  --glass-blur: blur(20px);
  --fog-color: #ffffff;
  --particle-color: #0969da;
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
   3D GRAPH CONTAINER
   ═══════════════════════════════════════════════════════════════════════════ */
#graph3d-container {
  position: fixed; top: 56px; left: 0; right: 0; bottom: 0;
  background: var(--bg-canvas); overflow: hidden;
}

/* ═══════════════════════════════════════════════════════════════════════════
   DETAIL PANEL (RIGHT SIDEBAR)
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
  color: var(--text-secondary); cursor: default; transition: var(--transition);
}
.legend-color { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.legend-line { width: 20px; height: 2px; flex-shrink: 0; border-radius: 1px; }
.legend-line.dashed { background: none; border-top: 2px dashed; }
.legend-line.dotted { background: none; border-top: 2px dotted; }

/* ═══════════════════════════════════════════════════════════════════════════
   STATS BAR
   ═══════════════════════════════════════════════════════════════════════════ */
#statsBar {
  position: fixed; bottom: 16px; right: 16px;
  background: var(--glass-bg); backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border); border-radius: var(--radius);
  padding: 8px 14px; z-index: 80; font-size: 0.72rem; color: var(--text-muted);
  display: flex; gap: 16px; box-shadow: var(--shadow-sm);
}
#statsBar .stat-item { display: flex; align-items: center; gap: 4px; }
#statsBar .stat-value { font-weight: 600; color: var(--text-secondary); }

/* ═══════════════════════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS MODAL
   ═══════════════════════════════════════════════════════════════════════════ */
#shortcutsModal {
  display: none; position: fixed; inset: 0; z-index: 300;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
  align-items: center; justify-content: center;
}
#shortcutsModal.open { display: flex; }
#shortcutsModal .modal-content {
  background: var(--bg-panel); border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 24px; max-width: 420px; width: 90%; max-height: 80vh; overflow-y: auto;
  box-shadow: var(--shadow);
}
#shortcutsModal h2 { font-size: 1.1rem; margin-bottom: 16px; }
.shortcut-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 0; font-size: 0.82rem; color: var(--text-secondary);
}
.shortcut-key {
  padding: 2px 8px; background: var(--bg-panel-2); border: 1px solid var(--border);
  border-radius: 4px; font-family: var(--font-mono); font-size: 0.75rem; color: var(--text);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCROLLBAR
   ═══════════════════════════════════════════════════════════════════════════ */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

/* ═══════════════════════════════════════════════════════════════════════════
   TOOLTIP
   ═══════════════════════════════════════════════════════════════════════════ */
#tooltip3d {
  position: fixed; z-index: 150; pointer-events: none;
  background: var(--glass-bg); backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border); border-radius: var(--radius-sm);
  padding: 6px 12px; font-size: 0.78rem; color: var(--text);
  box-shadow: var(--shadow-sm); display: none; white-space: nowrap;
  max-width: 300px;
}
#tooltip3d .tip-name { font-weight: 600; margin-bottom: 2px; }
#tooltip3d .tip-type { font-size: 0.7rem; color: var(--text-muted); }
  </style>
</head>
<body>

<!-- ═══════════ TOOLBAR ═══════════ -->
<div id="toolbar">
  <div class="toolbar-brand"><span>🌐</span> ${esc(name)}</div>
  <div class="toolbar-sep"></div>
  <div class="search-wrap">
    <input type="text" id="searchBox" placeholder="Search nodes..." autocomplete="off">
    <span class="search-results-count" id="searchCount"></span>
  </div>
  <div class="toolbar-sep"></div>
  <button class="tb-btn" id="btnResetView" title="Reset camera"><span class="icon">🎯</span> Reset</button>
  <button class="tb-btn" id="btnToggleLabels" title="Toggle labels"><span class="icon">🏷️</span> Labels</button>
  <button class="tb-btn" id="btnToggleParticles" title="Toggle particles"><span class="icon">✨</span> Particles</button>
  <div class="toolbar-right">
    <button class="tb-btn" id="btnShortcuts" title="Keyboard shortcuts"><span class="icon">⌨️</span></button>
    <button class="tb-btn" id="btnTheme" title="Toggle theme"><span class="icon">🌙</span></button>
    <button class="tb-btn" id="btnFullscreen" title="Fullscreen"><span class="icon">⛶</span></button>
  </div>
</div>

<!-- ═══════════ 3D GRAPH CONTAINER ═══════════ -->
<div id="graph3d-container"></div>

<!-- ═══════════ DETAIL PANEL ═══════════ -->
<div id="detailPanel">
  <button class="close-btn" id="closePanel" title="Close">✕</button>
  <div id="detailContent"></div>
</div>

<!-- ═══════════ LEGEND ═══════════ -->
<div id="legend">
  <div class="legend-header" id="legendToggle">
    <span>🗂️ Legend</span>
    <span id="legendArrow">▼</span>
  </div>
  <div class="legend-body" id="legendBody"></div>
</div>

<!-- ═══════════ STATS BAR ═══════════ -->
<div id="statsBar">
  <div class="stat-item"><span>📊</span> Nodes: <span class="stat-value" id="statNodes">0</span></div>
  <div class="stat-item"><span>🔗</span> Edges: <span class="stat-value" id="statEdges">0</span></div>
  <div class="stat-item"><span>📂</span> Languages: <span class="stat-value" id="statLangs">0</span></div>
</div>

<!-- ═══════════ TOOLTIP ═══════════ -->
<div id="tooltip3d">
  <div class="tip-name" id="tipName"></div>
  <div class="tip-type" id="tipType"></div>
</div>

<!-- ═══════════ SHORTCUTS MODAL ═══════════ -->
<div id="shortcutsModal">
  <div class="modal-content">
    <h2>⌨️ Keyboard Shortcuts</h2>
    <div class="shortcut-row"><span>Reset camera</span><span class="shortcut-key">R</span></div>
    <div class="shortcut-row"><span>Toggle labels</span><span class="shortcut-key">L</span></div>
    <div class="shortcut-row"><span>Toggle particles</span><span class="shortcut-key">P</span></div>
    <div class="shortcut-row"><span>Focus search</span><span class="shortcut-key">/</span></div>
    <div class="shortcut-row"><span>Toggle theme</span><span class="shortcut-key">T</span></div>
    <div class="shortcut-row"><span>Toggle legend</span><span class="shortcut-key">G</span></div>
    <div class="shortcut-row"><span>Fullscreen</span><span class="shortcut-key">F</span></div>
    <div class="shortcut-row"><span>Close panel / modal</span><span class="shortcut-key">Esc</span></div>
    <br>
    <div class="shortcut-row"><span>Rotate</span><span class="shortcut-key">Left Drag</span></div>
    <div class="shortcut-row"><span>Pan</span><span class="shortcut-key">Right Drag</span></div>
    <div class="shortcut-row"><span>Zoom</span><span class="shortcut-key">Scroll</span></div>
    <div class="shortcut-row"><span>Select node</span><span class="shortcut-key">Click</span></div>
    <br>
    <button class="tb-btn" onclick="document.getElementById('shortcutsModal').classList.remove('open')" style="width:100%;justify-content:center;">Close</button>
  </div>
</div>

<!-- ═══════════ CDN SCRIPTS ═══════════ -->
<script src="https://unpkg.com/3d-force-graph@1"></script>

<script>
// ═══════════════════════════════════════════════════════════════════════════
// DATA INJECTION
// ═══════════════════════════════════════════════════════════════════════════
const RAW_MODEL = ${graphData};

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════
let showLabels = true;
let showParticles = true;
let selectedNode = null;
let highlightNodes = new Set();
let highlightLinks = new Set();
let hoverNode = null;

// Build node map for quick lookup
const nodeMap = {};
RAW_MODEL.nodes.forEach(n => { nodeMap[n.id] = n; });

// Prepare 3d-force-graph data format
const graphNodes = RAW_MODEL.nodes.map(n => ({
  id: n.id,
  name: n.name,
  type: n.type,
  icon: n.icon,
  label: n.label,
  color: n.color,
  filePath: n.filePath,
  language: n.language || '',
  framework: n.framework || '',
  description: n.description || '',
  badges: n.badges || [],
  status: n.status || 'active',
  metadata: n.metadata || {},
  incomingCount: n.incomingCount || 0,
  outgoingCount: n.outgoingCount || 0,
  // val controls sphere size
  val: Math.max(2, (n.incomingCount || 0) + (n.outgoingCount || 0) + 1),
}));

const graphLinks = RAW_MODEL.edges.map(e => ({
  source: e.source,
  target: e.target,
  type: e.type,
  label: e.label,
  color: e.color,
  style: e.style,
  weight: e.weight || 1,
  metadata: e.metadata || {},
}));

// Build adjacency for sidebar connections
const incomingMap = {};  // nodeId -> [{source, type, color}]
const outgoingMap = {};  // nodeId -> [{target, type, color}]
graphLinks.forEach(e => {
  const src = typeof e.source === 'object' ? e.source.id : e.source;
  const tgt = typeof e.target === 'object' ? e.target.id : e.target;
  if (!outgoingMap[src]) outgoingMap[src] = [];
  outgoingMap[src].push({ target: tgt, type: e.label || e.type, color: e.color });
  if (!incomingMap[tgt]) incomingMap[tgt] = [];
  incomingMap[tgt].push({ source: src, type: e.label || e.type, color: e.color });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3D GRAPH INIT
// ═══════════════════════════════════════════════════════════════════════════
const container = document.getElementById('graph3d-container');
const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

const Graph = ForceGraph3D()(container)
  .graphData({ nodes: graphNodes, links: graphLinks })
  .backgroundColor(isDark() ? '#0a0e14' : '#ffffff')
  .showNavInfo(false)
  .width(container.offsetWidth)
  .height(container.offsetHeight)
  // ─── Nodes ───
  .nodeVal(n => n.val)
  .nodeColor(n => {
    if (highlightNodes.size > 0 && !highlightNodes.has(n)) return isDark() ? '#1c2128' : '#d0d7de';
    return n.color;
  })
  .nodeOpacity(0.92)
  .nodeResolution(16)
  .nodeLabel(() => '') // We use custom tooltip instead
  .nodeThreeObjectExtend(true)
  .nodeThreeObject(n => {
    if (!showLabels) return undefined;
    // Create text sprite label
    const THREE = Graph.three();
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createTextTexture(n.name, n.color),
        transparent: true,
        depthWrite: false,
      })
    );
    const scale = Math.max(6, 3 + n.val * 0.5);
    sprite.scale.set(scale * 4, scale, 1);
    sprite.position.set(0, Math.max(4, 2 + n.val * 0.3), 0);
    sprite.renderOrder = 999;
    return sprite;
  })
  // ─── Links ───
  .linkColor(l => {
    if (highlightLinks.size > 0 && !highlightLinks.has(l)) return isDark() ? 'rgba(48,54,61,0.15)' : 'rgba(208,215,222,0.15)';
    return l.color || (isDark() ? 'rgba(139,148,158,0.4)' : 'rgba(101,109,118,0.4)');
  })
  .linkWidth(l => highlightLinks.has(l) ? 2 : 0.5)
  .linkOpacity(0.6)
  .linkDirectionalParticles(l => showParticles ? (highlightLinks.has(l) ? 6 : 2) : 0)
  .linkDirectionalParticleWidth(l => highlightLinks.has(l) ? 2.5 : 1.2)
  .linkDirectionalParticleSpeed(0.005)
  .linkDirectionalParticleColor(l => l.color || (isDark() ? '#58a6ff' : '#0969da'))
  .linkDirectionalArrowLength(3)
  .linkDirectionalArrowRelPos(1)
  .linkDirectionalArrowColor(l => l.color || (isDark() ? '#58a6ff' : '#0969da'))
  .linkCurvature(0.15)
  // ─── Interaction ───
  .onNodeClick(node => {
    selectNode(node);
    focusCameraOnNode(node);
  })
  .onNodeHover(node => {
    hoverNode = node;
    container.style.cursor = node ? 'pointer' : 'grab';
    updateTooltip(node);
    // Highlight connected
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node);
      const links = Graph.graphData().links;
      links.forEach(l => {
        const src = typeof l.source === 'object' ? l.source : nodeMap[l.source];
        const tgt = typeof l.target === 'object' ? l.target : nodeMap[l.target];
        if (src === node || tgt === node) {
          highlightLinks.add(l);
          if (src) highlightNodes.add(src);
          if (tgt) highlightNodes.add(tgt);
        }
      });
    }
    Graph.nodeColor(Graph.nodeColor())
      .linkColor(Graph.linkColor())
      .linkWidth(Graph.linkWidth())
      .linkDirectionalParticles(Graph.linkDirectionalParticles());
  })
  .onBackgroundClick(() => {
    highlightNodes.clear();
    highlightLinks.clear();
    Graph.nodeColor(Graph.nodeColor()).linkColor(Graph.linkColor()).linkWidth(Graph.linkWidth());
    closeDetailPanel();
  })
  .d3AlphaDecay(0.02)
  .d3VelocityDecay(0.3)
  .warmupTicks(80)
  .cooldownTicks(200);

// ═══════════════════════════════════════════════════════════════════════════
// TEXT TEXTURE FOR LABELS
// ═══════════════════════════════════════════════════════════════════════════
function createTextTexture(text, color) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const fontSize = 48;
  ctx.font = \`600 \${fontSize}px Inter, sans-serif\`;
  const textWidth = ctx.measureText(text).width;
  canvas.width = Math.min(textWidth + 24, 1024);
  canvas.height = fontSize + 16;
  ctx.font = \`600 \${fontSize}px Inter, sans-serif\`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = color || '#e6edf3';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2, canvas.width - 12);
  const THREE = Graph.three();
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

// ═══════════════════════════════════════════════════════════════════════════
// CAMERA FOCUS
// ═══════════════════════════════════════════════════════════════════════════
function focusCameraOnNode(node) {
  const distance = 120;
  const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);
  Graph.cameraPosition(
    { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
    { x: node.x || 0, y: node.y || 0, z: node.z || 0 },
    1200 // ms transition
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOLTIP
// ═══════════════════════════════════════════════════════════════════════════
const tooltip = document.getElementById('tooltip3d');
const tipName = document.getElementById('tipName');
const tipType = document.getElementById('tipType');

function updateTooltip(node) {
  if (!node) { tooltip.style.display = 'none'; return; }
  tipName.textContent = node.icon + ' ' + node.name;
  tipType.textContent = node.label + (node.language ? ' • ' + node.language : '');
  tooltip.style.display = 'block';
}
container.addEventListener('mousemove', (e) => {
  if (tooltip.style.display === 'block') {
    tooltip.style.left = (e.clientX + 16) + 'px';
    tooltip.style.top = (e.clientY + 16) + 'px';
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// DETAIL PANEL
// ═══════════════════════════════════════════════════════════════════════════
const detailPanel = document.getElementById('detailPanel');
const detailContent = document.getElementById('detailContent');

function selectNode(node) {
  selectedNode = node;
  if (!node) { closeDetailPanel(); return; }
  const meta = node.metadata || {};
  const incoming = incomingMap[node.id] || [];
  const outgoing = outgoingMap[node.id] || [];

  let html = '<div class="detail-header">';
  html += '<div class="detail-icon">' + (node.icon || '📄') + '</div>';
  html += '<div class="detail-name">' + escHtml(node.name) + '</div>';
  html += '<div class="detail-path">' + escHtml(node.filePath || node.id) + '</div>';
  html += '<div class="detail-badges">';
  html += '<span class="badge badge-type">' + escHtml(node.label || node.type) + '</span>';
  if (node.language) html += '<span class="badge badge-lang">' + escHtml(node.language) + '</span>';
  if (node.framework) html += '<span class="badge badge-fw">' + escHtml(node.framework) + '</span>';
  html += '</div></div>';

  // Tabs
  html += '<div class="detail-tabs">';
  html += '<div class="detail-tab active" data-tab="info">ℹ️ Info</div>';
  html += '<div class="detail-tab" data-tab="connections">🔗 Connections (' + (incoming.length + outgoing.length) + ')</div>';
  html += '</div>';

  // Info tab
  html += '<div class="tab-pane active" id="tab-info">';
  html += '<div class="detail-section"><h3>📊 Statistics</h3><div class="detail-grid">';
  html += '<div class="detail-stat"><div class="label">Incoming</div><div class="value">' + incoming.length + '</div></div>';
  html += '<div class="detail-stat"><div class="label">Outgoing</div><div class="value">' + outgoing.length + '</div></div>';
  if (meta.size) html += '<div class="detail-stat"><div class="label">Size</div><div class="value">' + formatBytes(meta.size) + '</div></div>';
  if (meta.lines) html += '<div class="detail-stat"><div class="label">Lines</div><div class="value">' + meta.lines + '</div></div>';
  if (meta.complexity) html += '<div class="detail-stat"><div class="label">Complexity</div><div class="value">' + meta.complexity + '</div></div>';
  if (meta.functions && meta.functions.length) html += '<div class="detail-stat"><div class="label">Functions</div><div class="value">' + meta.functions.length + '</div></div>';
  html += '</div></div>';
  if (meta.functions && meta.functions.length > 0) {
    html += '<div class="detail-section"><h3>⚡ Functions</h3><div style="font-size:0.78rem;font-family:var(--font-mono);color:var(--text-secondary);">';
    meta.functions.forEach(f => { html += '<div style="padding:2px 0;">' + escHtml(f) + '()</div>'; });
    html += '</div></div>';
  }
  if (meta.exports && meta.exports.length > 0) {
    html += '<div class="detail-section"><h3>📤 Exports</h3><div style="font-size:0.78rem;font-family:var(--font-mono);color:var(--text-secondary);">';
    meta.exports.forEach(e => { html += '<div style="padding:2px 0;">' + escHtml(e) + '</div>'; });
    html += '</div></div>';
  }
  html += '</div>';

  // Connections tab
  html += '<div class="tab-pane" id="tab-connections">';
  if (outgoing.length > 0) {
    html += '<div class="detail-section"><h3>📤 Outgoing (' + outgoing.length + ')</h3><ul class="conn-list">';
    outgoing.forEach(c => {
      const tNode = nodeMap[c.target];
      const tName = tNode ? tNode.name : c.target;
      const tIcon = tNode ? tNode.icon : '📄';
      html += '<li class="conn-item" data-node-id="' + escHtml(c.target) + '">';
      html += '<span class="conn-dot" style="background:' + (c.color || '#8b949e') + '"></span>';
      html += '<span class="conn-name">' + tIcon + ' ' + escHtml(tName) + '</span>';
      html += '<span class="conn-type">' + escHtml(c.type) + '</span>';
      html += '</li>';
    });
    html += '</ul></div>';
  }
  if (incoming.length > 0) {
    html += '<div class="detail-section"><h3>📥 Incoming (' + incoming.length + ')</h3><ul class="conn-list">';
    incoming.forEach(c => {
      const sNode = nodeMap[c.source];
      const sName = sNode ? sNode.name : c.source;
      const sIcon = sNode ? sNode.icon : '📄';
      html += '<li class="conn-item" data-node-id="' + escHtml(c.source) + '">';
      html += '<span class="conn-dot" style="background:' + (c.color || '#8b949e') + '"></span>';
      html += '<span class="conn-name">' + sIcon + ' ' + escHtml(sName) + '</span>';
      html += '<span class="conn-type">' + escHtml(c.type) + '</span>';
      html += '</li>';
    });
    html += '</ul></div>';
  }
  if (incoming.length === 0 && outgoing.length === 0) {
    html += '<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:0.85rem;">No connections found</div>';
  }
  html += '</div>';

  detailContent.innerHTML = html;
  detailPanel.classList.add('open');

  // Tab switching
  detailContent.querySelectorAll('.detail-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      detailContent.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
      detailContent.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });

  // Connection click -> focus node
  detailContent.querySelectorAll('.conn-item').forEach(item => {
    item.addEventListener('click', () => {
      const nodeId = item.dataset.nodeId;
      const targetNode = graphNodes.find(n => n.id === nodeId);
      if (targetNode) {
        selectNode(targetNode);
        focusCameraOnNode(targetNode);
      }
    });
  });
}

function closeDetailPanel() {
  detailPanel.classList.remove('open');
  selectedNode = null;
}

function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ═══════════════════════════════════════════════════════════════════════════
// LEGEND
// ═══════════════════════════════════════════════════════════════════════════
function buildLegend() {
  const body = document.getElementById('legendBody');
  let html = '';

  // Node types
  const nodeTypes = RAW_MODEL.nodeTypes || {};
  if (Object.keys(nodeTypes).length > 0) {
    html += '<div class="legend-group"><div class="legend-group-title">Node Types</div>';
    for (const [key, info] of Object.entries(nodeTypes)) {
      html += '<div class="legend-item"><span class="legend-color" style="background:' + info.color + '"></span>' + info.icon + ' ' + info.label + '</div>';
    }
    html += '</div>';
  }

  // Edge types
  const relTypes = RAW_MODEL.relationshipTypes || {};
  if (Object.keys(relTypes).length > 0) {
    html += '<div class="legend-group"><div class="legend-group-title">Relationships</div>';
    for (const [key, info] of Object.entries(relTypes)) {
      const styleClass = info.style === 'dashed' ? 'dashed' : info.style === 'dotted' ? 'dotted' : '';
      html += '<div class="legend-item"><span class="legend-line ' + styleClass + '" style="background:' + info.color + ';border-color:' + info.color + '"></span>' + info.label + '</div>';
    }
    html += '</div>';
  }

  body.innerHTML = html;
}
buildLegend();

// Legend toggle
document.getElementById('legendToggle').addEventListener('click', () => {
  document.getElementById('legend').classList.toggle('collapsed');
  document.getElementById('legendArrow').textContent = document.getElementById('legend').classList.contains('collapsed') ? '▶' : '▼';
});

// ═══════════════════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════════════════
document.getElementById('statNodes').textContent = RAW_MODEL.nodes.length;
document.getElementById('statEdges').textContent = RAW_MODEL.edges.length;
const langs = RAW_MODEL.metadata && RAW_MODEL.metadata.languages ? Object.keys(RAW_MODEL.metadata.languages).length : 0;
document.getElementById('statLangs').textContent = langs;

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════════════════════
const searchBox = document.getElementById('searchBox');
const searchCount = document.getElementById('searchCount');

searchBox.addEventListener('input', () => {
  const q = searchBox.value.trim().toLowerCase();
  highlightNodes.clear();
  highlightLinks.clear();

  if (q.length > 0) {
    const matches = graphNodes.filter(n => n.name.toLowerCase().includes(q) || n.id.toLowerCase().includes(q));
    matches.forEach(n => highlightNodes.add(n));
    searchCount.textContent = matches.length + ' found';
    if (matches.length === 1) {
      focusCameraOnNode(matches[0]);
    }
  } else {
    searchCount.textContent = '';
  }
  Graph.nodeColor(Graph.nodeColor()).linkColor(Graph.linkColor());
});

// ═══════════════════════════════════════════════════════════════════════════
// TOOLBAR BUTTONS
// ═══════════════════════════════════════════════════════════════════════════
// Close panel
document.getElementById('closePanel').addEventListener('click', closeDetailPanel);

// Reset view
document.getElementById('btnResetView').addEventListener('click', () => {
  Graph.cameraPosition({ x: 0, y: 0, z: 500 }, { x: 0, y: 0, z: 0 }, 1000);
  highlightNodes.clear();
  highlightLinks.clear();
  searchBox.value = '';
  searchCount.textContent = '';
  Graph.nodeColor(Graph.nodeColor()).linkColor(Graph.linkColor()).linkWidth(Graph.linkWidth());
});

// Toggle labels
document.getElementById('btnToggleLabels').addEventListener('click', () => {
  showLabels = !showLabels;
  document.getElementById('btnToggleLabels').classList.toggle('active', showLabels);
  Graph.nodeThreeObject(Graph.nodeThreeObject()).refresh();
});
document.getElementById('btnToggleLabels').classList.add('active');

// Toggle particles
document.getElementById('btnToggleParticles').addEventListener('click', () => {
  showParticles = !showParticles;
  document.getElementById('btnToggleParticles').classList.toggle('active', showParticles);
  Graph.linkDirectionalParticles(Graph.linkDirectionalParticles());
});
document.getElementById('btnToggleParticles').classList.add('active');

// Theme toggle
document.getElementById('btnTheme').addEventListener('click', toggleTheme);

function toggleTheme() {
  const html = document.documentElement;
  const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  document.getElementById('btnTheme').querySelector('.icon').textContent = newTheme === 'dark' ? '🌙' : '☀️';
  Graph.backgroundColor(newTheme === 'dark' ? '#0a0e14' : '#ffffff');
  // Refresh node colors & labels
  Graph.nodeColor(Graph.nodeColor())
    .linkColor(Graph.linkColor())
    .linkDirectionalParticleColor(Graph.linkDirectionalParticleColor())
    .linkDirectionalArrowColor(Graph.linkDirectionalArrowColor())
    .nodeThreeObject(Graph.nodeThreeObject());
}

// Fullscreen
document.getElementById('btnFullscreen').addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
});

// Shortcuts modal
document.getElementById('btnShortcuts').addEventListener('click', () => {
  document.getElementById('shortcutsModal').classList.toggle('open');
});

// ═══════════════════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════════════════════
document.addEventListener('keydown', (e) => {
  // Don't fire shortcuts when typing in search
  if (e.target === searchBox) {
    if (e.key === 'Escape') { searchBox.blur(); searchBox.value = ''; searchCount.textContent = ''; highlightNodes.clear(); highlightLinks.clear(); Graph.nodeColor(Graph.nodeColor()).linkColor(Graph.linkColor()); }
    return;
  }
  switch(e.key.toLowerCase()) {
    case 'r': document.getElementById('btnResetView').click(); break;
    case 'l': document.getElementById('btnToggleLabels').click(); break;
    case 'p': document.getElementById('btnToggleParticles').click(); break;
    case '/': e.preventDefault(); searchBox.focus(); break;
    case 't': toggleTheme(); break;
    case 'g': document.getElementById('legendToggle').click(); break;
    case 'f': document.getElementById('btnFullscreen').click(); break;
    case 'escape':
      document.getElementById('shortcutsModal').classList.remove('open');
      closeDetailPanel();
      break;
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// RESIZE HANDLER
// ═══════════════════════════════════════════════════════════════════════════
window.addEventListener('resize', () => {
  Graph.width(container.offsetWidth).height(container.offsetHeight);
});

// ═══════════════════════════════════════════════════════════════════════════
// STARTUP
// ═══════════════════════════════════════════════════════════════════════════
// Let the force simulation settle, then gently zoom to fit
setTimeout(() => {
  Graph.zoomToFit(1000, 60);
}, 2500);
</script>
</body>
</html>`;
}

module.exports = { toGraph3dVisualizerHtml };
