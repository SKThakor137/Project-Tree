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
  <meta name="description" content="Interactive 2D/3D code architecture visualization and dependency graph for ${esc(name)}">
  <meta property="og:title" content="${esc(name)} — Code Relationship Graph">
  <meta property="og:description" content="Interactive 2D Canvas & 3D WebGL Code Relationship Graph visualizer.">
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
    "description": "Interactive Code Relationship Graph and 2D/3D Visualizer Suite for Node.js.",
    "url": "https://github.com/SKThakor137/Project-Tree"
  }
  </script>
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
  display: inline-flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.95rem;
  color: var(--accent); white-space: nowrap; margin-right: 8px; height: 32px;
}
.toolbar-brand span { font-size: 1.2rem; }
.toolbar-sep { width: 1px; height: 20px; background: var(--border); margin: 0 6px; flex-shrink: 0; align-self: center; }
.tb-group { display: inline-flex; align-items: center; gap: 6px; height: 32px; }
.tb-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0 12px; height: 32px;
  background: var(--bg-panel); border: 1px solid var(--border); border-radius: var(--radius-sm);
  color: var(--text-secondary); font-size: 0.8rem; font-family: var(--font-sans);
  cursor: pointer; transition: var(--transition); white-space: nowrap; line-height: 1; box-sizing: border-box;
}
.tb-btn:hover { background: var(--bg-hover); color: var(--text); border-color: var(--accent); }
.tb-btn.active { background: var(--accent-bg); color: var(--accent); border-color: var(--accent); font-weight: 600; }
.tb-btn .icon { font-size: 0.95rem; line-height: 1; display: inline-flex; align-items: center; }

.mode-toggle-group {
  display: inline-flex; align-items: center; padding: 2px; background: var(--bg-panel-2);
  border: 1px solid var(--border); border-radius: var(--radius-sm); height: 32px; box-sizing: border-box;
}
.mode-toggle-btn {
  display: inline-flex; align-items: center; justify-content: center; padding: 0 10px; height: 26px;
  background: transparent; border: none; border-radius: 4px; color: var(--text-secondary);
  font-size: 0.78rem; font-weight: 500; font-family: var(--font-sans); cursor: pointer; transition: var(--transition);
}
.mode-toggle-btn:hover { color: var(--text); }
.mode-toggle-btn.active { background: var(--accent); color: #ffffff; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }

.tb-select {
  padding: 0 10px; height: 32px; background: var(--bg-panel); border: 1px solid var(--border);
  border-radius: var(--radius-sm); color: var(--text); font-size: 0.8rem;
  font-family: var(--font-sans); cursor: pointer; outline: none; transition: var(--transition);
  display: inline-flex; align-items: center; box-sizing: border-box;
}
.tb-select:focus { border-color: var(--accent); }
#searchBox {
  padding: 0 12px 0 32px; width: 220px; height: 32px; background: var(--bg-panel);
  border: 1px solid var(--border); border-radius: var(--radius); color: var(--text);
  font-size: 0.82rem; font-family: var(--font-sans); outline: none; transition: var(--transition);
  box-sizing: border-box;
}
#searchBox:focus { border-color: var(--accent); width: 280px; box-shadow: 0 0 0 3px var(--accent-bg); }
.search-wrap { position: relative; display: inline-flex; align-items: center; height: 32px; }
.search-wrap::before { content: '🔍'; position: absolute; left: 10px; font-size: 0.8rem; pointer-events: none; }
.search-results-count { position: absolute; right: 8px; font-size: 0.7rem; color: var(--text-muted); pointer-events: none; }
.toolbar-right { margin-left: auto; display: inline-flex; align-items: center; gap: 6px; height: 32px; }

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
   SMART NAVIGATION TRACKER & POPPER
   ═══════════════════════════════════════════════════════════════════════════ */
.nav-tracker {
  display: flex; align-items: center; justify-content: space-between;
  gap: 6px; padding: 8px 10px; margin-bottom: 16px;
  background: var(--bg-panel-2); border: 1px solid var(--border-light);
  border-radius: var(--radius); position: relative;
}
.nav-tracker-btn {
  display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px;
  background: var(--bg-hover); border: 1px solid var(--border);
  border-radius: var(--radius-sm); color: var(--text); font-size: 0.78rem;
  font-weight: 500; font-family: var(--font-sans); cursor: pointer;
  transition: var(--transition); user-select: none;
}
.nav-tracker-btn:hover:not(:disabled) {
  background: var(--accent-bg); color: var(--accent); border-color: var(--accent);
}
.nav-tracker-btn:disabled {
  opacity: 0.35; cursor: not-allowed; border-color: transparent;
}
.nav-tracker-info {
  font-size: 0.7rem; font-weight: 600; color: var(--text-muted);
  font-family: var(--font-mono); text-align: center; white-space: nowrap;
}
.conn-picker-popover {
  position: absolute; top: calc(100% + 6px); right: 0; width: 280px;
  max-height: 260px; overflow-y: auto; z-index: 250;
  background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border); border-radius: var(--radius);
  box-shadow: var(--shadow); padding: 8px; display: none;
}
.conn-picker-popover.open { display: block; }
.conn-picker-title {
  font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.5px; color: var(--accent); padding: 4px 8px 8px 8px;
  border-bottom: 1px solid var(--border-light); margin-bottom: 6px;
  display: flex; align-items: center; justify-content: space-between;
}
.conn-picker-item {
  display: flex; align-items: center; gap: 8px; padding: 7px 10px;
  border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--text);
  cursor: pointer; transition: var(--transition); margin-bottom: 2px;
}
.conn-picker-item:hover {
  background: var(--accent-bg); color: var(--accent);
}
.conn-picker-badge {
  font-size: 0.65rem; padding: 2px 6px; border-radius: 4px;
  font-weight: 600; font-family: var(--font-mono); margin-left: auto;
}
.conn-picker-badge.inc { background: rgba(88,166,255,0.15); color: var(--accent); }
.conn-picker-badge.out { background: rgba(63,185,80,0.15); color: var(--success); }

/* ═══════════════════════════════════════════════════════════════════════════
   MODE SWITCHER (2D / 3D)
   ═══════════════════════════════════════════════════════════════════════════ */
.mode-toggle-group {
  display: inline-flex; align-items: center; background: var(--bg-panel-2);
  border: 1px solid var(--border); border-radius: var(--radius); padding: 2px;
  gap: 2px; margin-right: 4px;
}
.mode-toggle-btn {
  display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px;
  border: none; border-radius: var(--radius-sm); background: transparent;
  color: var(--text-secondary); font-size: 0.78rem; font-weight: 600;
  font-family: var(--font-sans); cursor: pointer; transition: var(--transition);
  user-select: none;
}
.mode-toggle-btn:hover { color: var(--text); }
.mode-toggle-btn.active {
  background: var(--accent); color: #ffffff; box-shadow: var(--shadow-sm);
}

#graph3dContainer {
  display: none;
  position: fixed;
  top: 56px;
  left: 0;
  width: 100vw;
  height: calc(100vh - 56px);
  z-index: 5;
  background: var(--bg-canvas);
  overflow: hidden;
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
  #toolbar {
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    gap: 6px;
    padding: 0 10px;
  }
  #toolbar::-webkit-scrollbar { display: none; }
  #searchBox { width: 120px; }
  #searchBox:focus { width: 160px; }
  .tb-label { display: none; }
  #detailPanel {
    width: 100vw;
    top: auto;
    bottom: 0;
    height: 55vh;
    border-left: none;
    border-top: 1px solid var(--glass-border);
    transform: translateY(100%);
  }
  #detailPanel.open { transform: translateY(0); }
  #minimap { width: 120px; height: 85px; bottom: 12px; left: 12px; }
  #legend { max-width: 180px; bottom: 12px; left: 12px; }
}

