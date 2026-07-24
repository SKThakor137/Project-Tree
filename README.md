<p align="center">
  <a href="https://github.com/SKThakor137/Project-Tree">
    <img src="https://raw.githubusercontent.com/SKThakor137/Project-Tree/main/assets/banner.png" alt="project-tree-md Banner" width="100%" onerror="this.style.display='none'" />
  </a>
  <h1 align="center">🌳 project-tree-md</h1>
  <p align="center">
    <strong>The Ultimate AI-Ready Project Analysis & Export Suite</strong><br>
    <em>Generate Markdown, JSON, HTML, SVG, Mermaid, ZIP Bundles & AI Context in 1-Second. Zero Dependencies.</em>
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
  <a href="#-why-project-tree-md">Why Us?</a> •
  <a href="#-bundle-export-workflow---bundle">ZIP Bundles</a> •
  <a href="#-html-download-center---html">HTML Dashboard</a> •
  <a href="#-architecture-flow-engine---flow">Architecture Flow</a> •
  <a href="#-programmatic-api">API Usage</a>
</p>

---

## 🚀 Instant Usage (No Install Required)

Run a complete codebase analysis and generate `PROJECT_STRUCTURE.md` immediately in any repository:

```bash
npx project-tree-md
```

---

## 🔥 Why `project-tree-md`?

Most directory tree generators only print basic text folders. **`project-tree-md` is a complete project intelligence suite** designed for modern developers and AI workflows (ChatGPT, Claude, Gemini, Cursor, Copilot).

```
                  ┌──────────────────────────────────────────────┐
                  │           npx project-tree-md                │
                  └──────────────────────┬───────────────────────┘
                                         │
       ┌──────────────────┬──────────────┼──────────────┬──────────────────┐
       │                  │              │              │                  │
 📄 Markdown Tree   📊 JSON & SVG   📦 ZIP Bundle  🤖 AI Context   🌐 HTML Dashboard
```

### ⚡ Key Capabilities

* 📦 **ZIP Analysis Bundles (`--bundle`)**: Export up to 19 analysis reports (Markdown, JSON, HTML, SVG, Mermaid, AI Context, Health Metrics, Component Maps, Dead Code) packaged into a single `project-analysis.zip` file with customizable report filtering.
* 💻 **In-Browser HTML Download Center (`--html`)**: Generates an interactive, standalone HTML dashboard with real-time sticky search, folder auto-expand, Dark/Light mode, print optimization, and **1-click browser ZIP & file downloads** (zero backend needed!).
* ⚡ **Architecture Flow Engine (`--flow`)**: Scans imports across **JavaScript/TypeScript**, **Python**, **Go**, **PHP**, **C/C++**, and **React/Next.js** to construct a route → controller → service execution flow map with framework role detection.
* 🧹 **Dead Code & Circular Dependency Detection (`--architecture`)**: Scans AST declarations to spot unused files, dead components, cyclomatic complexity scores, and circular import loops.
* 🤖 **AI-Ready Context & Token Counter (`--ai`, `--tokens`)**: Generates structured prompt documents for LLMs with token estimation and GPT-4o input cost calculations.
* 📝 **File Comment Summarizer (`--summarize`)**: Parses top file comment headers inline to describe module purposes right next to file trees.
* 🎨 **4 Visual Themes**: Switch between `unicode` (default), `ascii`, `emoji`, and `box` themes.
* 📁 **Monorepo & 30+ Stack Auto-Detection**: Native support for TurboRepo, Nx, pnpm, Yarn, Lerna, Docker, CI/CD, React, Vue, Angular, Svelte, Next.js, and more.
* 🔒 **Gitignore & Sensitive File Shield**: Automatically respects `.gitignore`, `.npmignore`, and masks `.env`, secrets, and private keys.
* ⚡ **Zero Runtime Dependencies**: Built 100% with Node.js standard modules (`zlib`, `fs`, `path`). Ultra-fast, lightweight, and safe.

---

## 🏆 Feature Comparison

| Feature | `project-tree-md` | `tree` (Unix) | `tree-cli` | `directory-tree` |
| :--- | :---: | :---: | :---: | :---: |
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

### 1. Default Run (Generates `PROJECT_STRUCTURE.md`)
```bash
npx project-tree-md
```

### 2. Generate Full ZIP Analysis Bundle
```bash
# Package all reports into project-analysis.zip
npx project-tree-md --bundle

# Custom ZIP containing only HTML, JSON & SVG reports
npx project-tree-md --bundle html,json,svg

# Target custom output folder
npx project-tree-md --bundle --output-dir dist/reports/
```

### 3. Selective Format Exports
```bash
# Export only HTML, JSON, and SVG files
npx project-tree-md --export html,json,svg --output-dir reports/

# Export all 19 individual reports into folder
npx project-tree-md --export-all
```

### 4. Architecture Execution Flow & Role Mapping
```bash
npx project-tree-md --flow
```

### 5. AI LLM Context Generation & Token Estimation
```bash
npx project-tree-md --ai --tokens
```

### 6. Interactive Setup Wizard
```bash
npx project-tree-md -i
```

---

## 📦 Bundle Export System (`--bundle`)

