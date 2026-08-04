/**
 * Self-contained HTML project tree generator with interactive search, tabs, and client-side Export Center.
 */
'use strict';

const path = require('path');
const { computeStats } = require('../core/stats.js');
const { toJson } = require('./json.js');
const { toSvg } = require('./svg.js');
const { toMermaid } = require('./mermaid.js');
const { generateAiContext } = require('../features/ai.js');
const { buildTreeText } = require('../core/formatter.js');

/** @typedef {import('../core/scanner').ScanNode} ScanNode */

/**
 * Generate a self-contained interactive HTML dashboard & export center.
 * @param {ScanNode} tree
 * @param {Object}   [stats]
 * @returns {string} html
 */
function toHtml(tree, stats = null) {
  const timestamp = new Date().toISOString();
  const effectiveStats = stats || computeStats(tree);

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

  const treeHtml = renderNode(tree);
  const archData = (effectiveStats && effectiveStats.architectureGraph) ? effectiveStats.architectureGraph : { imports: {}, exports: {}, usage: {}, deadCode: { files: [], components: [] }, circular: [] };

  const treeText = buildTreeText(tree, { theme: 'unicode' });
  const mdStr = `# ${tree.name}\n\n\`\`\`\n${treeText}\n\`\`\`\n`;
  const jsonStr = toJson(tree, effectiveStats);
  const svgStr = toSvg(tree, effectiveStats);
  const mermaidStr = toMermaid(tree);
  const aiStr = generateAiContext(process.cwd(), treeText, effectiveStats);

  const deadCount = (archData.deadCode.files || []).length;
  const circularCount = (archData.circular || []).length;
  const healthScore = Math.max(0, 100 - (circularCount * 15) - (deadCount * 5));

  const clientReportsData = {
    'PROJECT_STRUCTURE.md': mdStr,
    'PROJECT_STRUCTURE.json': jsonStr,
    'PROJECT_STRUCTURE.svg': svgStr,
    'PROJECT_STRUCTURE.mmd': mermaidStr,
    'AI_CONTEXT.md': aiStr,
    'COMPONENT_USAGE.json': JSON.stringify(archData.usage || {}, null, 2),
    'IMPORT_GRAPH.json': JSON.stringify(archData.imports || {}, null, 2),
    'EXPORT_GRAPH.json': JSON.stringify(archData.exports || {}, null, 2),
    'DEAD_CODE.json': JSON.stringify(archData.deadCode || {}, null, 2),
    'CIRCULAR_DEPENDENCIES.json': JSON.stringify(archData.circular || [], null, 2),
    'PROJECT_HEALTH.json': JSON.stringify({ score: healthScore, deadCount, circularCount }, null, 2),
    'PROJECT_STATS.json': JSON.stringify(effectiveStats || {}, null, 2),
  };

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tree.name} — Architecture & Export Center</title>
  <style>
    :root {
      --bg: #0d1117;
      --bg-panel: #161b22;
      --bg-hover: #21262d;
      --border: #30363d;
      --text: #c9d1d9;
      --text-muted: #8b949e;
      --accent: #58a6ff;
      --accent-bg: rgba(88, 166, 255, 0.15);
      --success: #3fb950;
      --danger: #f85149;
      --warning: #d29922;
      --card-bg: #161b22;
      --shadow: 0 8px 24px rgba(0,0,0,0.4);
    }

    [data-theme="light"] {
      --bg: #ffffff;
      --bg-panel: #f6f8fa;
      --bg-hover: #eaeef2;
      --border: #d0d7de;
      --text: #24292f;
      --text-muted: #57606a;
      --accent: #0969da;
      --accent-bg: rgba(9, 105, 218, 0.1);
      --success: #1a7f37;
      --danger: #cf222e;
      --warning: #9a6700;
      --card-bg: #ffffff;
      --shadow: 0 8px 24px rgba(140,149,159,0.2);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      background: var(--bg); color: var(--text);
      display: flex; flex-direction: column; height: 100vh; overflow: hidden;
    }

    /* Top Navbar */
    .navbar {
      height: 56px; background: var(--bg-panel); border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between; padding: 0 1.25rem;
    }
    .brand { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 1.1rem; color: var(--accent); }
    .nav-actions { display: flex; align-items: center; gap: 0.75rem; }

    .btn {
      background: var(--bg-hover); border: 1px solid var(--border); color: var(--text);
      padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.85rem; font-weight: 500;
      cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; transition: all 0.2s;
    }
    .btn:hover { background: var(--accent-bg); border-color: var(--accent); color: var(--accent); }
    .btn-primary { background: var(--accent); color: #fff; border-color: var(--accent); }
    .btn-primary:hover { opacity: 0.9; color: #fff; background: var(--accent); }

    /* Layout */
    .app-body { flex: 1; display: flex; overflow: hidden; }
    .sidebar { width: 340px; border-right: 1px solid var(--border); display: flex; flex-direction: column; background: var(--bg-panel); }
    .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg); }

    /* Header & Search */
    .sidebar-header { padding: 1rem; border-bottom: 1px solid var(--border); }
    .search-wrapper { position: relative; }
    .search-input {
      width: 100%; background: var(--bg); border: 1px solid var(--border);
      border-radius: 6px; padding: 0.5rem 0.75rem; color: var(--text); outline: none; font-size: 0.88rem;
    }
    .search-input:focus { border-color: var(--accent); }

    /* Tabs */
    .tabs { display: flex; border-bottom: 1px solid var(--border); background: var(--bg-panel); }
    .tab {
      padding: 0.75rem 1rem; cursor: pointer; color: var(--text-muted); font-size: 0.88rem;
      flex: 1; text-align: center; font-weight: 500; transition: color 0.15s;
    }
    .tab:hover { color: var(--text); }
    .tab.active { color: var(--accent); border-bottom: 2px solid var(--accent); font-weight: 600; }

    /* Scrollable Areas */
    .tree-container { flex: 1; overflow-y: auto; padding: 1rem; }
    .panel-container { flex: 1; padding: 2rem; overflow-y: auto; }

    /* Tree Styling */
    ul { list-style: none; padding-left: 1rem; }
    li { margin: 3px 0; }
    .file { cursor: pointer; padding: 3px 6px; border-radius: 4px; display: inline-block; width: 100%; font-size: 0.9rem; }
    .file:hover { background: var(--bg-hover); }
    .file.active { background: var(--accent); color: #ffffff !important; }
    .file.active .summary { color: rgba(255,255,255,0.8); }
    details > summary { cursor: pointer; font-weight: 500; padding: 3px 6px; border-radius: 4px; outline: none; font-size: 0.9rem; }
    details > summary:hover { background: var(--bg-hover); }

    .hidden { color: var(--danger); font-style: italic; }
    .summary { color: var(--text-muted); font-size: 0.83em; margin-left: 8px; }

    /* Stats Grid */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { background: var(--card-bg); border: 1px solid var(--border); padding: 1.2rem; border-radius: 8px; }
    .stat-val { font-size: 1.6rem; font-weight: 700; color: var(--accent); margin-bottom: 0.2rem; }
    .stat-label { font-size: 0.83rem; color: var(--text-muted); }

    /* Export Center Modal / Section */
    .export-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; margin-top: 1rem; }
    .export-card {
      background: var(--card-bg); border: 1px solid var(--border); padding: 1.25rem;
      border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between; gap: 1rem;
      position: relative;
    }
    .export-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
    .export-card h3 { font-size: 1rem; color: var(--text); display: flex; align-items: center; gap: 0.5rem; }
    .export-card p { font-size: 0.83rem; color: var(--text-muted); line-height: 1.4; margin-top: 0.4rem; }

    .checkbox-custom { width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent); }

    .detail-section { margin-bottom: 2rem; }
    .detail-section h2 { font-size: 1.2rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; margin-bottom: 1rem; color: var(--accent); }
    .tag { display: inline-block; padding: 3px 10px; background: var(--bg-hover); border: 1px solid var(--border); border-radius: 12px; font-size: 0.8rem; margin: 3px; }
    .tag.warn { color: var(--danger); border-color: var(--danger); }

    .shortcuts-bar { font-size: 0.78rem; color: var(--text-muted); display: flex; gap: 1rem; padding: 0.5rem 1.25rem; background: var(--bg-panel); border-top: 1px solid var(--border); }
    kbd { background: var(--bg-hover); border: 1px solid var(--border); padding: 1px 5px; border-radius: 3px; font-family: monospace; }

    @media (max-width: 768px) {
      .navbar { padding: 0 0.75rem; height: 50px; }
      .brand { font-size: 0.95rem; }
      .nav-actions { gap: 0.35rem; }
      .btn { padding: 0.3rem 0.6rem; font-size: 0.78rem; }
      .app-body { flex-direction: column; }
      .sidebar { width: 100%; height: 45vh; border-right: none; border-bottom: 1px solid var(--border); }
      .main { width: 100%; height: 55vh; }
      .panel-container { padding: 1rem; }
      .stats-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.75rem; }
      .export-grid { grid-template-columns: 1fr; gap: 0.75rem; }
      .shortcuts-bar { display: none; }
    }

    @media (max-width: 480px) {
      .stats-grid { grid-template-columns: 1fr 1fr; }
      .btn-label { display: none; }
    }

    @media print {
      .sidebar, .navbar, .shortcuts-bar, .tabs { display: none !important; }
      body, .main, .panel-container { height: auto; overflow: visible; background: #fff; color: #000; }
      .export-card { break-inside: avoid; border: 1px solid #ccc; }
    }
  </style>
</head>
<body>

  <!-- Top Navbar -->
  <div class="navbar">
    <div class="brand">
      <span>🌳</span> ${tree.name}
    </div>
    <div class="nav-actions">
      <button class="btn" id="themeToggleBtn" title="Shortcut: D">🌙 Dark Mode</button>
      <button class="btn" id="printBtn" title="Shortcut: P">🖨️ Print Report</button>
      <button class="btn btn-primary" id="exportCenterBtn" title="Shortcut: E">📦 Export Center</button>
    </div>
  </div>

  <!-- App Body -->
  <div class="app-body">
    
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="search-wrapper">
          <input type="text" id="treeSearch" class="search-input" placeholder="Search files, exports... (/)" />
        </div>
      </div>

      <div class="tabs">
        <div class="tab active" data-target="overview">Overview</div>
        <div class="tab" data-target="tree">Explorer</div>
        <div class="tab" data-target="export">Export Center</div>
      </div>

      <div class="tree-container" id="treeView" style="display: none;">
        <ul>${treeHtml}</ul>
      </div>

      <div class="tree-container" id="overviewView">
        <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1rem;">
          Select a file from <b>Explorer</b> or choose options from <b>Export Center</b>.
        </p>

        ${effectiveStats ? `
          <div class="stat-card" style="margin-bottom: 0.8rem;">
            <div class="stat-val">${effectiveStats.files}</div>
            <div class="stat-label">Total Files (${effectiveStats.dirs} Dirs)</div>
          </div>
          <div class="stat-card" style="margin-bottom: 0.8rem;">
            <div class="stat-val">${effectiveStats.totalSizeText}</div>
            <div class="stat-label">Total Repository Size</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">${healthScore}/100</div>
            <div class="stat-label">Architecture Health Score</div>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Main Panel -->
    <div class="main">
      <div class="panel-container" id="mainPanel">
        
        <!-- Export Center Section -->
        <div id="exportSection">
          <div class="detail-section">
            <h2>🚀 Customizable Download & Export Center</h2>
            <p style="color: var(--text-muted); font-size: 0.95rem;">
              Download individual reports directly or select specific reports using checkboxes to create a custom ZIP bundle.
            </p>
          </div>

          <div style="background: var(--accent-bg); border: 1px solid var(--accent); padding: 1.25rem; border-radius: 8px; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h3 style="color: var(--accent); margin-bottom: 0.25rem;">📦 Export Selected Reports to ZIP</h3>
              <p style="color: var(--text); font-size: 0.88rem;">Select report checkboxes below and download your customized ZIP archive instantly.</p>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <button class="btn" onclick="toggleSelectAllReports(true)">Select All</button>
              <button class="btn" onclick="toggleSelectAllReports(false)">Deselect All</button>
              <button class="btn btn-primary" style="padding: 0.6rem 1.2rem; font-size: 0.95rem;" onclick="downloadSelectedZipBundle()">
                ⬇️ Download Selected ZIP
              </button>
            </div>
          </div>

          <div class="export-grid">
            
            <div class="export-card">
              <div>
                <div class="export-card-header">
                  <h3>📄 Markdown Tree</h3>
                  <input type="checkbox" class="checkbox-custom report-select-cb" data-file="PROJECT_STRUCTURE.md" checked />
                </div>
                <p>Standard tree structure with code blocks and file stats.</p>
              </div>
              <button class="btn" onclick="downloadReport('PROJECT_STRUCTURE.md')">Download Single MD</button>
            </div>

            <div class="export-card">
              <div>
                <div class="export-card-header">
                  <h3>📊 JSON Export</h3>
                  <input type="checkbox" class="checkbox-custom report-select-cb" data-file="PROJECT_STRUCTURE.json" checked />
                </div>
                <p>Full JSON tree representation with deep directory structure.</p>
              </div>
              <button class="btn" onclick="downloadReport('PROJECT_STRUCTURE.json')">Download Single JSON</button>
            </div>

            <div class="export-card">
              <div>
                <div class="export-card-header">
                  <h3>📐 SVG Diagram</h3>
                  <input type="checkbox" class="checkbox-custom report-select-cb" data-file="PROJECT_STRUCTURE.svg" checked />
                </div>
                <p>Vector graphic diagram of project structure tree.</p>
              </div>
              <button class="btn" onclick="downloadReport('PROJECT_STRUCTURE.svg')">Download Single SVG</button>
            </div>

            <div class="export-card">
              <div>
                <div class="export-card-header">
                  <h3>🧜‍♂️ Mermaid Diagram</h3>
                  <input type="checkbox" class="checkbox-custom report-select-cb" data-file="PROJECT_STRUCTURE.mmd" checked />
                </div>
                <p>Mermaid flowchart definitions for markdown embedding.</p>
              </div>
              <button class="btn" onclick="downloadReport('PROJECT_STRUCTURE.mmd')">Download Single Mermaid</button>
            </div>

            <div class="export-card">
              <div>
                <div class="export-card-header">
                  <h3>🤖 AI Context</h3>
                  <input type="checkbox" class="checkbox-custom report-select-cb" data-file="AI_CONTEXT.md" checked />
                </div>
                <p>Formatted AI context document optimized for LLMs.</p>
              </div>
              <button class="btn" onclick="downloadReport('AI_CONTEXT.md')">Download Single AI Context</button>
            </div>

            <div class="export-card">
              <div>
                <div class="export-card-header">
                  <h3>🧩 Component Usage</h3>
                  <input type="checkbox" class="checkbox-custom report-select-cb" data-file="COMPONENT_USAGE.json" checked />
                </div>
                <p>JSON report mapping component locations and usages.</p>
              </div>
              <button class="btn" onclick="downloadReport('COMPONENT_USAGE.json')">Download Single Component Report</button>
            </div>

            <div class="export-card">
              <div>
                <div class="export-card-header">
                  <h3>🔗 Dependency Graph</h3>
                  <input type="checkbox" class="checkbox-custom report-select-cb" data-file="IMPORT_GRAPH.json" checked />
                </div>
                <p>JSON map of import declarations and dependencies.</p>
              </div>
              <button class="btn" onclick="downloadReport('IMPORT_GRAPH.json')">Download Single Dependency Graph</button>
            </div>

            <div class="export-card">
              <div>
                <div class="export-card-header">
                  <h3>🧹 Dead Code Report</h3>
                  <input type="checkbox" class="checkbox-custom report-select-cb" data-file="DEAD_CODE.json" checked />
                </div>
                <p>JSON list of unused files and components.</p>
              </div>
              <button class="btn" onclick="downloadReport('DEAD_CODE.json')">Download Single Dead Code Report</button>
            </div>

            <div class="export-card">
              <div>
                <div class="export-card-header">
                  <h3>🏥 Project Health</h3>
                  <input type="checkbox" class="checkbox-custom report-select-cb" data-file="PROJECT_HEALTH.json" checked />
                </div>
                <p>Metrics on complexity, circular dependencies, and score.</p>
              </div>
              <button class="btn" onclick="downloadReport('PROJECT_HEALTH.json')">Download Single Health Metrics</button>
            </div>

          </div>
        </div>

        <div id="fileDetailSection" style="display: none;"></div>

      </div>
    </div>

  </div>

  <!-- Footer Shortcuts -->
  <div class="shortcuts-bar">
    <span>Shortcuts:</span>
    <span><kbd>/</kbd> Search</span>
    <span><kbd>D</kbd> Toggle Theme</span>
    <span><kbd>E</kbd> Export Center</span>
    <span><kbd>P</kbd> Print</span>
    <span><kbd>Esc</kbd> Reset</span>
  </div>

  <script>
    const ARCH_DATA = ${JSON.stringify(archData)};
    const CLIENT_REPORTS = ${JSON.stringify(clientReportsData)};

    // Pure JS Zip Builder embedded for client browser execution
    function buildClientZip(files) {
      const CRC_TABLE = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        CRC_TABLE[i] = c;
      }

      function getCrc(buf) {
        let crc = -1;
        for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
        return (crc ^ -1) >>> 0;
      }

      const encoder = new TextEncoder();
      const parts = [];
      const cdHeaders = [];
      let offset = 0;

      const d = new Date();
      const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (Math.floor(d.getSeconds() / 2));
      const date = ((Math.max(0, d.getFullYear() - 1980)) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();

      Object.keys(files).forEach(name => {
        const nameBuf = encoder.encode(name);
        const dataBuf = encoder.encode(files[name]);
        const crc = getCrc(dataBuf);
        const size = dataBuf.length;

        // Local Header
        const lh = new Uint8Array(30 + nameBuf.length);
        const dv = new DataView(lh.buffer);
        dv.setUint32(0, 0x04034b50, true);
        dv.setUint16(4, 20, true);
        dv.setUint16(6, 0, true);
        dv.setUint16(8, 0, true); // Store mode for browser speed
        dv.setUint16(10, time, true);
        dv.setUint16(12, date, true);
        dv.setUint32(14, crc, true);
        dv.setUint32(18, size, true);
        dv.setUint32(22, size, true);
        dv.setUint16(26, nameBuf.length, true);
        dv.setUint16(28, 0, true);
        lh.set(nameBuf, 30);

        // CD Header
        const cd = new Uint8Array(46 + nameBuf.length);
        const cdv = new DataView(cd.buffer);
        cdv.setUint32(0, 0x02014b50, true);
        cdv.setUint16(4, 20, true);
        cdv.setUint16(6, 20, true);
        cdv.setUint16(8, 0, true);
        cdv.setUint16(10, 0, true);
        cdv.setUint16(12, time, true);
        cdv.setUint16(14, date, true);
        cdv.setUint32(16, crc, true);
        cdv.setUint32(20, size, true);
        cdv.setUint32(24, size, true);
        cdv.setUint16(28, nameBuf.length, true);
        cdv.setUint16(30, 0, true);
        cdv.setUint16(32, 0, true);
        cdv.setUint16(34, 0, true);
        cdv.setUint16(36, 0, true);
        cdv.setUint32(38, 0, true);
        cdv.setUint32(42, offset, true);
        cd.set(nameBuf, 46);

        parts.push(lh, dataBuf);
        cdHeaders.push(cd);

        offset += lh.length + dataBuf.length;
      });

      const cdOffset = offset;
      let cdSize = 0;
      cdHeaders.forEach(c => cdSize += c.length);

      const eocd = new Uint8Array(22);
      const edv = new DataView(eocd.buffer);
      edv.setUint32(0, 0x06054b50, true);
      edv.setUint16(4, 0, true);
      edv.setUint16(6, 0, true);
      edv.setUint16(8, cdHeaders.length, true);
      edv.setUint16(10, cdHeaders.length, true);
      edv.setUint32(12, cdSize, true);
      edv.setUint32(16, cdOffset, true);

      return new Blob([...parts, ...cdHeaders, eocd], { type: 'application/zip' });
    }

    function downloadFile(filename, content, type = 'text/plain') {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function downloadReport(key) {
      if (CLIENT_REPORTS[key]) {
        const mime = key.endsWith('.json') ? 'application/json' : key.endsWith('.svg') ? 'image/svg+xml' : 'text/plain';
        downloadFile(key, CLIENT_REPORTS[key], mime);
      }
    }

    function toggleSelectAllReports(checked) {
      document.querySelectorAll('.report-select-cb').forEach(cb => cb.checked = checked);
    }

    function downloadSelectedZipBundle() {
      const selectedFiles = {};
      document.querySelectorAll('.report-select-cb').forEach(cb => {
        if (cb.checked) {
          const file = cb.dataset.file;
          if (CLIENT_REPORTS[file]) {
            selectedFiles[file] = CLIENT_REPORTS[file];
          }
        }
      });

      // Include manifest
      if (CLIENT_REPORTS['manifest.json']) {
        selectedFiles['manifest.json'] = CLIENT_REPORTS['manifest.json'];
      }

      if (Object.keys(selectedFiles).length <= 1) {
        alert('Please select at least one report checkbox to include in the ZIP bundle.');
        return;
      }

      const zipBlob = buildClientZip(selectedFiles);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project-analysis.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    document.addEventListener('DOMContentLoaded', () => {
      const tabs = document.querySelectorAll('.tab');
      const treeView = document.getElementById('treeView');
      const overviewView = document.getElementById('overviewView');
      const exportSection = document.getElementById('exportSection');
      const fileDetailSection = document.getElementById('fileDetailSection');
      const searchInput = document.getElementById('treeSearch');
      const themeToggleBtn = document.getElementById('themeToggleBtn');
      const printBtn = document.getElementById('printBtn');
      const exportCenterBtn = document.getElementById('exportCenterBtn');
      const files = document.querySelectorAll('.file');

      // Theme Toggle
      function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        themeToggleBtn.textContent = next === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode';
      }
      themeToggleBtn.addEventListener('click', toggleTheme);

      // Print
      printBtn.addEventListener('click', () => window.print());

      // Open Export Center
      exportCenterBtn.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelector('.tab[data-target="export"]').classList.add('active');
        treeView.style.display = 'none';
        overviewView.style.display = 'block';
        exportSection.style.display = 'block';
        fileDetailSection.style.display = 'none';
      });

      // Tabs Logic
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const target = tab.dataset.target;
          if (target === 'tree') {
            treeView.style.display = 'block';
            overviewView.style.display = 'none';
          } else if (target === 'export') {
            treeView.style.display = 'none';
            overviewView.style.display = 'block';
            exportSection.style.display = 'block';
            fileDetailSection.style.display = 'none';
          } else {
            treeView.style.display = 'none';
            overviewView.style.display = 'block';
          }
        });
      });

      // Search Filter
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('li').forEach(li => {
          const text = li.textContent.toLowerCase();
          if (text.includes(query)) {
            li.style.display = '';
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

      // File Details Panel
      files.forEach(f => {
        f.addEventListener('click', (e) => {
          files.forEach(el => el.classList.remove('active'));
          f.classList.add('active');

          const relPath = f.dataset.path;
          const usage = ARCH_DATA.usage[relPath] || { count: 0, by: [] };
          const imports = ARCH_DATA.imports[relPath] || [];
          const exports = ARCH_DATA.exports[relPath] || [];
          const isDead = (ARCH_DATA.deadCode.files || []).includes(relPath);

          let html = \`<div class="detail-section">
            <h2>📄 \${relPath}</h2>
            \${isDead ? '<span class="tag warn">Unused / Dead Code</span>' : '<span class="tag" style="color:var(--success);">Active Module</span>'}
          </div>\`;

          if (usage.count > 0) {
            html += \`<div class="detail-section">
              <h3 style="margin-bottom:8px;">Used By (\${usage.count})</h3>
              <ul>\${usage.by.map(b => \`<li>📄 \${b}</li>\`).join('')}</ul>
            </div>\`;
          }

          if (imports.length > 0) {
            html += \`<div class="detail-section">
              <h3 style="margin-bottom:8px;">Imports (\${imports.length})</h3>
              <ul>\${imports.map(i => \`<li>📦 \${i}</li>\`).join('')}</ul>
            </div>\`;
          }

          if (exports.length > 0) {
            html += \`<div class="detail-section">
              <h3 style="margin-bottom:8px;">Exports (\${exports.length})</h3>
              <ul>\${exports.map(ex => \`<li><span class="tag">\${ex}</span></li>\`).join('')}</ul>
            </div>\`;
          }

          exportSection.style.display = 'none';
          fileDetailSection.style.display = 'block';
          fileDetailSection.innerHTML = html;
          e.stopPropagation();
        });
      });

      // Keyboard Shortcuts
      document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          if (e.key === 'Escape') searchInput.blur();
          return;
        }
        if (e.key === '/') {
          e.preventDefault();
          searchInput.focus();
        } else if (e.key === 'd' || e.key === 'D') {
          toggleTheme();
        } else if (e.key === 'p' || e.key === 'P') {
          window.print();
        } else if (e.key === 'e' || e.key === 'E') {
          exportCenterBtn.click();
        } else if (e.key === 'Escape') {
          searchInput.value = '';
          searchInput.dispatchEvent(new Event('input'));
        }
      });
    });
  </script>
</body>
</html>`;
}

module.exports = { toHtml };