@media (max-width: 480px) {
  #searchBox { width: 100px; }
  #searchBox:focus { width: 130px; }
  .toolbar-brand span { display: none; }
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
  <span class="toolbar-sep"></span>

  <div class="mode-toggle-group">
    <button class="mode-toggle-btn active" id="btnMode2D" title="2D Flat Canvas View">🎨 2D</button>
    <button class="mode-toggle-btn" id="btnMode3D" title="3D Interactive Sphere View">🌐 3D</button>
  </div>

  <span class="toolbar-sep"></span>

  <!-- 2D-ONLY CONTROLS (hidden in 3D mode) -->
  <div class="tb-group" id="controls2dOnly">
    <select class="tb-select" id="layoutSelect" title="Layout Engine">
      <option value="dagre">DAG</option>
      <option value="force">Force Directed</option>
      <option value="tree">Tree</option>
      <option value="radial">Radial</option>
      <option value="horizontal">Horizontal</option>
    </select>

    <span class="toolbar-sep"></span>

    <button class="tb-btn" id="btnFitView" title="Fit View"><span class="icon">⊡</span><span class="tb-label">Fit</span></button>

    <span class="toolbar-sep"></span>
  </div>

  <!-- 3D-ONLY CONTROLS (hidden in 2D mode) -->
  <div class="tb-group" id="controls3dOnly" style="display:none;">
    <button class="tb-btn" id="btnZoomFit3D" title="Zoom to Fit All Nodes"><span class="icon">⊡</span><span class="tb-label">Fit</span></button>
    <button class="tb-btn" id="btnResetCamera" title="Reset Camera Position"><span class="icon">🎯</span><span class="tb-label">Reset</span></button>
    <button class="tb-btn" id="btnAutoRotate3D" title="Toggle Auto Rotation"><span class="icon">🔄</span><span class="tb-label">Rotate</span></button>
    <span class="toolbar-sep"></span>
    <select class="tb-select" id="preset3dSelect" title="3D Camera View Angle">
      <option value="iso">Isometric</option>
      <option value="top">Top View</option>
      <option value="front">Front View</option>
    </select>
    <span class="toolbar-sep"></span>
    <button class="tb-btn active" id="btnToggleLabels" title="Toggle Labels"><span class="icon">🏷️</span><span class="tb-label">Labels</span></button>
    <button class="tb-btn active" id="btnToggleParticles" title="Toggle Particles"><span class="icon">✨</span><span class="tb-label">Particles</span></button>
    <span class="toolbar-sep"></span>
  </div>

  <select class="tb-select" id="nodeTypeFilter" title="Filter by Node Type">
    <option value="ALL">All Types</option>
    <option value="ENTRY">Entry Points</option>
    <option value="COMPONENT">Components</option>
    <option value="SERVICE">Services</option>
    <option value="ROUTE">Routes</option>
    <option value="CONTROLLER">Controllers</option>
    <option value="MODEL">Models</option>
    <option value="UTILITY">Utilities</option>
    <option value="TEST">Tests</option>
    <option value="CONFIG">Configs</option>
  </select>
  <span class="toolbar-sep"></span>

  <div class="search-wrap">
    <input type="text" id="searchBox" placeholder="Search nodes... (Ctrl+F)" autocomplete="off">
    <span class="search-results-count" id="searchCount"></span>
  </div>

  <div class="toolbar-right">
    <!-- 2D-ONLY: Undo/Redo -->
    <div class="tb-group" id="undoRedo2dOnly">
      <button class="tb-btn" id="btnUndo" title="Undo (Ctrl+Z)"><span class="icon">↩</span></button>
      <button class="tb-btn" id="btnRedo" title="Redo (Ctrl+Y)"><span class="icon">↪</span></button>
      <span class="toolbar-sep"></span>
    </div>
    <button class="tb-btn" id="btnExportPNG" title="Export PNG Image"><span class="icon">📷</span><span class="tb-label">PNG</span></button>
    <button class="tb-btn" id="btnExportSVG" title="Export Vector SVG"><span class="icon">🎨</span><span class="tb-label">SVG</span></button>
    <button class="tb-btn" id="btnExportJSON" title="Export JSON"><span class="icon">{ }</span><span class="tb-label">JSON</span></button>
    <span class="toolbar-sep"></span>
    <button class="tb-btn" id="btnTheme" title="Toggle Theme"><span class="icon">🌙</span></button>
    <button class="tb-btn" id="btnFullscreen" title="Fullscreen (F)"><span class="icon">⛶</span></button>
    <button class="tb-btn" id="btnHelp" title="Shortcuts (?)"><span class="icon">?</span></button>
  </div>
</div>

<!-- ═══ 2D CANVAS CONTAINER ═══ -->
<div id="canvasWrap">
  <canvas id="graphCanvas"></canvas>
</div>

<!-- ═══ 3D GRAPH CONTAINER (LAZY LOADED) ═══ -->
<div id="graph3dContainer"></div>

<!-- ═══ 3D TOOLTIP (follows cursor on hover) ═══ -->
<div id="tooltip3d" style="position:fixed;z-index:150;pointer-events:none;background:var(--glass-bg);backdrop-filter:var(--glass-blur);border:1px solid var(--glass-border);border-radius:var(--radius-sm);padding:6px 12px;font-size:0.78rem;color:var(--text);box-shadow:var(--shadow-sm);display:none;white-space:nowrap;">
  <div id="tipName" style="font-weight:600;margin-bottom:2px;"></div>
  <div id="tipType" style="font-size:0.7rem;color:var(--text-muted);"></div>
</div>

<!-- ═══ 3D STATS BAR ═══ -->
<div id="statsBar3d" style="display:none;position:fixed;bottom:16px;right:16px;background:var(--glass-bg);backdrop-filter:var(--glass-blur);border:1px solid var(--glass-border);border-radius:var(--radius);padding:8px 14px;z-index:80;font-size:0.72rem;color:var(--text-muted);gap:16px;box-shadow:var(--shadow-sm);">
  <span>📊 <b id="stat3dNodes">0</b> nodes</span> · <span>🔗 <b id="stat3dEdges">0</b> edges</span>
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
  cardDensity: 'compact',
  nodeWidth: 175, nodeHeight: 44,
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

  const visibleEdges = getVisibleEdges();
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

  const baseGapX = isHorizontal ? 320 : STATE.nodeWidth + 80;
  const baseGapY = isHorizontal ? STATE.nodeHeight + 50 : 130;
  const startX = 100, startY = 100;

  layers.forEach((layer, li) => {
    const nInLayer = layer.length;
    const gapX = isHorizontal ? baseGapX : Math.max(baseGapX, Math.min(350, (STATE.nodeWidth + 40)));
    const gapY = isHorizontal ? Math.max(baseGapY, Math.min(180, (STATE.nodeHeight + 35))) : baseGapY;

    layer.forEach((id, ni) => {
      const x = isHorizontal
        ? startX + li * gapX
        : startX + ni * (STATE.nodeWidth + 45) - ((nInLayer - 1) * (STATE.nodeWidth + 45)) / 2;
      const y = isHorizontal
        ? startY + ni * (STATE.nodeHeight + 35) - ((nInLayer - 1) * (STATE.nodeHeight + 35)) / 2
        : startY + li * gapY;
      STATE.positions.set(id, { x, y });
    });
  });
}

