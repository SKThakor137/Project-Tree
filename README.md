<p align="center">
  <h1 align="center">🌳 project-tree-md</h1>
  <p align="center"><strong>The Ultimate AI-Ready Project Structure CLI</strong></p>
  <p align="center">
    <a href="https://www.npmjs.com/package/project-tree-md"><img src="https://img.shields.io/npm/v/project-tree-md.svg?color=blue" alt="npm version" /></a>
    <a href="https://www.npmjs.com/package/project-tree-md"><img src="https://img.shields.io/npm/dm/project-tree-md.svg?color=green" alt="npm downloads" /></a>
    <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="zero dependencies" />
    <a href="https://github.com/SKThakor137/Project-Tree/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="license" /></a>
  </p>
</p>

Generate beautiful project structure docs in **Markdown**, **JSON**, **HTML**, **SVG**, and **Mermaid** — with colorized terminal preview, AI context token counter, architecture flow execution engine, file comment summarization, interactive HTML search, project auto-detection (30+ tools), and rich stats dashboard. **Zero runtime dependencies.**

---

## ✨ Features

| Feature | Description |
| :--- | :--- |
| ⚡ **Architecture Flow Engine** | Multi-language execution tree & framework role classification (`--flow`) |
| 🧮 **AI Token Estimator** | Estimate tokens & GPT-4o input costs without external libraries (`--tokens`) |
| 📝 **Header Comment Extractor** | Extract top file comments & `package.json` descriptions inline (`--summarize`) |
| 🔍 **Interactive HTML Search** | Sticky search bar with real-time tree filtering & folder auto-expand (`--html`) |
| 🌳 **Multi-format export** | Markdown, JSON, HTML (collapsible), SVG, Mermaid graph |
| 🎨 **4 tree themes** | `unicode` (default), `ascii`, `emoji`, `box` |
| 🤖 **AI context generation** | Full project context doc for ChatGPT/Claude/Gemini |
| 📊 **Stats dashboard** | Language breakdown, largest files/folders, depth analysis |
| 🔍 **30+ tool detection** | React, Next.js, Vue, Angular, TypeScript, Docker, CI/CD, etc. |
| 📋 **Auto clipboard** | Copies tree to clipboard automatically |
| 👀 **Watch mode** | Regenerate on file changes |
| 🔄 **Compare mode** | Diff two directory trees or JSON snapshots |
| 💉 **README inject** | Auto-inject tree into README.md markers |
| 📁 **Monorepo support** | TurboRepo, Nx, pnpm, Yarn, Lerna workspaces |
| 🔐 **Sensitive file masking** | Hides `.env`, secrets, private keys |
| 📂 **Gitignore-aware** | Parses `.gitignore`, `.npmignore`, `.ignore` |
| 🗜️ **Tree compression** | Collapse single-child chains (`a/b/c`) |
| 📏 **File details** | Show file sizes and extensions |
| ⚡ **Zero dependencies** | Only Node.js built-in modules |

---

## 📦 Installation

```bash
# Global install
npm install -g project-tree-md

# Or run directly
npx project-tree-md
```

---

## 🚀 Quick Start

```bash
# Basic usage — generates PROJECT_STRUCTURE.md
npx project-tree-md

# Generate Architecture Execution Flow & Role Map
npx project-tree-md --flow

# Output AI context token count and cost estimation
npx project-tree-md --tokens

# Extract file header comment summaries inline
npx project-tree-md --summarize

# Export to interactive HTML with search bar
npx project-tree-md --html

# Full feature run
npx project-tree-md --flow --summarize --tokens --ai --html
```

---

## 🎯 CLI Reference

