# project-tree-md

[![npm version](https://img.shields.io/npm/v/project-tree-md.svg)](https://www.npmjs.com/package/project-tree-md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](https://www.npmjs.com/package/project-tree-md)

Generate a clean, Markdown-wrapped ASCII folder structure tree for your project — perfect for `README.md` files, documentation, or pasting into AI prompts for project context.

> **v1.1.0** — Now with **zero dependencies**, colorized terminal preview, project statistics, and auto clipboard copy!

## ✨ Features

- **Zero dependencies** — uses only built-in Node.js `fs` and `path` modules
- **Colorized terminal preview** — see your project tree directly in the console with color-coded folders and files
- **Project statistics** — shows total directory and file counts at a glance
- **Auto clipboard copy** — the generated Markdown is automatically copied to your clipboard (disable with `--no-copy`)
- **Smart defaults** — automatically ignores common build, dependency, and config directories:
  - `node_modules/`, `.git/`, `dist/`, `build/`, `.next/`, `.turbo/`, `coverage/`, `.env*`
- **Highly customizable** — override exclusions, limit recursion depth, and specify output paths

---

## 🚀 Quick Start

Run it instantly without installing:

```bash
npx project-tree-md
```

Or install it as a dev dependency:

```bash
npm install --save-dev project-tree-md
```

---

## 🖥️ CLI Usage

```bash
npx project-tree-md [options]
```

### Options

| Flag | Alias | Description | Default |
| :--- | :--- | :--- | :--- |
| `--out` | `-o` | Output file path | `PROJECT_STRUCTURE.md` |
| `--depth` | `-L` | Maximum recursion depth | Unlimited |
| `--exclude` | `-I` | Custom regex exclusion pattern | (Standard ignore list) |
| `--no-copy` | — | Disable clipboard copy | (Auto-copy enabled) |
| `--help` | `-h` | Show help message | — |

### Examples

**1. Default — generate `PROJECT_STRUCTURE.md` with a colorized preview:**
```bash
npx project-tree-md
```

**2. Custom output file:**
```bash
npx project-tree-md --out docs/STRUCTURE.md
```

**3. Limit traversal depth:**
```bash
npx project-tree-md --depth 3
```

**4. Custom exclusion regex:**
```bash
npx project-tree-md --exclude "temp|test"
```

**5. Generate without clipboard copy:**
```bash
npx project-tree-md --no-copy
```

---

## 🧪 Testing the Package Locally on Another Project

You can test this tool on **any project folder** on your machine without publishing to npm.

### Method 1: Direct node call

Navigate to the project you want to scan, then run the CLI directly:

```bash
cd "C:\Users\you\your-other-project"
node "C:\path\to\project-tree-md\bin\cli.js"
```

### Method 2: npm link (Recommended)

Link the package globally so you can use `npx project-tree-md` anywhere:

```bash
# Inside the project-tree-md folder:
npm link

# Then navigate to any other project and run:
cd "C:\Users\you\your-other-project"
npx project-tree-md
```

To unlink when done:

```bash
npm unlink -g project-tree-md
```

---

## 📦 Programmatic Usage

```javascript
const { generateTree } = require("project-tree-md");

const { markdown, outputPath, statsText } = generateTree({
  rootDir: process.cwd(),
  outputFile: "PROJECT_STRUCTURE.md",
  maxDepth: 4,
});

console.log(`Tree generated at: ${outputPath}`);
console.log(`Stats: ${statsText}`);
```

---

## 📄 Example Output

Running `npx project-tree-md` shows a **colorized tree preview** in your terminal and saves `PROJECT_STRUCTURE.md`:

**Terminal output:**
```
my-project
├── bin
│   └── cli.js
├── src
│   └── index.js
├── package.json
├── README.md
└── LICENSE

📊 Stats: 2 directories, 5 files
✅ Project structure written to PROJECT_STRUCTURE.md
📋 Project structure copied to clipboard!
```

**Generated `PROJECT_STRUCTURE.md`:**
````markdown
# Project Structure

_Auto-generated on 2026-07-21T17:22:03.055Z_
_Total: 2 directories, 5 files_

```
my-project
├── bin
│   └── cli.js
├── src
│   └── index.js
├── package.json
├── README.md
└── LICENSE
```
````

---

## License

[MIT](LICENSE)