// Force-Directed Layout (Barnes-Hut optimized)
function layoutForce() {
  const visible = getVisibleNodes();
  if (visible.length === 0) return;

  // Initialize positions centered at origin
  const cx = 0, cy = 0;
  const radius = Math.max(250, visible.length * 15);
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

  // Run simulation iterations (capped for large graphs to prevent main thread freezing)
  const iterations = visible.length > 200 ? 40 : (visible.length > 100 ? 60 : Math.min(200, 50 + visible.length));
  const repulsion = 8000;
  const attraction = 0.005;
  const damping = 0.85;
  const minDist = 80;

  for (let iter = 0; iter < iterations; iter++) {
    const temp = 1 - iter / iterations;

    // Repulsive forces (sampled step for large graphs to ensure sub-100ms calculation)
    const step = visible.length > 150 ? Math.max(1, Math.floor(visible.length / 50)) : 1;
    for (let i = 0; i < visible.length; i++) {
      const a = STATE.positions.get(visible[i].id);
      for (let j = i + 1; j < visible.length; j += step) {
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

  const cx = 0, cy = 0;

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

  Object.entries(layers).forEach(([layerIdx, ids]) => {
    const count = ids.length;
    const minCircumference = count * (STATE.nodeWidth + 60);
    const minRadius = minCircumference / (2 * Math.PI);
    const r = layerIdx == 0 ? 0 : Math.max(Number(layerIdx) * 220, minRadius + 80);
    ids.forEach((id, i) => {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      STATE.positions.set(id, {
        x: cx + r * Math.cos(angle) - STATE.nodeWidth / 2,
        y: cy + r * Math.sin(angle) - STATE.nodeHeight / 2
      });
    });
  });
}

// Horizontal Layout
function layoutHorizontal() {
  layoutDagre(true);
}

// ─── POST-PROCESSING ANTI-COLLISION PASS ─────────────────────────────────────
// Guarantees zero node overlap across all 2D layout engines
function resolveCollisions() {
  const visible = getVisibleNodes();
  if (visible.length < 2) return;

  const nw = STATE.nodeWidth;
  const nh = STATE.nodeHeight;
  const minGapX = nw + 35;
  const minGapY = nh + 25;
  const iterations = 45;

  for (let iter = 0; iter < iterations; iter++) {
    let moved = false;
    for (let i = 0; i < visible.length; i++) {
      const p1 = STATE.positions.get(visible[i].id);
      if (!p1) continue;

      for (let j = i + 1; j < visible.length; j++) {
        const p2 = STATE.positions.get(visible[j].id);
        if (!p2) continue;

        let dx = (p2.x + nw / 2) - (p1.x + nw / 2);
        let dy = (p2.y + nh / 2) - (p1.y + nh / 2);

        // Nudge if exactly on top of each other
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
          dx = (Math.random() - 0.5) * 20;
          dy = (Math.random() - 0.5) * 20;
        }

        const normX = dx / minGapX;
        const normY = dy / minGapY;
        const dist = Math.sqrt(normX * normX + normY * normY);

        if (dist < 1.0) {
          moved = true;
          const overlap = (1.0 - dist) * 0.5;
          const pushX = (normX / (dist || 0.001)) * overlap * minGapX;
          const pushY = (normY / (dist || 0.001)) * overlap * minGapY;

          p1.x -= pushX;
          p1.y -= pushY;
          p2.x += pushX;
          p2.y += pushY;
        }
      }
    }
    if (!moved) break;
  }
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
  resolveCollisions();
  render();
  updateMinimap();
}

// Auto-select best layout
function autoSelectLayout() {
  const n = nodes.length;
  if (n > 150) return 'dagre';
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

  // Animated flow particle along connection line during navigation
  drawNavFlowParticle();

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

  // Viewport edge culling
  if (!isOnScreen(srcPos.x, srcPos.y, 400) && !isOnScreen(tgtPos.x, tgtPos.y, 400)) return;

  const nw = STATE.nodeWidth, nh = STATE.nodeHeight;
  const sx = srcPos.x + nw / 2, sy = srcPos.y + nh + 1;
  const tx = tgtPos.x + nw / 2, ty = tgtPos.y - 1;

  ctx.beginPath();
  ctx.strokeStyle = e.color || '#8b949e';
  ctx.lineWidth = (STATE.hoveredNode && (e.source === STATE.hoveredNode.id || e.target === STATE.hoveredNode.id)) ? 2.5 : 1.2;
  const isMatchSrc = STATE.searchResultIds && STATE.searchResultIds.has(e.source);
  const isMatchTgt = STATE.searchResultIds && STATE.searchResultIds.has(e.target);
  ctx.globalAlpha = (STATE.searchTerm && !isMatchSrc && !isMatchTgt) ? 0.1 : (
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
  const arrowLen = 7;
  ctx.fillStyle = e.color || '#8b949e';
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - arrowLen * Math.cos(angle - 0.45), ty - arrowLen * Math.sin(angle - 0.45));
  ctx.lineTo(tx - arrowLen * Math.cos(angle + 0.45), ty - arrowLen * Math.sin(angle + 0.45));
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawNode(n, pos) {
  const nw = STATE.nodeWidth, nh = STATE.nodeHeight;
  const x = pos.x, y = pos.y;
  const isCompact = (STATE.cardDensity || 'compact') === 'compact';

  const isSelected = STATE.selectedNode && STATE.selectedNode.id === n.id;
  const isHovered = STATE.hoveredNode && STATE.hoveredNode.id === n.id;
  const isSearchMatch = STATE.searchTerm && STATE.searchResults && STATE.searchResults.find(r => r.id === n.id);
  const isDimmed = STATE.searchTerm && !isSearchMatch;

  ctx.globalAlpha = isDimmed ? 0.15 : 1;

  // Ambient glow shadow
  if (isSelected || isHovered) {
    ctx.shadowColor = n.color || '#58a6ff';
    ctx.shadowBlur = isSelected ? 18 : 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // Card background with subtle gradient & glass effect
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const grad = ctx.createLinearGradient(x, y, x, y + nh);
  if (isDark) {
    if (isSelected) {
      grad.addColorStop(0, 'rgba(32, 44, 64, 0.98)');
      grad.addColorStop(1, 'rgba(22, 30, 44, 0.98)');
    } else if (isHovered) {
      grad.addColorStop(0, 'rgba(28, 35, 47, 0.96)');
      grad.addColorStop(1, 'rgba(20, 25, 34, 0.96)');
    } else {
      grad.addColorStop(0, 'rgba(24, 30, 39, 0.94)');
      grad.addColorStop(1, 'rgba(16, 20, 27, 0.94)');
    }
  } else {
    if (isSelected) {
      grad.addColorStop(0, 'rgba(235, 243, 255, 0.98)');
      grad.addColorStop(1, 'rgba(248, 250, 255, 0.98)');
    } else if (isHovered) {
      grad.addColorStop(0, 'rgba(245, 248, 252, 0.98)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.98)');
    } else {
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
      grad.addColorStop(1, 'rgba(246, 248, 250, 0.98)');
    }
  }
  ctx.fillStyle = grad;

  // Rounded rect container
  roundRect(ctx, x, y, nw, nh, 10);
  ctx.fill();

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Pulse ring animation
  if (pulseNodeId === n.id) {
    const elapsed = performance.now() - pulseStartTime;
    const progress = (elapsed % 600) / 600;
    const pulseRadius = 12 * progress;
    const pulseAlpha = (1 - progress) * 0.85;

    ctx.save();
    ctx.strokeStyle = n.color || '#58a6ff';
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = pulseAlpha;
    roundRect(ctx, x - pulseRadius, y - pulseRadius, nw + pulseRadius * 2, nh + pulseRadius * 2, 12);
    ctx.stroke();
    ctx.restore();
  }

  // Border outline
  ctx.strokeStyle = isSelected ? (n.color || '#58a6ff') : (isHovered ? (n.color || '#58a6ff') : (isDark ? 'rgba(48,54,61,0.75)' : 'rgba(208,215,222,0.85)'));
  ctx.lineWidth = isSelected ? 2 : 1;
  roundRect(ctx, x, y, nw, nh, 10);
  ctx.stroke();

  // Left accent color indicator bar (clipped cleanly to card bounds, preventing white corner artifacts)
  ctx.save();
  roundRect(ctx, x, y, nw, nh, 10);
  ctx.clip();
  ctx.fillStyle = n.color || '#58a6ff';
  ctx.fillRect(x, y, 4, nh);
  ctx.restore();

  // Icon
  const iconSize = isCompact ? 14 : 16;
  const iconX = x + (isCompact ? 10 : 12);
  const iconY = y + (isCompact ? 26 : 30);
  ctx.font = iconSize + 'px serif';
  ctx.fillText(n.icon || '📄', iconX, iconY);

  // Text coordinates
  const textX = x + (isCompact ? 28 : 32);
  const nameY = y + (isCompact ? 19 : 23);
  const typeY = y + (isCompact ? 33 : 39);

  // Connection count micro pill badge dimensions
  const inC = n.incomingCount || 0;
  const outC = n.outgoingCount || 0;
  const connText = '↓' + inC + ' ↑' + outC;
  const badgeW = isCompact ? 36 : 40;
  const badgeH = isCompact ? 15 : 17;
  const badgeX = x + nw - badgeW - (isCompact ? 8 : 10);
  const badgeY = y + (isCompact ? 7 : 8);

  // File Name with smart dynamic pixel-width truncation
  ctx.font = '600 ' + (isCompact ? '11px' : '12px') + ' Inter, sans-serif';
  ctx.fillStyle = isDark ? '#e6edf3' : '#1f2328';
  const availW = badgeX - textX - 6;
  let displayName = n.name;
  if (ctx.measureText(displayName).width > availW) {
    let sub = displayName;
    while (sub.length > 0 && ctx.measureText(sub + '…').width > availW) {
      sub = sub.substring(0, sub.length - 1);
    }
    displayName = sub ? sub + '…' : '';
  }
  ctx.fillText(displayName, textX, nameY);

  // Type label
  ctx.font = '500 ' + (isCompact ? '9px' : '9.5px') + ' Inter, sans-serif';
  ctx.fillStyle = n.color || '#8b949e';
  ctx.fillText(n.label || n.type, textX, typeY);

  // Connection count micro pill badge
  ctx.save();
  ctx.fillStyle = isDark ? 'rgba(56,139,253,0.16)' : 'rgba(9,105,218,0.12)';
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 4);
  ctx.fill();
  ctx.strokeStyle = isDark ? 'rgba(56,139,253,0.3)' : 'rgba(9,105,218,0.25)';
  ctx.lineWidth = 0.75;
  ctx.stroke();

  ctx.font = '600 ' + (isCompact ? '8.5px' : '9px') + ' Inter, sans-serif';
  ctx.fillStyle = isDark ? '#79c0ff' : '#0969da';
  ctx.textAlign = 'center';
  ctx.fillText(connText, badgeX + badgeW / 2, badgeY + (isCompact ? 10.5 : 11.5));
  ctx.restore();

  // Collapse indicator
  const hasConnections = (outgoingEdges.get(n.id) || []).length > 0;
  if (hasConnections) {
    const collapsed = STATE.collapsed.has(n.id);
    ctx.font = (isCompact ? '9px' : '10px') + ' sans-serif';
    ctx.fillStyle = isDark ? '#8b949e' : '#656d76';
    ctx.fillText(collapsed ? '▶' : '▼', x + nw - (isCompact ? 14 : 16), typeY);
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

// ─── SMART NAVIGATION & HISTORY TRACKER ──────────────────────────────────────

const NAV_STACK = {
  history: [], // Array of node IDs
  index: -1,   // History stack pointer
};

let pulseNodeId = null;
let pulseStartTime = 0;
let pulseAnimFrame = null;
let animFocusFrame = null;

function triggerNodePulse(nodeId) {
  pulseNodeId = nodeId;
  pulseStartTime = performance.now();

  function animatePulse(now) {
    const elapsed = now - pulseStartTime;
    if (elapsed < 1200) {
      render();
      pulseAnimFrame = requestAnimationFrame(animatePulse);
    } else {
      pulseNodeId = null;
      render();
    }
  }
  if (pulseAnimFrame) cancelAnimationFrame(pulseAnimFrame);
  pulseAnimFrame = requestAnimationFrame(animatePulse);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothCenterOnNode(nodeId) {
  const pos = STATE.positions.get(nodeId);
  if (!pos) return;

  const targetOffsetX = -(pos.x + STATE.nodeWidth / 2);
  const targetOffsetY = -(pos.y + STATE.nodeHeight / 2);
  const targetZoom = Math.max(0.7, Math.min(1.4, STATE.zoom));

  const startOffsetX = STATE.offsetX;
  const startOffsetY = STATE.offsetY;
  const startZoom = STATE.zoom;

  const startTime = performance.now();
  const duration = 1200; // Ultra smooth 1.2s pan & zoom

  if (animFocusFrame) cancelAnimationFrame(animFocusFrame);

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const ease = easeInOutCubic(progress);

    STATE.offsetX = startOffsetX + (targetOffsetX - startOffsetX) * ease;
    STATE.offsetY = startOffsetY + (targetOffsetY - startOffsetY) * ease;
    STATE.zoom = startZoom + (targetZoom - startZoom) * ease;

    render();
    updateMinimap();

    if (progress < 1) {
      animFocusFrame = requestAnimationFrame(step);
    } else {
      animFocusFrame = null;
    }
  }

  animFocusFrame = requestAnimationFrame(step);
}

let navFlowAnim = null; // { fromId, toId, startTime, duration: 1500 }

function triggerNavFlowAnimation(fromId, toId) {
  if (!fromId || !toId || fromId === toId) return;
  navFlowAnim = {
    fromId,
    toId,
    startTime: performance.now(),
    duration: 1500 // Ultra smooth 1.5s gliding flow
  };
}

function getBezierPoint(sx, sy, midY, tx, ty, t) {
  const u = 1 - t;
  const px = u*u*u*sx + 3*u*u*t*sx + 3*u*t*t*tx + t*t*t*tx;
  const py = u*u*u*sy + 3*u*u*t*midY + 3*u*t*t*midY + t*t*t*ty;
  return { x: px, y: py };
}

function drawNavFlowParticle() {
  if (!navFlowAnim) return;
  const elapsed = performance.now() - navFlowAnim.startTime;
  const rawProgress = Math.min(1, elapsed / navFlowAnim.duration);
  const progress = easeInOutCubic(rawProgress);

  const srcPos = STATE.positions.get(navFlowAnim.fromId);
  const tgtPos = STATE.positions.get(navFlowAnim.toId);

  if (srcPos && tgtPos) {
    const nw = STATE.nodeWidth, nh = STATE.nodeHeight;
    const sx = srcPos.x + nw / 2, sy = srcPos.y + nh / 2;
    const tx = tgtPos.x + nw / 2, ty = tgtPos.y + nh / 2;
    const midY = (sy + ty) / 2;

    ctx.save();

    // Glowing flow connection line
    ctx.beginPath();
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#58a6ff';
    ctx.shadowBlur = 16;
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(sx, midY, tx, midY, tx, ty);
    ctx.stroke();

    // Draw multi-particle trailing tail (shooting star effect)
    const tailSteps = [0, 0.03, 0.07, 0.12];
    tailSteps.forEach((offset, idx) => {
      const trailT = Math.max(0, progress - offset);
      if (trailT <= 0 && idx > 0) return;

      const pt = getBezierPoint(sx, sy, midY, tx, ty, trailT);
      const alpha = 1 - (idx / tailSteps.length) * 0.75;
      const radius = idx === 0 ? 6.5 : Math.max(2, 5.5 - idx * 1.2);

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.fillStyle = idx === 0 ? '#ffffff' : '#79c0ff';
      ctx.shadowColor = '#58a6ff';
      ctx.shadowBlur = idx === 0 ? 20 : 10;
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (idx === 0) {
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.arc(pt.x, pt.y, 12, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  if (rawProgress < 1) {
    requestAnimationFrame(() => render());
  } else {
    navFlowAnim = null;
  }
}

// ─── 2D / 3D MODE SWITCHER & LAZY LOAD ─────────────────────────────────────
let currentViewMode = '2D';
let graph3dInstance = null;
let script3dLoaded = false;
let script3dLoading = false;

function setModeUIVisibility(mode) {
  const is2D = mode === '2D';
  // 2D-only controls
  const c2d = document.getElementById('controls2dOnly');
  const ur2d = document.getElementById('undoRedo2dOnly');
  if (c2d) c2d.style.display = is2D ? 'inline-flex' : 'none';
  if (ur2d) ur2d.style.display = is2D ? 'inline-flex' : 'none';
  // 3D-only controls
  const c3d = document.getElementById('controls3dOnly');
  if (c3d) c3d.style.display = is2D ? 'none' : 'inline-flex';
  // Canvas / 3D container
  const canvasWrap = document.getElementById('canvasWrap');
  const container3d = document.getElementById('graph3dContainer');
  if (canvasWrap) canvasWrap.style.display = is2D ? 'block' : 'none';
  if (container3d) container3d.style.display = is2D ? 'none' : 'block';
  // Minimap (2D-only) & Legend (All Modes)
  const minimap = document.getElementById('minimap');
  const legend = document.getElementById('legend');
  if (minimap) minimap.style.display = is2D ? '' : 'none';
  if (legend) legend.style.display = '';
  // 3D stats bar and tooltip
  const sb3d = document.getElementById('statsBar3d');
  const tip3d = document.getElementById('tooltip3d');
  if (sb3d) sb3d.style.display = is2D ? 'none' : 'flex';
  if (is2D && tip3d) tip3d.style.display = 'none';
  // Toggle buttons
  const btn2D = document.getElementById('btnMode2D');
  const btn3D = document.getElementById('btnMode3D');
  if (btn2D) btn2D.classList.toggle('active', is2D);
  if (btn3D) btn3D.classList.toggle('active', !is2D);
}

function switchTo2D() {
  currentViewMode = '2D';
  setModeUIVisibility('2D');

  if (STATE.selectedNode) {
    smoothCenterOnNode(STATE.selectedNode.id);
  }
  resizeCanvas();
  render();
}

function switchTo3D() {
  currentViewMode = '3D';
  setModeUIVisibility('3D');

  if (window.ForceGraph3D) {
    script3dLoaded = true;
    // Use rAF so browser paints the container first → offsetWidth/Height are valid
    if (!graph3dInstance) {
      requestAnimationFrame(() => init3dGraphEngine());
    } else {
      resize3dGraph();
      if (STATE.selectedNode) focusCameraOnNode3d(STATE.selectedNode);
    }
  } else {
    if (script3dLoading) return;
    script3dLoading = true;
    toast('Loading 3D Engine...');
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/3d-force-graph@1';
    script.onload = () => {
      script3dLoaded = true;
      script3dLoading = false;
      // Delay init by one frame so container dimensions are computed
      requestAnimationFrame(() => init3dGraphEngine());
    };
    script.onerror = () => {
      script3dLoading = false;
      toast('Failed to load 3D engine. Check internet connection.');
      switchTo2D();
    };
    document.head.appendChild(script);
  }
}

function resize3dGraph() {
  if (!graph3dInstance) return;
  const container3d = document.getElementById('graph3dContainer');
  if (!container3d) return;
  const w = container3d.clientWidth || window.innerWidth;
  const h = container3d.clientHeight || (window.innerHeight - 56);
  graph3dInstance.width(w).height(h);
}

function zoomToFit3D() {
  if (!graph3dInstance) return;
  graph3dInstance.zoomToFit(800, 40);
}

function resetCamera3D() {
  if (!graph3dInstance) return;
  graph3dInstance.cameraPosition({ x: 0, y: 0, z: 500 }, { x: 0, y: 0, z: 0 }, 1200);
}

function update3dTheme() {
  if (!graph3dInstance) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  graph3dInstance.backgroundColor(isDark ? '#0a0e14' : '#ffffff');
}

function search3dHighlight(term) {
  if (!graph3dInstance) return;
  const data = graph3dInstance.graphData();
  if (!data || !data.nodes) return;
  const lowerTerm = (term || '').toLowerCase();
  data.nodes.forEach(n => {
    if (lowerTerm && n.name && n.name.toLowerCase().includes(lowerTerm)) {
      n.__highlighted = true;
    } else {
      n.__highlighted = false;
    }
  });
  // Update node colors to reflect search highlights
  graph3dInstance
    .nodeColor(n => n.__highlighted ? '#ffffff' : (n.color || '#58a6ff'))
    .nodeOpacity(n => (!lowerTerm || n.__highlighted) ? 0.92 : 0.25);
}

// Resize handler for 3D view
window.addEventListener('resize', () => {
  if (currentViewMode === '3D') resize3dGraph();
});

let show3dLabels = true;
let show3dParticles = true;
let highlight3dNodes = new Set();
let highlight3dLinks = new Set();

function createTextCardTexture3d(n) {
  const T = window.THREE;
  if (!T) return null;
  const cvs = document.createElement('canvas');
  const c = cvs.getContext('2d');

  const iconText = n.icon || '📄';
  const nameText = n.name || '';
  const typeText = (n.label || n.type || '').toUpperCase();

  const fontSize = 24;
  const subFontSize = 15;

  c.font = '600 ' + fontSize + 'px Inter, sans-serif';
  const nameW = c.measureText(iconText + ' ' + nameText).width;
  c.font = '700 ' + subFontSize + 'px Inter, sans-serif';
  const typeW = c.measureText(typeText).width;

  const w = Math.max(nameW + 40, typeW + 40, 160);
  const h = 60;

  cvs.width = w * 2;
  cvs.height = h * 2;
  c.scale(2, 2);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  // 3D Card Background
  c.fillStyle = isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)';
  c.beginPath();
  roundRectPath(c, 2, 2, w - 4, h - 4, 10);
  c.fill();

  // 3D Card Border
  c.strokeStyle = n.color || '#58a6ff';
  c.lineWidth = 2.5;
  c.stroke();

  // Left Accent Indicator
  c.fillStyle = n.color || '#58a6ff';
  c.fillRect(2, 6, 6, h - 12);

  // File Icon + Name Text
  c.font = '600 ' + fontSize + 'px Inter, sans-serif';
  c.fillStyle = isDark ? '#f0f6fc' : '#1f2328';
  c.textAlign = 'left';
  c.textBaseline = 'middle';
  c.fillText(iconText + ' ' + nameText, 16, 24, w - 24);

  // Type Tag Text
  c.font = '700 ' + subFontSize + 'px Inter, sans-serif';
  c.fillStyle = n.color || '#8b949e';
  c.fillText(typeText, 16, 45, w - 24);

  const texture = new T.CanvasTexture(cvs);
  texture.minFilter = T.LinearFilter;
  return { texture, w, h };
}

function roundRectPath(ctx, x, y, w, h, r) {
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

function init3dGraphEngine() {
  const container3d = document.getElementById('graph3dContainer');
  if (!window.ForceGraph3D || !container3d) return;

  container3d.innerHTML = '';

  const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
  const cw = container3d.clientWidth || window.innerWidth;
  const ch = container3d.clientHeight || (window.innerHeight - 56);

  const g3dNodes = nodes.map(n => ({
    id: n.id, name: n.name, type: n.type, icon: n.icon || '📄',
    label: n.label || n.type, color: n.color || '#58a6ff',
    filePath: n.filePath || n.id, language: n.language || '',
    framework: n.framework || '', metadata: n.metadata || {},
    incomingCount: n.incomingCount || 0, outgoingCount: n.outgoingCount || 0,
    val: Math.max(2, (n.incomingCount || 0) + (n.outgoingCount || 0) + 1)
  }));

  const g3dLinks = edges.map(e => ({
    source: e.source, target: e.target, type: e.type,
    label: e.label || e.type, color: e.color || '#8b949e', style: e.style
  }));

  graph3dInstance = ForceGraph3D({ controlType: 'orbit', rendererConfig: { preserveDrawingBuffer: true } })(container3d)
    .graphData({ nodes: g3dNodes, links: g3dLinks })
    .backgroundColor(isDark() ? '#0a0e14' : '#ffffff')
    .showNavInfo(false)
    .width(cw).height(ch)
    .nodeVal(n => n.val)
    .nodeColor(n => {
      if (highlight3dNodes.size > 0 && !highlight3dNodes.has(n)) return isDark() ? '#1c2128' : '#d0d7de';
      return n.color;
    })
    .nodeOpacity(0.92)
    .nodeResolution(16)
    .nodeLabel(() => '')
    .nodeThreeObjectExtend(false)
    .nodeThreeObject(n => {
      const T = window.THREE;
      if (!T) return undefined;
      const cardInfo = createTextCardTexture3d(n);
      if (!cardInfo) return undefined;
      const spriteMat = new T.SpriteMaterial({ map: cardInfo.texture, transparent: true, depthWrite: false });
      const sprite = new T.Sprite(spriteMat);
      const aspect = cardInfo.w / cardInfo.h;
      const scaleH = Math.max(14, 10 + n.val * 0.7);
      sprite.scale.set(scaleH * aspect, scaleH, 1);
      return sprite;
    })
    .linkColor(l => {
      if (highlight3dLinks.size > 0 && !highlight3dLinks.has(l)) return isDark() ? 'rgba(48,54,61,0.15)' : 'rgba(208,215,222,0.15)';
      return l.color || (isDark() ? 'rgba(139,148,158,0.4)' : 'rgba(101,109,118,0.4)');
    })
    .linkWidth(l => highlight3dLinks.has(l) ? 2 : 0.5)
    .linkOpacity(0.6)
    .linkDirectionalParticles(l => show3dParticles ? (highlight3dLinks.has(l) ? 6 : 2) : 0)
    .linkDirectionalParticleWidth(l => highlight3dLinks.has(l) ? 2.5 : 1.2)
    .linkDirectionalParticleSpeed(0.005)
    .linkDirectionalParticleColor(l => l.color || (isDark() ? '#58a6ff' : '#0969da'))
    .linkDirectionalArrowLength(3)
    .linkDirectionalArrowRelPos(1)
    .linkDirectionalArrowColor(l => l.color || (isDark() ? '#58a6ff' : '#0969da'))
    .linkCurvature(0.15)
    .onNodeClick(n => {
      const origNode = nodeMap.get(n.id);
      if (origNode) selectNode(origNode, true);
    })
    .onNodeHover(n => {
      container3d.style.cursor = n ? 'pointer' : 'grab';
      updateTooltip3d(n);
      highlight3dNodes.clear();
      highlight3dLinks.clear();
      if (n) {
        highlight3dNodes.add(n);
        const links = graph3dInstance.graphData().links;
        links.forEach(l => {
          const src = typeof l.source === 'object' ? l.source : null;
          const tgt = typeof l.target === 'object' ? l.target : null;
          if (src === n || tgt === n) {
            highlight3dLinks.add(l);
            if (src) highlight3dNodes.add(src);
            if (tgt) highlight3dNodes.add(tgt);
          }
        });
      }
      graph3dInstance.nodeColor(graph3dInstance.nodeColor())
        .linkColor(graph3dInstance.linkColor())
        .linkWidth(graph3dInstance.linkWidth())
        .linkDirectionalParticles(graph3dInstance.linkDirectionalParticles());
    })
    .onBackgroundClick(() => {
      highlight3dNodes.clear();
      highlight3dLinks.clear();
      graph3dInstance.nodeColor(graph3dInstance.nodeColor())
        .linkColor(graph3dInstance.linkColor())
        .linkWidth(graph3dInstance.linkWidth());
      deselectNode();
    })
    .d3AlphaDecay(0.02)
    .d3VelocityDecay(0.3)
    .warmupTicks(80)
    .cooldownTicks(200);

  // Stats bar
  const sb = document.getElementById('statsBar3d');
  if (sb) {
    sb.style.display = 'flex';
    const sn = document.getElementById('stat3dNodes');
    const se = document.getElementById('stat3dEdges');
    if (sn) sn.textContent = g3dNodes.length;
    if (se) se.textContent = g3dLinks.length;
  }

  // Tooltip mouse tracker
  container3d.addEventListener('mousemove', (e) => {
    const tip = document.getElementById('tooltip3d');
    if (tip && tip.style.display === 'block') {
      tip.style.left = (e.clientX + 16) + 'px';
      tip.style.top = (e.clientY + 16) + 'px';
    }
  });

  toast('3D Engine loaded (' + g3dNodes.length + ' nodes, ' + g3dLinks.length + ' edges)');

  if (STATE.selectedNode) {
    setTimeout(() => focusCameraOnNode3d(STATE.selectedNode), 500);
  }
}

function updateTooltip3d(n) {
  const tip = document.getElementById('tooltip3d');
  const tipName = document.getElementById('tipName');
  const tipType = document.getElementById('tipType');
  if (!tip) return;
  if (!n) { tip.style.display = 'none'; return; }
  if (tipName) tipName.textContent = (n.icon || '📄') + ' ' + n.name;
  if (tipType) tipType.textContent = (n.label || n.type) + (n.language ? ' • ' + n.language : '');
  tip.style.display = 'block';
}

let is3dAutoRotating = false;

function toggleAutoRotate3D() {
  if (!graph3dInstance) return;
  is3dAutoRotating = !is3dAutoRotating;
  const btn = document.getElementById('btnAutoRotate3D');
  if (btn) btn.classList.toggle('active', is3dAutoRotating);
  try {
    const controls = graph3dInstance.controls();
    if (controls) {
      controls.autoRotate = is3dAutoRotating;
      controls.autoRotateSpeed = 1.8;
    }
  } catch(e) {}
  toast(is3dAutoRotating ? 'Auto-rotation ON' : 'Auto-rotation OFF');
}

function set3dCameraPreset(preset) {
  if (!graph3dInstance) return;
  const dist = 500;
  if (preset === 'top') {
    graph3dInstance.cameraPosition({ x: 0, y: dist, z: 0 }, { x: 0, y: 0, z: 0 }, 1200);
  } else if (preset === 'front') {
    graph3dInstance.cameraPosition({ x: 0, y: 0, z: dist }, { x: 0, y: 0, z: 0 }, 1200);
  } else if (preset === 'iso') {
    graph3dInstance.cameraPosition({ x: dist * 0.7, y: dist * 0.7, z: dist * 0.7 }, { x: 0, y: 0, z: 0 }, 1200);
  }
}

function toggleLabels3D() {
  show3dLabels = !show3dLabels;
  const btn = document.getElementById('btnToggleLabels');
  if (btn) btn.classList.toggle('active', show3dLabels);
  if (graph3dInstance) {
    graph3dInstance.nodeThreeObject(graph3dInstance.nodeThreeObject());
  }
}

function toggleParticles3D() {
  show3dParticles = !show3dParticles;
  const btn = document.getElementById('btnToggleParticles');
  if (btn) btn.classList.toggle('active', show3dParticles);
  if (graph3dInstance) {
    graph3dInstance.linkDirectionalParticles(graph3dInstance.linkDirectionalParticles());
  }
}

function focusCameraOnNode3d(node) {
  if (!graph3dInstance || !node) return;
  const g3dData = graph3dInstance.graphData();
  const gNode = g3dData.nodes ? g3dData.nodes.find(n => n.id === node.id) : null;
  if (!gNode) return;

  const nx = gNode.x || 0, ny = gNode.y || 0, nz = gNode.z || 0;
  const dist = 140;
  const hyp = Math.hypot(nx, ny, nz) || 1;
  graph3dInstance.cameraPosition(
    { x: nx + (nx / hyp) * dist, y: ny + (ny / hyp) * dist + 20, z: nz + (nz / hyp) * dist + 30 },
    { x: nx, y: ny, z: nz },
    1800
  );

  // Highlight connected on click too
  highlight3dNodes.clear();
  highlight3dLinks.clear();
  highlight3dNodes.add(gNode);
  const links = graph3dInstance.graphData().links;
  links.forEach(l => {
    const src = typeof l.source === 'object' ? l.source : null;
    const tgt = typeof l.target === 'object' ? l.target : null;
    if (src === gNode || tgt === gNode) {
      highlight3dLinks.add(l);
      if (src) highlight3dNodes.add(src);
      if (tgt) highlight3dNodes.add(tgt);
    }
  });
  graph3dInstance.nodeColor(graph3dInstance.nodeColor())
    .linkColor(graph3dInstance.linkColor())
    .linkWidth(graph3dInstance.linkWidth())
    .linkDirectionalParticles(graph3dInstance.linkDirectionalParticles());

  trigger3dNodePulse(gNode);
}

function trigger3dNodePulse(gNode) {
  if (!graph3dInstance || !gNode) return;
  const T = window.THREE;
  let scene;
  try { scene = graph3dInstance.scene(); } catch(e) { return; }
  if (!T || !scene) return;

  const baseSize = Math.max(6, (gNode.val || 2) * 2.5);
  const geo = new T.SphereGeometry(baseSize, 24, 24);
  const mat = new T.MeshBasicMaterial({ color: gNode.color || '#58a6ff', wireframe: true, transparent: true, opacity: 0.9 });
  const mesh = new T.Mesh(geo, mat);
  mesh.position.set(gNode.x || 0, gNode.y || 0, gNode.z || 0);
  scene.add(mesh);

  const startTime = performance.now();
  function animPulse(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / 1200);
    if (progress < 1) {
      const scale = 1 + progress * 2.5;
      mesh.scale.set(scale, scale, scale);
      mat.opacity = (1 - progress) * 0.9;
      mesh.position.set(gNode.x || 0, gNode.y || 0, gNode.z || 0);
      requestAnimationFrame(animPulse);
    } else {
      scene.remove(mesh);
      geo.dispose();
      mat.dispose();
    }
  }
  requestAnimationFrame(animPulse);
}

function trigger3dNavFlowParticlesEngine(fromNode, toNode) {
  if (!graph3dInstance || !fromNode || !toNode || fromNode.id === toNode.id) return;
  const T = window.THREE;
  let scene;
  try { scene = graph3dInstance.scene(); } catch(e) { return; }
  if (!T || !scene) return;

  const gNodes = graph3dInstance.graphData().nodes || [];
  const gFrom = gNodes.find(n => n.id === fromNode.id);
  const gTo = gNodes.find(n => n.id === toNode.id);
  if (!gFrom || !gTo) return;

  const startPos = new T.Vector3(gFrom.x || 0, gFrom.y || 0, gFrom.z || 0);
  const endPos = new T.Vector3(gTo.x || 0, gTo.y || 0, gTo.z || 0);

  const curve = new T.LineCurve3(startPos, endPos);
  const lineGeo = new T.BufferGeometry().setFromPoints(curve.getPoints(20));
  const lineMat = new T.LineBasicMaterial({ color: 0x58a6ff, linewidth: 3.5, transparent: true, opacity: 0.9 });
  const flowLine = new T.Line(lineGeo, lineMat);
  scene.add(flowLine);

  const pGeo = new T.SphereGeometry(4.5, 16, 16);
  const pMat = new T.MeshBasicMaterial({ color: 0xffffff });
  const pMesh = new T.Mesh(pGeo, pMat);
  scene.add(pMesh);

  const startTime = performance.now();
  const duration = 1600;

  function anim3dFlow(now) {
    const elapsed = now - startTime;
    const rawProgress = Math.min(1, elapsed / duration);
    const progress = easeInOutCubic(rawProgress);

    const currentPos = new T.Vector3().lerpVectors(startPos, endPos, progress);
    pMesh.position.copy(currentPos);
    lineMat.opacity = (1 - rawProgress * 0.7);

    if (rawProgress < 1) {
      requestAnimationFrame(anim3dFlow);
    } else {
      scene.remove(flowLine);
      scene.remove(pMesh);
      lineGeo.dispose();
      lineMat.dispose();
      pGeo.dispose();
      pMat.dispose();
    }
  }
  requestAnimationFrame(anim3dFlow);
}

function selectNode(n, pushHist = true) {
  if (!n) return;
  const prevNode = STATE.selectedNode;
  STATE.selectedNode = n;

  if (pushHist) {
    if (NAV_STACK.index < NAV_STACK.history.length - 1) {
      NAV_STACK.history = NAV_STACK.history.slice(0, NAV_STACK.index + 1);
    }
    if (NAV_STACK.history[NAV_STACK.index] !== n.id) {
      NAV_STACK.history.push(n.id);
      NAV_STACK.index = NAV_STACK.history.length - 1;
    }
  }

  if (prevNode && prevNode.id !== n.id) {
    if (currentViewMode === '2D') {
      triggerNavFlowAnimation(prevNode.id, n.id);
    } else if (currentViewMode === '3D') {
      trigger3dNavFlowParticlesEngine(prevNode, n);
    }
  }

  showDetailPanel(n);

  if (currentViewMode === '2D') {
    smoothCenterOnNode(n.id);
    triggerNodePulse(n.id);
    render();
  } else {
    focusCameraOnNode3d(n);
  }
}

function deselectNode() {
  STATE.selectedNode = null;
  document.getElementById('detailPanel').classList.remove('open');
  if (currentViewMode === '2D') render();
}

function navGoBack() {
  if (NAV_STACK.index > 0) {
    NAV_STACK.index--;
    const prevId = NAV_STACK.history[NAV_STACK.index];
    const node = nodeMap.get(prevId);
    if (node) selectNode(node, false);
  }
}

function navGoForward() {
  // Case A: Back in history stack -> move forward in stack
  if (NAV_STACK.index < NAV_STACK.history.length - 1) {
    NAV_STACK.index++;
    const nextId = NAV_STACK.history[NAV_STACK.index];
    const node = nodeMap.get(nextId);
    if (node) selectNode(node, false);
    return;
  }

  // Case B: At tip of history stack. Check connections of current node
  if (!STATE.selectedNode) return;
  const currId = STATE.selectedNode.id;
  const inc = incomingEdges.get(currId) || [];
  const out = outgoingEdges.get(currId) || [];

  const connMap = new Map();
  out.forEach(e => {
    if (!connMap.has(e.target)) {
      const tgt = nodeMap.get(e.target);
      connMap.set(e.target, { id: e.target, name: tgt ? tgt.name : e.target, icon: tgt ? tgt.icon : '📄', dir: 'outgoing', label: e.label || e.type, color: e.color });
    }
  });
  inc.forEach(e => {
    if (!connMap.has(e.source)) {
      const src = nodeMap.get(e.source);
      connMap.set(e.source, { id: e.source, name: src ? src.name : e.source, icon: src ? src.icon : '📄', dir: 'incoming', label: e.label || e.type, color: e.color });
    }
  });

  const connections = Array.from(connMap.values());

  if (connections.length === 0) {
    toast('No connected files');
    return;
  }

  if (connections.length === 1) {
    const node = nodeMap.get(connections[0].id);
    if (node) selectNode(node, true);
    return;
  }

  // Multiple connections -> Open Popover Dropdown Picker!
  toggleConnectionPicker(connections);
}

function toggleConnectionPicker(connections) {
  const popover = document.getElementById('connPickerPopover');
  if (!popover) return;

  if (popover.classList.contains('open')) {
    popover.classList.remove('open');
    return;
  }

  let html = '<div class="conn-picker-title"><span>Where do you want to go?</span><span style="font-size:0.65rem;color:var(--text-muted);">' + connections.length + ' connections</span></div>';
  connections.forEach(c => {
    html += '<div class="conn-picker-item" data-pick-node="' + esc(c.id) + '">';
    html += '<span>' + esc(c.icon) + '</span>';
    html += '<span style="font-weight:500;overflow:hidden;text-overflow:ellipsis;">' + esc(c.name) + '</span>';
    html += '<span class="conn-picker-badge ' + (c.dir === 'incoming' ? 'inc' : 'out') + '">' + (c.dir === 'incoming' ? '↓ IN' : '↑ OUT') + '</span>';
    html += '</div>';
  });

  popover.innerHTML = html;
  popover.classList.add('open');

  popover.querySelectorAll('.conn-picker-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      popover.classList.remove('open');
      const targetNode = nodeMap.get(item.dataset.pickNode);
      if (targetNode) selectNode(targetNode, true);
    });
  });
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
  html += '</div>';

  // Navigation Tracker Bar UI
  const isBackDisabled = NAV_STACK.index <= 0;
  const totalConn = incoming.length + outgoing.length;
  const isNextDisabled = NAV_STACK.index >= NAV_STACK.history.length - 1 && totalConn === 0;

  html += '<div class="nav-tracker" id="navTrackerBar">';
  html += '<button class="nav-tracker-btn" id="btnNavPrev" ' + (isBackDisabled ? 'disabled' : '') + '>← Previous File</button>';
  html += '<span class="nav-tracker-info">Step ' + Math.max(1, NAV_STACK.index + 1) + ' / ' + Math.max(1, NAV_STACK.history.length) + '</span>';
  html += '<button class="nav-tracker-btn" id="btnNavNext" ' + (isNextDisabled ? 'disabled' : '') + '>Next File →</button>';
  html += '<div class="conn-picker-popover" id="connPickerPopover"></div>';
  html += '</div>';

  html += '</div>'; // End detail-header

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

  // Navigation button listeners
  const btnPrev = document.getElementById('btnNavPrev');
  const btnNext = document.getElementById('btnNavNext');
  if (btnPrev) btnPrev.addEventListener('click', (e) => { e.stopPropagation(); navGoBack(); });
  if (btnNext) btnNext.addEventListener('click', (e) => { e.stopPropagation(); navGoForward(); });

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
        selectNode(targetNode, true);
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
    STATE.searchResultIds = new Set(STATE.searchResults.map(r => r.id));
    searchCount.textContent = STATE.searchResults.length + ' found';
    if (STATE.searchResults.length > 0) {
      selectNode(STATE.searchResults[0]);
      if (currentViewMode === '2D') {
        centerOnNode(STATE.searchResults[0].id);
      }
    }
  } else {
    STATE.searchResults = [];
    STATE.searchResultIds = new Set();
    searchCount.textContent = '';
  }
  if (currentViewMode === '2D') {
    render();
  } else {
    search3dHighlight(STATE.searchTerm);
  }
});

const nodeTypeFilterSelect = document.getElementById('nodeTypeFilter');
if (nodeTypeFilterSelect) {
  nodeTypeFilterSelect.addEventListener('change', () => {
    const val = nodeTypeFilterSelect.value;
    if (val === 'ALL') {
      STATE.searchResults = [];
      STATE.searchResultIds = new Set();
    } else {
      STATE.searchResults = nodes.filter(n => (n.type || '').toUpperCase() === val);
      STATE.searchResultIds = new Set(STATE.searchResults.map(r => r.id));
    }
    if (currentViewMode === '2D') render();
    else search3dHighlight(val === 'ALL' ? '' : val.toLowerCase());
  });
}

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

document.getElementById('btnFitView').addEventListener('click', fitView);

document.getElementById('btnTheme').addEventListener('click', () => {
  const theme = document.documentElement.getAttribute('data-theme');
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  document.getElementById('btnTheme').querySelector('.icon').textContent = newTheme === 'dark' ? '🌙' : '☀️';
  render();
  updateMinimap();
  // Sync 3D background color
  if (currentViewMode === '3D') update3dTheme();
});

document.getElementById('btnFullscreen').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
});

document.getElementById('btnHelp').addEventListener('click', () => {
  document.getElementById('kbdModal').classList.toggle('show');
});

const btnPNG = document.getElementById('btnExportPNG');
const btnSVG = document.getElementById('btnExportSVG');
const btnJSON = document.getElementById('btnExportJSON');
if (btnPNG) btnPNG.addEventListener('click', exportPNG);
if (btnSVG) btnSVG.addEventListener('click', exportSVG);
if (btnJSON) btnJSON.addEventListener('click', exportJSON);

function exportPNG() {
  const link = document.createElement('a');
  link.download = (GRAPH.projectName || 'graph') + (currentViewMode === '3D' ? '_3d_code_graph.png' : '_2d_code_graph.png');

  if (currentViewMode === '3D' && graph3dInstance) {
    try {
      const renderer = graph3dInstance.renderer();
      const scene = graph3dInstance.scene();
      const camera = graph3dInstance.camera();
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
        link.href = renderer.domElement.toDataURL('image/png');
      } else {
        link.href = canvas.toDataURL('image/png');
      }
    } catch (e) {
      link.href = canvas.toDataURL('image/png');
    }
  } else {
    link.href = canvas.toDataURL('image/png');
  }

  link.click();
  toast((currentViewMode === '3D' ? '3D' : '2D') + ' PNG exported!');
}

function exportSVG() {
  const visibleNodes = getVisibleNodes();
  if (visibleNodes.length === 0) return;

  const visibleEdges = getVisibleEdges();
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const n of visibleNodes) {
    const pos = STATE.positions.get(n.id);
    if (!pos) continue;
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + STATE.nodeWidth);
    maxY = Math.max(maxY, pos.y + STATE.nodeHeight);
  }

  const padding = 60;
  const width = Math.ceil(maxX - minX + padding * 2);
  const height = Math.ceil(maxY - minY + padding * 2);
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const bgColor = isDark ? '#0a0e14' : '#ffffff';
  const textColor = isDark ? '#e6edf3' : '#1f2328';
  const cardBg = isDark ? '#161b22' : '#ffffff';
  const cardBorder = isDark ? '#30363d' : '#d0d7de';

  let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height + '" width="' + width + '" height="' + height + '">';
  svg += '<style>';
  svg += '  .node-title { font-family: Inter, sans-serif; font-size: 11px; font-weight: 600; fill: ' + textColor + '; }';
  svg += '  .node-type { font-family: Inter, sans-serif; font-size: 9px; fill: #8b949e; }';
  svg += '  .edge-line { fill: none; stroke-linecap: round; }';
  svg += '<' + '/style>';
  svg += '<rect width="' + width + '" height="' + height + '" fill="' + bgColor + '" />';

  svg += '<g transform="translate(' + (-minX + padding) + ', ' + (-minY + padding) + ')">';

  // Draw Edges
  for (const e of visibleEdges) {
    const sp = STATE.positions.get(e.source);
    const tp = STATE.positions.get(e.target);
    if (!sp || !tp) continue;

    const sx = sp.x + STATE.nodeWidth / 2;
    const sy = sp.y + STATE.nodeHeight / 2;
    const tx = tp.x + STATE.nodeWidth / 2;
    const ty = tp.y + STATE.nodeHeight / 2;

    const color = e.color || (isDark ? '#30363d' : '#d0d7de');
    const pathD = 'M ' + sx + ' ' + sy + ' C ' + sx + ' ' + ((sy + ty) / 2) + ', ' + tx + ' ' + ((sy + ty) / 2) + ', ' + tx + ' ' + ty;
    svg += '  <path d="' + pathD + '" stroke="' + color + '" stroke-width="1.5" stroke-opacity="0.6" class="edge-line" />';
  }

  // Draw Nodes
  for (const n of visibleNodes) {
    const pos = STATE.positions.get(n.id);
    if (!pos) continue;

    const nx = pos.x;
    const ny = pos.y;
    const nw = STATE.nodeWidth;
    const nh = STATE.nodeHeight;
    const accentColor = n.color || '#58a6ff';

    svg += '  <g transform="translate(' + nx + ', ' + ny + ')">';
    svg += '    <rect width="' + nw + '" height="' + nh + '" rx="6" fill="' + cardBg + '" stroke="' + cardBorder + '" stroke-width="1" />';
    svg += '    <rect x="0" y="0" width="5" height="' + nh + '" rx="2" fill="' + accentColor + '" />';
    svg += '    <text x="12" y="20" class="node-title">' + escSvg(n.icon || '') + ' ' + escSvg(n.name) + '<' + '/text>';
    svg += '    <text x="12" y="36" class="node-type">' + escSvg(n.label || n.type) + '<' + '/text>';
    svg += '  <' + '/g>';
  }

  svg += '<' + '/g>';
  svg += '<' + '/svg>';

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = (GRAPH.projectName || 'graph') + '_code_graph.svg';
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
  toast('SVG exported!');
}