Generate a comprehensive project analysis package containing up to 19 report files:

```bash
npx project-tree-md --bundle --output-dir reports/
```

```text
project-analysis.zip
│
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

### Terminal Output Summary

```text
📦 Bundle Generated Successfully

Location:
project-analysis.zip

Reports Included in ZIP:
  ✓ PROJECT_STRUCTURE.html
  ✓ PROJECT_STRUCTURE.json
  ✓ PROJECT_STATS.json
  ✓ manifest.json

Total Files: 4
Bundle Size: 0.02 MB
✅ Project structure written to PROJECT_STRUCTURE.md
```

---

## 💻 Interactive HTML Download Center (`--html`)

Upgrade your project tree into a web dashboard:

```bash
npx project-tree-md --html
```

### Dashboard Highlights

* **Checkboxes & Custom ZIP Builder**: Select which report formats you want in your ZIP archive directly from the UI.
* **1-Click Downloads**: Download Markdown, JSON, SVG, Mermaid, AI Context, or ZIP bundles with zero server requirements.
* **Sticky Real-Time Search**: Search bar (`/` shortcut) filters files instantly and auto-expands parent folder trees.
* **Architecture Inspector**: Click any file to inspect incoming imports, outgoing exports, component usages, and dead code alerts.
* **Dark / Light Mode**: Seamless theme switching (`D` shortcut).
* **Print Optimized**: Clean `@media print` rules for instant PDF saving (`P` shortcut).

---

## ⚡ Architecture Flow Engine (`--flow`)

Map execution flows across **JavaScript/TypeScript**, **Python**, **Go**, **PHP**, **C/C++**, and **React/Next.js**:

```bash
npx project-tree-md --flow
```

```text
📦 Global Application Architecture Flow
│
└── 🌐 [ROUTE] src/routes/user.routes.js ───────────────────────── [2.1 KB] ──> Type: Route/Endpoint
    └── ⚙️ [CONTROLLER] src/controllers/user.controller.js ─────── [4.5 KB] ──> Type: Controller (1 call)
        ├── 🛡️ [MIDDLEWARE] src/middlewares/auth.middleware.js ─── [1.8 KB] ──> Type: Middleware
        └── 💼 [SERVICE] src/services/user.service.js ──────────── [6.2 KB] ──> Type: Business Logic
```

---

## 🎨 Tree Themes

### Unicode (Default)
```text
project-tree-md
├── bin
│   └── cli.js
├── src
│   ├── core
│   │   ├── scanner.js
│   │   └── formatter.js
│   └── index.js
└── package.json
```

### Emoji (`--theme emoji`)
```text
📁 project-tree-md
├── 📁 bin
│   └── 📄 cli.js
├── 📁 src
│   ├── 📁 core
│   │   ├── 📄 scanner.js
│   │   └── 📄 formatter.js
│   └── 📄 index.js
└── 📄 package.json
```

---

## 🎯 Complete CLI Options

```text
project-tree-md — AI-Ready Project Analysis Suite

Usage:
  npx project-tree-md [options]
  npx project-tree-md compare <pathA> <pathB>

Bundle & Export System:
  --bundle [list]         Generate ZIP package with all or selected reports (e.g. --bundle html,json,svg)
  --export [list]         Export selected reports to directory (e.g. --export html,json)
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
  generateBundle,
  exportReports,
  createZip,
  generateArchitectureFlow,
  estimateTokens,
} = require('project-tree-md');

// 1. Generate full tree
const result = generateTree({
  rootDir: process.cwd(),
  flow: true,
  summarize: true,
});

console.log(result.coloredTreeText);
console.log(result.statsText);

// 2. Generate customized ZIP bundle programmatically
const bundle = generateBundle({
  rootDir: process.cwd(),
  outputDir: 'dist/reports',
  bundleName: 'my-app-analysis.zip',
  exportList: ['html', 'json', 'svg'],
});

console.log(`ZIP created at: ${bundle.zipPath} (${bundle.sizeMb} MB)`);

// 3. Selective format export
exportReports({
  rootDir: process.cwd(),
  outputDir: 'dist/exports',
  exportList: 'html,json',
});

// 4. Create custom zero-dependency ZIP archive
const zipBuffer = createZip({
  'README.txt': 'Project Tree Analysis',
  'data.json': JSON.stringify({ status: 'success' }),
});
```

---

## 📁 Monorepo & Framework Auto-Detection

Automatically classifies and detects 30+ technologies:
- **Monorepos**: TurboRepo, Nx, pnpm Workspaces, Yarn Workspaces, Lerna.
- **Frameworks**: React, Next.js, Vue, Nuxt, Angular, Svelte, Express, NestJS, FastAPI, Django, Laravel, Spring Boot.
- **Languages**: TypeScript, JavaScript, Python, Go, Rust, Java, C/C++, PHP, Ruby.
- **Tools**: Docker, GitHub Actions, CI/CD, TailwindCSS, Vite, Webpack, ESLint, Prettier, Jest, Vitest.

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!  
Feel free to check out the [Issues Page](https://github.com/SKThakor137/Project-Tree/issues).

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

© [SKThakor137](https://github.com/SKThakor137). Built with ❤️ for developers worldwide.
