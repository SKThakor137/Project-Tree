<p align="center">
  <a href="https://github.com/SKThakor137/Project-Tree">
    <img src="https://raw.githubusercontent.com/SKThakor137/Project-Tree/main/assets/banner.png" alt="project-tree-md Banner" width="100%" onerror="this.style.display='none'" />
  </a>
  <h1 align="center">🌳 project-tree-md</h1>
  <p align="center">
    <strong>The Ultimate AI-Ready Project Analysis, Architecture & Visualizer Suite</strong><br>
    <em>Generate 2D & 3D Interactive Code Graphs, Markdown, JSON, HTML, SVG, Mermaid, ZIP Bundles & AI Context in 1-Second. Zero Dependencies.</em>
  </p>
  <p align="center">
    <a href="https://www.npmjs.com/package/project-tree-md"><img src="https://img.shields.io/npm/v/project-tree-md.svg?style=for-the-badge&color=58a6ff" alt="npm version" /></a>
    <a href="https://www.npmjs.com/package/project-tree-md"><img src="https://img.shields.io/npm/dm/project-tree-md.svg?style=for-the-badge&color=3fb950" alt="npm downloads" /></a>
    <a href="https://github.com/SKThakor137/Project-Tree"><img src="https://img.shields.io/badge/dependencies-0-brightgreen?style=for-the-badge" alt="zero dependencies" /></a>
    <a href="https://github.com/SKThakor137/Project-Tree/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="license" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D14-success?style=for-the-badge" alt="node version" /></a>
  </p>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-universal-code-relationship-visualizer----visualize">Interactive Code Graph</a> •
  <a href="#-why-project-tree-md">Why Us?</a> •
  <a href="#-bundle-export-workflow---bundle">ZIP Bundles</a> •
  <a href="#-architecture-flow-engine---flow">Architecture Flow</a> •
  <a href="#-programmatic-api">API Usage</a>
</p>

---

## 🚀 Instant Usage (No Install Required)

Run a complete codebase analysis and generate `PROJECT_STRUCTURE.md` immediately in any repository:

```bash
npx project-tree-md
```

Generate a 2D **Interactive Code Relationship Graph HTML** (`CODE_GRAPH.html`):

```bash
npx project-tree-md --visualize
```

Generate a 3D **WebGL Immersive Code Relationship Graph HTML** (`CODE_GRAPH_3D.html`):

```bash
npx project-tree-md --visualize-3d
```

---

## 🌐 Universal 2D & 3D Code Relationship Visualizers (`--visualize`, `--visualize-3d`)

Transform any codebase into dynamic, interactive 2D canvas & 3D WebGL graphs showing complete architecture, dependency graphs, state flows, hooks, models, and service relationships!

```
                     App.jsx (React)
                  /         |        \
                 ▼          ▼         ▼
             Header     Sidebar   AuthContext
               │            │         │
               ▼            ▼         ▼
           UserMenu      NavList   useAuth()
                                      │
                                      ▼
                                userService.js (API)
```

### 🎨 2D Interactive Canvas Visualizer (`--visualize`)

```bash
npx project-tree-md --visualize
```