```
project-tree-md — AI-Ready Project Structure Generator

Usage:
  npx project-tree-md [options]
  npx project-tree-md compare <pathA> <pathB>

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

Export Formats:
  --json                  Export as JSON
  --html                  Export as collapsible HTML with interactive search
  --svg                   Export as SVG diagram
  --mermaid               Export as Mermaid graph

AI Features:
  --ai                    Generate AI context document
  --prompt                Generate AI-ready prompt
  --tokens                Output AI context token count & cost estimation

Advanced:
  --inject <file>         Inject tree into file markers
  --watch                 Watch for changes & regenerate
  --max-size <size>       Skip files larger than size   (e.g. 5MB, 500KB)
  --include-binary        Include binary files
  --show-sensitive        Show sensitive files (.env, secrets)
  --no-ignore             Skip .gitignore parsing
  -i, --interactive       Interactive setup mode

Other:
  -h, --help              Show this help
  -v, --version           Show version

Subcommands:
  compare <a> <b>         Compare two dirs/snapshots
```

---

## ⚡ Architecture Flow Engine (`--flow`)

Map out component connections, call metrics, and structural framework roles across **JavaScript/TypeScript**, **Python**, **Go**, **PHP**, **C/C++**, and **React/Next.js**:

```bash
npx project-tree-md --flow
```

Output:
```text
📦 Global Application Architecture Flow
│
└── 🌐 [ROUTE] src/routes/user.routes.js ───────────────────────── [2.1 KB] ──> Type: Route/Endpoint
    └── ⚙️ [CONTROLLER] src/controllers/user.controller.js ─────── [4.5 KB] ──> Type: Controller (1 call)
        ├── 🛡️ [MIDDLEWARE] src/middlewares/auth.middleware.js ─── [1.8 KB] ──> Type: Middleware
        └── 💼 [SERVICE] src/services/user.service.js ──────────── [6.2 KB] ──> Type: Business Logic
```

- **Intelligent Role Classifier**: Automatically detects `ROUTE` 🌐, `CONTROLLER` ⚙️, `SERVICE` 💼, `MODEL` 🗄️, `MIDDLEWARE` 🛡️, `LAYOUT` 📋, `PAGE` 💻, `CLIENT_COMP` 🧱, `ENTRY` 🚀.
- **Universal Multi-Language Import Scanner**: Resolves relative imports across JS/TS (`import`/`require`), Python (`from .`), Go (`import`), PHP (`require`), C/C++ (`#include`).
- **Tabular Alignment**: Clean `padEnd` right-aligned formatting displaying file sizes and call frequencies.

---

## 🧮 AI Context Token Estimator (`--tokens`)

Estimate the token count and API input cost for generated project structure and AI context files:

```bash
npx project-tree-md --tokens
```

Output:
```text
🧮 Estimated Context Tokens: 1,447 tokens (~$0.0036 cost for GPT-4o input).
```

---

## 📝 File Header Comment Extractor (`--summarize`)

Extract top file comments and descriptions inline right next to file names:

```bash
npx project-tree-md --summarize
```

---

## 🔍 Interactive Search Bar for HTML Export (`--html`)

Generates a standalone, self-contained HTML report featuring a responsive sticky search input:

```bash
npx project-tree-md --html
```

---

## 🎨 Tree Themes

### Unicode (default)
```
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

---

## 🤖 AI Context Generation

Generate a comprehensive project context document for AI assistants:

```bash
npx project-tree-md --ai --tokens --flow
```

---

## 📦 Programmatic API

```javascript
const {
  generateTree,
  scan,
  generateArchitectureFlow,
  detectFrameworkRole,
  estimateTokens,
  extractFileSummary,
} = require('project-tree-md');

// Generate complete tree with architecture flow
const result = generateTree({
  rootDir: process.cwd(),
  flow: true,
  summarize: true,
});

console.log(result.coloredTreeText);
console.log(result.coloredFlowText);

// Direct architecture flow generation
const flow = generateArchitectureFlow(process.cwd());
console.log(flow.flowText);
```

---

## 🧪 Local Testing

```bash
# Run CLI directly
node bin/cli.js --flow

# Run all test suites
npm run test:all

# Run architecture flow test suite
npm run test:flow
```

---

## 📄 License

[MIT](LICENSE) © [SKThakor137](https://github.com/SKThakor137)
