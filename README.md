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

Generate beautiful project structure docs in **Markdown**, **JSON**, **HTML**, **SVG**, and **Mermaid** — with colorized terminal preview, AI context token counter, file comment summarization, interactive HTML search, project auto-detection (30+ tools), and rich stats dashboard. **Zero runtime dependencies.**

---

## ✨ Features

| Feature | Description |
| :--- | :--- |
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

# Output AI context token count and cost estimation
npx project-tree-md --tokens

# Extract file header comment summaries inline
npx project-tree-md --summarize

# Export to interactive HTML with search bar
npx project-tree-md --html

# Combined AI-ready run
npx project-tree-md --summarize --tokens --ai --html
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

## 🧮 AI Context Token Estimator (`--tokens`)

Estimate the token count and API input cost for generated project structure and AI context files:

```bash
npx project-tree-md --tokens
```

Output:
```text
🧮 Estimated Context Tokens: 1,447 tokens (~$0.0036 cost for GPT-4o input).
```

- **Zero-Dependency BPE Estimator**: Tuned to simulate OpenAI (`tiktoken`) and Claude tokenization by factoring in indentation runs, line breaks, word boundaries, and punctuation.
- **Cost Calculator**: Computes estimated input cost based on GPT-4o model pricing ($2.50 per 1,000,000 tokens).

---

## 📝 File Header Comment Extractor (`--summarize`)

Extract top file comments and descriptions inline right next to file names:

```bash
npx project-tree-md --summarize
```

Output:
```text
project-tree-md
├── bin
│   └── cli.js                          # CLI entrypoint and command parser for project-tree-md.
├── package.json                        # The ultimate AI-ready project structure CLI.
├── README.md                           # ✨ Features
├── src
│   ├── core
│   │   ├── formatter.js                # Formats directory trees into plain text and colorized terminal outputs.
│   │   ├── generator.js                # Main generator orchestrator — scans directory and generates tree.
│   │   ├── scanner.js                  # Directory tree scanner module for building project hierarchy nodes.
│   │   └── stats.js                    # Computes directory tree statistics and dashboard metrics.
│   ├── exporters
│   │   ├── html.js                     # Self-contained HTML project tree generator with interactive search.
│   │   └── markdown.js                 # Markdown exporter — generates PROJECT_STRUCTURE.
│   └── features
│       ├── summarize.js                # Clean and format raw comment text into a 1-sentence description.
│       └── tokens.js                   # Estimate tokens for a string using a lightweight heuristic.
```

- **Supported Formats**: Single-line (`//`, `#`, `--`, `;`), multi-line (`/* ... */`, `''' ... '''`, `<!-- ... -->`), JSDoc headers, `package.json` descriptions, and Markdown titles.
- **Aligned Layout**: Automatically aligns all `#` inline comments at a clean, consistent column width across terminal and Markdown trees.

---

## 🔍 Interactive Search Bar for HTML Export (`--html`)

Generates a standalone, self-contained HTML report featuring a responsive sticky search input:

```bash
npx project-tree-md --html
```

- **Sticky Search Header**: `🔍 Search files or folders...` bar stays pinned to top as you scroll.
- **Real-Time DOM Filtering**: Dynamically filters files and folders as you type.
- **Auto-Expanding Tree**: Automatically expands parent `<details>` folders to reveal matching nested items.

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

### Emoji (`--theme emoji`)
```
📁 project-tree-md
├── 📁 bin
│   └── 📄 cli.js
├── 📁 src
│   ├── 📁 core
│   │   ├── 📄 scanner.js
│   │   └── 📄 formatter.js
│   └── 📄 index.js
└── 📋 package.json
```

---

## 🤖 AI Context Generation

Generate a comprehensive project context document for AI assistants:

```bash
npx project-tree-md --ai --tokens
```

Creates `AI_CONTEXT.md` containing:
- **Project Info** — framework, language, runtime, build tool, package manager
- **Detected Tools** — 30+ auto-detected technologies
- **Configuration Files** — all config files found
- **Scripts** — available npm scripts
- **Dependencies** — full dependency list
- **Language Breakdown** — file distribution by language
- **Folder Structure** — complete tree with optional inline summaries

---

## 📦 Programmatic API

```javascript
const {
  generateTree,
  scan,
  buildTreeText,
  computeStats,
  estimateTokens,
  formatTokenSummary,
  extractFileSummary,
  toHtml,
} = require('project-tree-md');

// Generate complete tree with token estimation & file summaries
const result = generateTree({
  rootDir: process.cwd(),
  outputFile: 'MY_STRUCTURE.md',
  summarize: true,
  theme: 'unicode',
});

console.log(result.coloredTreeText);
console.log(result.tokenSummary); // "Estimated Context Tokens: 1,447 tokens (~$0.0036 cost for GPT-4o input)."

// Estimate tokens directly
const tokens = estimateTokens('some context text');

// Extract file summary description
const summary = extractFileSummary('./src/core/scanner.js');
console.log(summary); // "Directory tree scanner module for building project hierarchy nodes."
```

---

## 🧪 Local Testing

```bash
# Run CLI directly
node bin/cli.js

# Run all test suites
npm run test:all

# Run individual test suites
npm run test:tokens
npm run test:summarize
npm run test:html
npm run test:scanner
```

---

## 📄 License

[MIT](LICENSE) © [SKThakor137](https://github.com/SKThakor137)