function escSvg(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

// ─── FIT VIEW ────────────────────────────────────────────────────────────────

function fitView() {
  const visible = getVisibleNodes();
  if (visible.length === 0) return;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const n of visible) {
    const pos = STATE.positions.get(n.id);
    if (!pos) continue;
    if (pos.x < minX) minX = pos.x;
    if (pos.x + STATE.nodeWidth > maxX) maxX = pos.x + STATE.nodeWidth;
    if (pos.y < minY) minY = pos.y;
    if (pos.y + STATE.nodeHeight > maxY) maxY = pos.y + STATE.nodeHeight;
  }

  if (minX === Infinity) return;

  const contentW = maxX - minX + 100;
  const contentH = maxY - minY + 100;
  const zoomX = W / contentW;
  const zoomY = H / contentH;

  STATE.zoom = Math.max(0.05, Math.min(1.2, Math.min(zoomX, zoomY)));
  STATE.offsetX = -(minX + (maxX - minX) / 2);
  STATE.offsetY = -(minY + (maxY - minY) / 2);

  render();
  updateMinimap();
}

// ─── INIT ────────────────────────────────────────────────────────────────────

function setCardDensity(density) {
  STATE.cardDensity = density;
  if (density === 'compact') {
    STATE.nodeWidth = 175;
    STATE.nodeHeight = 44;
  } else {
    STATE.nodeWidth = 205;
    STATE.nodeHeight = 54;
  }
  const btnCompact = document.getElementById('btnCardCompact');
  const btnNormal = document.getElementById('btnCardNormal');
  if (btnCompact) btnCompact.classList.toggle('active', density === 'compact');
  if (btnNormal) btnNormal.classList.toggle('active', density === 'normal');
  const layoutSelect = document.getElementById('layoutSelect');
  runLayout(layoutSelect ? layoutSelect.value : 'dagre');
  fitView();
}

