# 🧪 project-tree-md — Complete Feature Testing Guide

Is document me **project-tree-md v2.3.0** ki har ek functionality ko step-by-step test karne ke liye exact commands aur expected outputs diye gaye hain.

---

## 🛠️ Setup Local Testing (Once)

Apne PC par global testing ke liye `project-tree-md` directory me terminal open karke run karein:

```bash
npm link
```

*Ab aap apne PC ke kisi bhi project folder me jaakar niche di gayi koi bhi command run kar sakte hain!*

---

## 📋 Table of Testing Scenarios

1. [Standard Tree & Markdown Generation](#1-standard-tree--markdown-generation)
2. [Download & Export ZIP Bundle System](#2-download--export-zip-bundle-system)
3. [Interactive HTML Dashboard & Browser Download Center](#3-interactive-html-dashboard--browser-download-center)
4. [Architecture Flow Engine & Code Health](#4-architecture-flow-engine--code-health)
5. [AI Features & Token Estimator](#5-ai-features--token-estimator)
6. [Header Comment Summarizer](#6-header-comment-summarizer)
7. [Export Formats (JSON, SVG, Mermaid)](#7-export-formats-json-svg-mermaid)
8. [Advanced Utilities (Dashboard, Compare, Inject, Watch)](#8-advanced-utilities-dashboard-compare-inject-watch)
9. [Programmatic Node.js API Testing](#9-programmatic-nodejs-api-testing)

---

## 1. Standard Tree & Markdown Generation

### Test 1.1: Default Command Run
```bash
project-tree-md
```
- **Expected Output:** Terminal me colored tree dikhega aur directory me `PROJECT_STRUCTURE.md` create hogi.

### Test 1.2: Custom Output File Name (`--out`)
```bash
project-tree-md --out MY_CUSTOM_TREE.md
```
- **Expected Output:** `MY_CUSTOM_TREE.md` file generate hogi.

### Test 1.3: Max Depth Limit (`--depth` / `-L`)
```bash
project-tree-md -L 2
```
- **Expected Output:** Tree traverse depth sirf 2 levels tak limit hogi.

### Test 1.4: Tree Themes (`--theme`)
Test all 4 visual themes:
```bash
project-tree-md --theme unicode
project-tree-md --theme ascii
project-tree-md --theme emoji
project-tree-md --theme box
```
- **Expected Output:** Terminal me tree alag-alag icons/styles (Unicode, ASCII +, Emoji 📁/📄, Box └─) me render hoga.

### Test 1.5: Show File Sizes & Details (`--details`)
```bash
project-tree-md --details
```
- **Expected Output:** File names ke aage file size (e.g. `[2.4 KB]`) dikhega.

### Test 1.6: Tree Compression & Folder Collapse (`--compress`, `--collapse`)
```bash
project-tree-md --compress --collapse 5
```
- **Expected Output:** Single-child folders `src/core/utils` ek line me compress ho jayenge aur 5 se zyada files wale folders collapse ho jayenge.

---

## 2. Download & Export ZIP Bundle System

### Test 2.1: Full ZIP Bundle Export (`--bundle`)
```bash
project-tree-md --bundle
```
- **Expected Output:** `PROJECT_STRUCTURE.md` create hoga + complete `project-analysis.zip` archive generate hogi (containing 19 reports and manifest.json).

### Test 2.2: Selective ZIP Bundle Export (`--bundle <list>`)
```bash
project-tree-md --bundle html,json,svg
```
- **Expected Output:** `project-analysis.zip` create hogi jisme **sirf** HTML, JSON, SVG aur `manifest.json` package hone.

### Test 2.3: Custom Output Directory (`--output-dir`)
```bash
project-tree-md --bundle --output-dir reports/
```
- **Expected Output:** `reports/project-analysis.zip` create hogi.

### Test 2.4: Selective File Exports (`--export` / `--export-all`)
```bash
# Export only HTML, JSON, and SVG files directly to folder
project-tree-md --export html,json,svg --output-dir dist_exports/

# Export all individual reports
project-tree-md --export-all --output-dir dist_all/
```
- **Expected Output:** `dist_exports/` me target files unpack hoke save ho jayenge.

---

## 3. Interactive HTML Dashboard & Browser Download Center

### Test 3.1: Export Interactive HTML Report
```bash
project-tree-md --html
```
- **Expected Output:** `PROJECT_STRUCTURE.html` generate hogi.

### Test 3.2: Browser Testing
Open `PROJECT_STRUCTURE.html` in your web browser:
1. **Export Center Tab Click Karein:** Checkboxes dikhenge report select karne ke liye.
2. **"Download Selected ZIP" Button:** Click karke verify karein ki checked files ki ZIP instantly download hoti hai.
3. **Single File Download Buttons:** "Download Single MD", "Download Single JSON", etc. try karein.
4. **Search Bar (`/` key):** Filter karke search karein.
5. **Theme Toggle (`D` key):** Dark Mode / Light Mode switch karein.
6. **Print (`P` key):** Print preview check karein.
7. **File Inspector:** Explorer tab me kisi bhi file par click karke Usages, Imports, Exports details dekhein.

---

## 4. Architecture Flow Engine & Code Health

### Test 4.1: Architecture Execution Flow (`--flow`)
```bash
project-tree-md --flow
```
- **Expected Output:** Multi-language route → controller → service flow tree with role badges (🌐 ROUTE, ⚙️ CONTROLLER, 💼 SERVICE, etc.) terminal me render hoga.

### Test 4.2: Dead Code & Circular Dependency Metrics (`--architecture`)
```bash
project-tree-md --architecture --dashboard
```
- **Expected Output:** Code cyclomatic complexity, dead code count, and health grade dikhega.

---

## 5. AI Features & Token Estimator
*(Note: `--ai` and `--prompt` commands are commented out / disabled)*

### Test 5.1: ~AI LLM Context Document (`--ai`)~ *(Disabled / Commented Out)*

### Test 5.2: ~AI Prompt File (`--prompt`)~ *(Disabled / Commented Out)*

### Test 5.3: Token Count & Input Cost Estimation (`--tokens`)
```bash
project-tree-md --tokens
```
- **Expected Output:** Terminal me estimated token count (e.g. `1,250 tokens (~$0.0031 cost for GPT-4o)`) dikhega.

---

## 6. Header Comment Summarizer

### Test 6.1: Inline Comment Extraction (`--summarize`)
```bash
project-tree-md --summarize
```
- **Expected Output:** Terminal tree me file names ke aage top file comment summaries (e.g. `# Main entrypoint`) dikhenge.

---

## 7. Export Formats (JSON, SVG, Mermaid)

### Test 7.1: Export JSON
```bash
project-tree-md --json
```
- **Expected Output:** `PROJECT_STRUCTURE.json` generate hoga.

### Test 7.2: Export SVG Diagram
```bash
project-tree-md --svg
```
- **Expected Output:** `PROJECT_STRUCTURE.svg` vector graphic diagram file generate hogi.

### Test 7.3: Export Mermaid Diagram
```bash
project-tree-md --mermaid
```
- **Expected Output:** `PROJECT_STRUCTURE_mermaid.md` file generate hogi.

---

## 8. Advanced Utilities (Dashboard, Compare, Inject, Watch)

### Test 8.1: Terminal Only / Suppress Disk File Writing (`--no-write`)
```bash
project-tree-md --no-write
```
- **Expected Output:** Tree terminal me print hoga lekin koi disk file write nahi hogi.

### Test 8.2: Rich Stats Dashboard (`--dashboard`)
```bash
project-tree-md --dashboard
```
- **Expected Output:** Rich terminal dashboard (file extensions breakdown, largest files, depth stats) print hoga.

### Test 8.3: Compare Two Directories (`compare`)
```bash
project-tree-md compare ./src ./tests
```
- **Expected Output:** Both directories ka structural diff summary terminal me dikhega.

### Test 8.4: Interactive Setup Wizard (`-i`)
```bash
project-tree-md -i
```
- **Expected Output:** Terminal wizard chalega jo aapse choices (bundle/export/default, theme, options) puch kar execute karega.

### Test 8.5: Inject Tree into README (`--inject`)
Create markers in a test file `README.md`:
```markdown
<!-- START_PROJECT_TREE -->
<!-- END_PROJECT_TREE -->
```
Then run:
```bash
project-tree-md --inject README.md
```
- **Expected Output:** Tree markers ke bich me auto-inject ho jayega.

---

## 9. Programmatic Node.js API Testing

Ek temporary test script `test-api.js` banayein:

```javascript
const {
  generateTree,
  generateBundle,
  exportReports,
  createZip,
} = require('project-tree-md');

console.log('Testing project-tree-md API...');

// 1. Generate Tree
const res = generateTree({ rootDir: process.cwd(), flow: true });
console.log('Stats:', res.statsText);

// 2. Generate ZIP Bundle Programmatically
const bundle = generateBundle({
  rootDir: process.cwd(),
  exportList: ['html', 'json', 'svg'],
});
console.log('ZIP Generated at:', bundle.zipPath);
```

Run test script:
```bash
node test-api.js
```
- **Expected Output:** API bina kisi error ke successfully execute hogi aur ZIP bundle generate kar degi.

---

## ✅ Testing Checklist Summary

| Feature | Command | Status |
| :--- | :--- | :---: |
| Default Markdown Tree | `project-tree-md` | 🟩 Ready |
| Full ZIP Bundle Export | `project-tree-md --bundle` | 🟩 Ready |
| Selective ZIP Export | `project-tree-md --bundle html,json` | 🟩 Ready |
| Browser HTML Export Center | `project-tree-md --html` | 🟩 Ready |
| Selective File Exporter | `project-tree-md --export html,json` | 🟩 Ready |
| Architecture Execution Flow | `project-tree-md --flow` | 🟩 Ready |
| AI LLM Context & Tokens | `project-tree-md --ai --tokens` | 🟩 Ready |
| Comment Summarizer | `project-tree-md --summarize` | 🟩 Ready |
| JSON / SVG / Mermaid | `project-tree-md --json --svg` | 🟩 Ready |
| Interactive Setup Wizard | `project-tree-md -i` | 🟩 Ready |
