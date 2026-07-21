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

Generate beautiful project structure docs in **Markdown**, **JSON**, **HTML**, **SVG**, and **Mermaid** — with colorized terminal preview, AI-ready context generation, project auto-detection (30+ tools), and rich stats dashboard. **Zero runtime dependencies.**

---

## ✨ Features

| Feature | Description |
| :--- | :--- |
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

# With emoji theme, file details, and stats dashboard
npx project-tree-md --theme emoji --details --dashboard

# Generate AI context document
npx project-tree-md --ai

# Export to all formats
npx project-tree-md --json --html --svg --mermaid
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
  --compress              Compress single-child dirs
  --collapse <n>          Collapse dirs with >n files
  --dashboard             Show rich stats dashboard

Export Formats:
  --json                  Export as JSON
  --html                  Export as collapsible HTML
  --svg                   Export as SVG diagram
  --mermaid               Export as Mermaid graph

AI Features:
  --ai                    Generate AI context document
  --prompt                Generate AI-ready prompt

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

### ASCII (`--theme ascii`)
```
project-tree-md
+-- bin
|   \-- cli.js
+-- src
|   +-- core
|   |   +-- scanner.js
|   |   \-- formatter.js
|   \-- index.js
\-- package.json
```

---

## 🤖 AI Context Generation

Generate a comprehensive project context document for AI assistants:

```bash
npx project-tree-md --ai
```

Creates `AI_CONTEXT.md` containing:
- **Project Info** — framework, language, runtime, build tool, package manager
- **Detected Tools** — 30+ auto-detected technologies
- **Configuration Files** — all config files found
- **Scripts** — available npm scripts
- **Dependencies** — full dependency list
- **Language Breakdown** — file distribution by language
- **Folder Structure** — complete tree

### AI-Ready Prompt

```bash
npx project-tree-md --prompt
```

Creates `AI_PROMPT.md` — a ready-to-paste prompt for ChatGPT/Claude/Gemini.

---

## 📊 Stats Dashboard

```bash
npx project-tree-md --dashboard
```

```
📊 Project Statistics
──────────────────────────────────────────────────────
  📁 Directories     8
  📄 Files           34
  💾 Total Size      106.9 KB
  🏆 Largest File    cli.js (13.6 KB)
  🌊 Max Depth       3
  📐 Avg Depth       2.4

  Language Breakdown
  JavaScript       #####################     85% (29)
  JSON             ##                        6% (2)
  Markdown         #                         3% (1)

  Largest Folders
  src                    66.2 KB
  core                   21.5 KB
  features               15.3 KB

  Top Extensions  .js(29)  .json(2)  .md(1)
──────────────────────────────────────────────────────
```

---

## 📤 Export Formats

### JSON (`--json`)
```json
{
  "tree": {
    "name": "my-project",
    "type": "directory",
    "children": [...]
  },
  "stats": { "dirs": 8, "files": 34, ... },
  "generatedAt": "2025-01-01T00:00:00Z"
}
```

### HTML (`--html`)
Generates a self-contained, collapsible HTML page with GitHub dark theme styling.

### SVG (`--svg`)
Generates an SVG tree diagram — perfect for embedding in docs or READMEs.

### Mermaid (`--mermaid`)
Generates a Mermaid graph definition for use in GitHub, GitLab, or any Mermaid-compatible renderer.

---

## 💉 README Auto-Inject

Add these markers to your README.md:

```markdown
<!-- PROJECT_TREE_START -->
<!-- PROJECT_TREE_END -->
```

Then run:

```bash
npx project-tree-md --inject README.md
```

The tree will be automatically inserted between the markers on every run.

---

## 👀 Watch Mode

Auto-regenerate on file changes:

```bash
npx project-tree-md --watch
```

Combine with other flags:

```bash
npx project-tree-md --watch --inject README.md --ai
```

---

## 🔄 Compare Mode

Diff two directories or JSON snapshots:

```bash
npx project-tree-md compare ./v1 ./v2
npx project-tree-md compare snapshot-old.json snapshot-new.json
```

Output:
```
✅ Added (3):
  + v2/src/new-feature.js
  + v2/tests/new-feature.test.js
  + v2/docs/guide.md

❌ Removed (1):
  - v1/src/deprecated.js

Summary: 3 added, 1 removed
```

---

## 🔐 Sensitive File Masking

By default, sensitive files (`.env`, `credentials.json`, private keys, etc.) are masked:

```
├── .env (hidden)
├── .env.production (hidden)
└── service-account.json (hidden)
```

Use `--show-sensitive` to reveal them.

---

## ⚙️ GitHub Action

Auto-update your project structure on every push:

```yaml
# .github/workflows/project-tree.yml
name: Update Project Tree
on:
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  update-tree:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npx project-tree-md --no-copy
      - run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add PROJECT_STRUCTURE.md
          git diff --cached --quiet || git commit -m "docs: update project structure [skip ci]"
          git push
```

---

## 📦 Programmatic API

```javascript
const {
  generateTree,
  scan,
  buildTreeText,
  computeStats,
  detectProject,
  toJson,
  toHtml,
  toSvg,
  toMermaid,
  generateAiContext,
  compare,
} = require('project-tree-md');

// Generate everything
const result = generateTree({
  rootDir: process.cwd(),
  outputFile: 'MY_STRUCTURE.md',
  theme: 'emoji',
  details: true,
});

console.log(result.treeText);
console.log(result.stats);
console.log(result.projectInfo);

// Individual modules
const tree = scan('./my-project', { maxDepth: 3 });
const json = toJson(tree);
const html = toHtml(tree);
const svg = toSvg(tree);
```

---

## 🧪 Local Testing

```bash
# Run CLI directly
node bin/cli.js

# Run all tests
npm run test:all

# Run individual test suites
npm run test:scanner
npm run test:formatter
npm run test:json
npm run test:html
npm run test:svg
npm run test:mermaid
npm run test:compare
npm run test:ignore
```

---

## 📁 Architecture

```
project-tree-md/
├── bin/
│   └── cli.js              # CLI entry point (all flags)
├── src/
│   ├── core/
│   │   ├── scanner.js       # Iterative directory scanner
│   │   ├── formatter.js     # Multi-theme tree formatter
│   │   ├── stats.js         # Statistics engine + dashboard
│   │   └── generator.js     # Main orchestrator
│   ├── detectors/
│   │   └── project.js       # 30+ framework/tool detector
│   ├── exporters/
│   │   ├── markdown.js      # Markdown export
│   │   ├── json.js          # JSON export
│   │   ├── html.js          # Collapsible HTML export
│   │   ├── svg.js           # SVG diagram export
│   │   └── mermaid.js       # Mermaid graph export
│   ├── features/
│   │   ├── ai.js            # AI context + prompt generator
│   │   ├── inject.js        # README auto-inject
│   │   ├── watcher.js       # Watch mode
│   │   ├── compare.js       # Tree diff/compare
│   │   └── monorepo.js      # Workspace detection
│   ├── utils/
│   │   ├── colors.js        # ANSI colors + spinner
│   │   ├── clipboard.js     # System clipboard
│   │   ├── ignore.js        # .gitignore parser
│   │   └── sensitive.js     # Sensitive file detection
│   └── index.js             # Public API re-exports
└── tests/                   # Unit test suites
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a PR.

## 📄 License

[MIT](LICENSE) © [SKThakor137](https://github.com/SKThakor137)