Generates high-performance 2D canvas visualizer (`CODE_GRAPH.html`):
* 🎨 **5 Layout Engines**: Switch on-the-fly between **DAG (Sugiyama)**, **Force-Directed (Barnes-Hut)**, **Tree**, **Radial**, and **Horizontal Flow**.
* 🚀 **Multi-Language Support**: Framework-agnostic parsing for **20+ languages and frameworks** (React, Next.js, Vue, Angular, Svelte, Laravel, PHP, Node.js, Express, NestJS, Flutter, Dart, React Native, Python, Django, FastAPI, Java, Spring Boot, .NET/C#, Go, Rust).
* ⚡ **High-Performance Canvas Rendering**: Virtual viewport rendering scales smoothly to 10,000+ nodes at 60 FPS.
* 🔍 **Real-Time Instant Search & Minimap**: Live query filtering with auto-centering (`Ctrl+F`) and draggable minimap.
* 📑 **Slide-out Detail Panel**: Inspect code metrics, file size, line counts, incoming imports, outgoing exports, and dependencies.
* 📷 **PNG & JSON Export**: Export high-res vector PNG diagrams or raw `CODE_GRAPH.json` models.

### 🧊 3D WebGL Immersive Visualizer (`--visualize-3d`)

```bash
npx project-tree-md --visualize-3d
```

Generates immersive 3D force-directed WebGL visualizer (`CODE_GRAPH_3D.html`):
* 🌌 **Interactive 3D Sphere & Force Spatial Engine**: Explore project architecture in full 3D space with particle link effects and dynamic node spheres.
* 🕹️ **Full Camera Navigation & Orbit Controls**: Rotate, zoom, pan, and focus in 3D perspective or orthographic view modes.
* 💡 **Dynamic 3D Lighting & Shading**: Dark/Light mode with glowing status nodes, directional light sources, and particle beams.
* 🎯 **3D Node Inspection & Focus**: Click any 3D node to smoothly focus camera and inspect dependency subtrees and code metrics.

---

## 🔥 Why `project-tree-md`?

Most directory tree generators only print basic text folders. **`project-tree-md` is a complete project intelligence suite** designed for modern developers and AI workflows (ChatGPT, Claude, Gemini, Cursor, Copilot).

```
                  ┌──────────────────────────────────────────────┐
                  │           npx project-tree-md                │
                  └──────────────────────┬───────────────────────┘
                                         │
       ┌──────────────────┬──────────────┼──────────────┬──────────────────┬──────────────────┐
       │                  │              │              │                  │                  │
 🌐 Code Visualizer 📄 Markdown Tree 📊 JSON & SVG  📦 ZIP Bundle  🤖 AI Context   🌐 HTML Dashboard
```

### ⚡ Key Capabilities

* 🌐 **Universal 2D & 3D Code Relationship Visualizers (`--visualize`, `--visualize-3d`)**: Generate standalone 2D canvas (`CODE_GRAPH.html`) and 3D WebGL (`CODE_GRAPH_3D.html`) interactive visualizers for codebases in 20+ programming languages.
* 📋 **Graph JSON Export (`--graph-json`)**: Output structured node and edge relationship models for complete graph reconstruction.
* 📦 **ZIP Analysis Bundles (`--bundle`)**: Export up to 20 analysis reports (Markdown, Interactive Graph, JSON, HTML, SVG, Mermaid, AI Context, Health Metrics, Component Maps, Dead Code) into a single `project-analysis.zip` archive.
* 💻 **In-Browser HTML Download Center (`--html`)**: Standalone HTML dashboard with sticky real-time search, Dark/Light mode, and 1-click browser ZIP file downloads.
* ⚡ **Architecture Flow Engine (`--flow`)**: Scans imports across JS/TS, Python, Go, PHP, C/C++, and React/Next.js to construct execution flow maps.
* 🧹 **Dead Code & Circular Dependency Detection (`--architecture`)**: Detects unused files, dead components, cyclomatic complexity, and circular import loops.
* 🤖 **AI-Ready Context & Token Counter (`--ai`, `--tokens`)**: Generates structured prompt documents for LLMs with token estimation and cost calculations.
* 📝 **File Comment Summarizer (`--summarize`)**: Parses top file headers inline to describe module purposes right next to file trees.
* 📁 **Monorepo & 30+ Stack Auto-Detection**: Native support for TurboRepo, Nx, pnpm, Yarn, Lerna, Docker, CI/CD, React, Vue, Angular, Svelte, Next.js, and more.
* 🔒 **Gitignore & Sensitive File Shield**: Automatically respects `.gitignore`, `.npmignore`, and masks `.env`, secrets, and private keys.
* ⚡ **Zero Runtime Dependencies**: Built 100% with Node.js standard modules. Ultra-fast, lightweight, and safe.

---

## 🏆 Feature Comparison

| Feature | `project-tree-md` | `tree` (Unix) | `tree-cli` | `directory-tree` |
| :--- | :---: | :---: | :---: | :---: |
| **Interactive Code Visualizer** | ✅ **2D Canvas & 3D WebGL** | ❌ No | ❌ No | ❌ No |
| **Universal Graph JSON** | ✅ **Built-in** | ❌ No | ❌ No | ❌ No |
| **Markdown Export** | ✅ **Built-in** | ❌ No | ❌ No | ❌ No |
| **Zero Dependencies** | ✅ **100% Zero** | ✅ System | ❌ Heavy | ❌ Heavy |
| **ZIP Bundle Export** | ✅ **1-Click ZIP** | ❌ No | ❌ No | ❌ No |
| **HTML Download Center** | ✅ **Interactive** | ❌ No | ❌ No | ❌ No |
| **AI LLM Context & Tokens** | ✅ **Built-in** | ❌ No | ❌ No | ❌ No |
| **Architecture Flow Engine** | ✅ **Multi-Language** | ❌ No | ❌ No | ❌ No |
| **Dead Code & Circular Deps** | ✅ **Built-in** | ❌ No | ❌ No | ❌ No |
| **Comment Summarizer** | ✅ **Inline Headers** | ❌ No | ❌ No | ❌ No |
| **Gitignore Support** | ✅ **Auto-Parsed** | ❌ Manual | ⚠️ Limited | ❌ No |
| **Project Stack Detection** | ✅ **30+ Tools** | ❌ No | ❌ No | ❌ No |

---

## ⚡ Quick Examples & Commands

### 1. Interactive 2D & 3D Code Relationship Visualizers
```bash
# Generate 2D interactive graph (CODE_GRAPH.html)
npx project-tree-md --visualize

# Generate 3D WebGL interactive graph (CODE_GRAPH_3D.html)
npx project-tree-md --visualize-3d

# Export Universal Graph Model JSON
npx project-tree-md --graph-json

# Export 2D graph, 3D graph, and JSON model together
npx project-tree-md --visualize --visualize-3d --graph-json
```

### 2. Default Run (Generates `PROJECT_STRUCTURE.md`)
```bash
npx project-tree-md
```

### 3. Generate Full ZIP Analysis Bundle
```bash
# Package all reports (including CODE_GRAPH.html & JSON) into project-analysis.zip
npx project-tree-md --bundle

# Custom ZIP containing only graph, HTML, JSON & SVG reports
npx project-tree-md --bundle graph,html,json,svg

# Target custom output folder
npx project-tree-md --bundle --output-dir dist/reports/
```

### 4. Selective Format Exports
```bash
# Export only HTML, JSON, and SVG files
npx project-tree-md --export html,json,svg --output-dir reports/

# Export all individual reports into folder
npx project-tree-md --export-all
```

### 5. Architecture Execution Flow & Role Mapping
```bash
npx project-tree-md --flow
```

### 6. AI LLM Context Generation & Token Estimation
```bash
npx project-tree-md --ai --tokens
```

---

## 📦 Bundle Export System (`--bundle`)

Generate a comprehensive project analysis package containing up to 20 report files:

```bash
npx project-tree-md --bundle --output-dir reports/
```

```text
project-analysis.zip
│
├── CODE_GRAPH.html           # 2D Interactive Code Relationship Graph Visualizer
├── CODE_GRAPH_3D.html        # 3D WebGL Immersive Code Graph Visualizer
├── CODE_GRAPH.json           # Universal Graph JSON Model
├── PROJECT_STRUCTURE.md      # Standard Markdown project tree
├── PROJECT_STRUCTURE.json    # Full JSON tree hierarchy & metadata
├── PROJECT_STRUCTURE.html    # Interactive HTML Dashboard & Download Center
├── PROJECT_STRUCTURE.svg     # Vector graphic visual tree diagram
├── PROJECT_STRUCTURE.mmd     # Mermaid flowchart definition
├── AI_CONTEXT.md             # LLM-ready context document
├── COMPONENT_USAGE.json      # React/Vue component usage map
├── IMPORT_GRAPH.json         # Module import dependency map
├── EXPORT_GRAPH.json         # File export definitions map
├── DEAD_CODE.json            # Unused files & dead code report
├── UNUSED_COMPONENTS.json    # List of unused components
├── CIRCULAR_DEPENDENCIES.json# Circular import loop detection
├── PROJECT_STATS.json        # Deep codebase statistics
├── PROJECT_HEALTH.json       # Code health metrics & grade (A-D)
├── FRAMEWORK_INFO.json       # Project environment & stack info
├── LANGUAGE_BREAKDOWN.json   # Language file & line breakdown
├── DEPENDENCY_HEATMAP.json   # Most imported/used modules
├── README_ANALYSIS.md        # Executive markdown report
└── manifest.json             # Bundle metadata & timestamp
```

---

## 🎯 Complete CLI Options

```text
project-tree-md — AI-Ready Project Analysis Suite

Usage:
  npx project-tree-md [options]
  npx project-tree-md compare <pathA> <pathB>

Visualizer & Graph Options:
  --visualize, --graph        Generate interactive 2D Code Relationship Graph HTML (CODE_GRAPH.html)
  --visualize-3d, --3d-graph  Generate interactive 3D WebGL Code Relationship Graph HTML (CODE_GRAPH_3D.html)
  --graph-json                Export universal graph model JSON (CODE_GRAPH.json)

Bundle & Export System:
  --bundle [list]         Generate ZIP package with all or selected reports (e.g. --bundle graph,html,json)
  --export [list]         Export selected reports to directory (e.g. --export graph,html,json)
  --export-all            Export all individual analysis reports
  --output-dir <dir>      Output directory for exports and ZIP bundles
  --no-write, --stdout    Print to console without writing default output files

Output Options:
  -o, --out <file>        Output filename              (default: PROJECT_STRUCTURE.md)
  -L, --depth <n>         Max depth to traverse        (default: unlimited)
  -I, --exclude <regex>   Custom exclude pattern       (default: standard ignores)
  --no-copy               Do not copy to clipboard
  --theme <name>          Tree theme                   (unicode|ascii|emoji|box)
  --details               Show file size & extension
  --summarize             Extract & show inline file comment summaries
  --flow                  Generate architecture execution flow & role map
  --compress              Compress single-child dirs
  --collapse <n>          Collapse dirs with >n files
  --dashboard             Show rich stats dashboard
  --architecture          Enable advanced architecture parsing & metrics

Export Formats:
  --json                  Export as JSON
  --html                  Export as collapsible HTML with Download Center
  --svg                   Export as SVG diagram
  --mermaid               Export as Mermaid graph

AI Features:
  --ai                    Generate AI context document
  --prompt                Generate AI-ready prompt
  --tokens                Output AI context token count & cost estimation

Other Options:
  -h, --help              Show this help
  -v, --version           Show version
```

---

## 📦 Programmatic Node.js API

Integrate `project-tree-md` into your build tools, scripts, or CI/CD pipelines:

```javascript
const {
  generateTree,
  generateUniversalGraph,
  toGraphVisualizerHtml,
  toGraph3dVisualizerHtml,
  toGraphJson,
  fromGraphJson,
  generateBundle,
  exportReports,
  createZip,
  generateArchitectureFlow,
  estimateTokens,
} = require('project-tree-md');

// 1. Generate Universal Graph Model & 2D / 3D Interactive HTML Visualizers
const graphModel = generateUniversalGraph(process.cwd());
const graph2dHtml = toGraphVisualizerHtml(graphModel, 'My Project');
const graph3dHtml = toGraph3dVisualizerHtml(graphModel, 'My Project');
const graphJson = toGraphJson(graphModel);

console.log(`Graph Nodes: ${graphModel.nodes.length}, Edges: ${graphModel.edges.length}`);

// 2. Generate full tree
const result = generateTree({
  rootDir: process.cwd(),
  flow: true,
  summarize: true,
});

console.log(result.coloredTreeText);

// 3. Generate customized ZIP bundle programmatically
const bundle = generateBundle({
  rootDir: process.cwd(),
  outputDir: 'dist/reports',
  bundleName: 'my-app-analysis.zip',
  exportList: ['graph', 'html', 'json', 'svg'],
});

console.log(`ZIP created at: ${bundle.zipPath} (${bundle.sizeMb} MB)`);
```

---

## 📁 Monorepo & Framework Auto-Detection

Automatically classifies and detects 30+ technologies:
- **Monorepos**: TurboRepo, Nx, pnpm Workspaces, Yarn Workspaces, Lerna.
- **Frameworks**: React, Next.js, Vue, Nuxt, Angular, Svelte, Express, NestJS, FastAPI, Django, Laravel, Spring Boot, Flutter/Dart, .NET, Go, Rust.
- **Languages**: TypeScript, JavaScript, Python, Go, Rust, Java, C/C++, PHP, Ruby, Dart, C#.
- **Tools**: Docker, GitHub Actions, CI/CD, TailwindCSS, Vite, Webpack, ESLint, Prettier, Jest, Vitest.

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!  
Feel free to check out the [Issues Page](https://github.com/SKThakor137/Project-Tree/issues).

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

© [SKThakor137](https://github.com/SKThakor137). Built with ❤️ for developers worldwide.