function init() {
  resizeCanvas();

  // Card density switcher
  const btnCardCompact = document.getElementById('btnCardCompact');
  const btnCardNormal = document.getElementById('btnCardNormal');
  if (btnCardCompact) btnCardCompact.addEventListener('click', () => setCardDensity('compact'));
  if (btnCardNormal) btnCardNormal.addEventListener('click', () => setCardDensity('normal'));

  // Mode switcher
  const btn2D = document.getElementById('btnMode2D');
  const btn3D = document.getElementById('btnMode3D');
  if (btn2D) btn2D.addEventListener('click', switchTo2D);
  if (btn3D) btn3D.addEventListener('click', switchTo3D);

  // 3D-only buttons
  const btnFit3D = document.getElementById('btnZoomFit3D');
  const btnReset3D = document.getElementById('btnResetCamera');
  const btnAutoRotate3D = document.getElementById('btnAutoRotate3D');
  const preset3dSelect = document.getElementById('preset3dSelect');
  const btnLabels3D = document.getElementById('btnToggleLabels');
  const btnParticles3D = document.getElementById('btnToggleParticles');
  if (btnFit3D) btnFit3D.addEventListener('click', zoomToFit3D);
  if (btnReset3D) btnReset3D.addEventListener('click', resetCamera3D);
  if (btnAutoRotate3D) btnAutoRotate3D.addEventListener('click', toggleAutoRotate3D);
  if (preset3dSelect) preset3dSelect.addEventListener('change', (e) => set3dCameraPreset(e.target.value));
  if (btnLabels3D) btnLabels3D.addEventListener('click', toggleLabels3D);
  if (btnParticles3D) btnParticles3D.addEventListener('click', toggleParticles3D);

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
