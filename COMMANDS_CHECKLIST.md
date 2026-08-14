# 📋 Project Tree MD - Command Testing & Update Checklist

Is list mein `project-tree-md` ke saare commands, subcommands, flags aur exporters shamil hain. Hum ek-ek karke testing, bug fixing aur updates karenge. **Jab aap bologe "done", tabhi status `[x] Completed` mark kiya jayega.**

---

## 1. 📄 Core Exporters & Output Formats
- [x] **1.1 Default Markdown Tree Export** (`npx project-tree-md` / `-o, --out`)
- [x] **1.2 JSON Exporter** (`--json` / `json`)
- [x] **1.3 Web Dashboard HTML Exporter** (`--html` / `html` / `--report` / `--explorer`)
- [x] **1.4 Mind Map / Roadmap HTML Exporter** (`--mindmap` / `mindmap` / `--roadmap`)
- [x] **1.5 SVG Exporter** (`--svg` / `svg`)
- [x] **1.6 Mermaid Exporter** (`--mermaid` / `mermaid`)
- [x] ~**1.7 Flat Data Table Exporters** (`--csv`, `--tsv`)~ *(Disabled / Commented Out)*
- [x] ~**1.8 Structured Markup Exporters** (`--xml`, `--yaml`)~ *(Disabled / Commented Out)*
- [x] ~**1.9 PlantUML Exporter** (`--plantuml` / `plantuml`)~ *(Disabled / Commented Out)*

---

## 2. 🕸️ Graph Visualization & Architecture Engines
- [x] **2.1 2D & 3D Unified Code Relationship Graph** (`--visualize` / `graph` / `code-graph` / `3d-graph`)
- [x] ~**2.2 3D WebGL Code Graph**~ *(Merged into 2.1 Unified Graph Engine)*
- [x] **2.3 Universal Graph Model JSON Export** (`--graph-json` / `graph-json`)
- [x] **2.4 Execution & Architecture Flow Engine** (`--flow` / `flow` / `--architecture`)

---

## 3. 🤖 AI Integration & Rule Generators
- [x] **3.1 AI Context Generator** (`--ai` / `ai`)
- [x] **3.2 AI Prompt Generator** (`--prompt` / `prompt`)
- [x] **3.3 AI Token & Cost Estimator** (`--tokens` / `tokens`)
- [x] **3.4 AI Rules / Agent Guidelines Generator** (`--ai-rules` / `ai-rules`)

---

## 4. 📦 Bundling & Multi-Export System
- [x] **4.1 Report ZIP Bundle Generator** (`--bundle` / `bundle` / `--zip`)
- [x] **4.2 Selective & Full Report Exporter** (`--export`, `--export-all`, `export`)
- [x] ~**4.3 Custom Output Directory & Stdout Modes** (`--output-dir`, `--no-write` / `--stdout`)~ *(Disabled / Commented Out)*

---

## 5. 🔍 File Metadata, Hashing & Duplicate Analyzer
- [x] **5.1 Content Hashing** (`--hash [md5|sha1|sha256]`)
- [x] **5.2 Duplicate File Finder & Report** (`--duplicates`)
- [x] **5.3 File System Attributes** (`--permissions`, `--owner`, `--modified`, `--created`)

---

## 6. ⚙️ Traversal, Sorting & Customization Options
- [x] **6.1 Depth & Exclude Patterns** (`--depth / -L`, `--exclude / -I`)
- [x] **6.2 Sorting Engines** (`--sort [alpha|folders-first|files-first|extension|size|modified|created]`, `--sort-order [asc|desc]`)
- [x] **6.3 Scan Limits & Traversal Modes** (`--max-files`, `--max-folders`, `--bfs`)
- [x] **6.4 Themes & Icon System** (`--theme`, `--icons`)
- [x] **6.5 Tree Formatting Controls** (`--details`, `--compress`, `--collapse <n>`, `--summarize`)
- [x] **6.6 Rich Stats Dashboard** (`--dashboard`)
- [x] **6.7 Git Integration & Changed Files Filter** (`--git-status`, `--changed-only`)

---

## 7. 🛠️ Utilities & Server Features
- [x] **7.1 Directory Comparison Engine** (`npx project-tree-md compare <pathA> <pathB>`)
- [x] **7.2 Zero-Dependency Live HTTP Server & Live Reload** (`--serve` / `serve`)
- [x] ~**7.3 Directory Watcher Mode** (`--watch`)~ *(Disabled / Commented Out per User Request)*
- [x] ~**7.4 README / Document Inserter** (`--inject <file>`)~ *(Disabled / Commented Out per User Request)*
- [x] ~**7.5 Shell Hook Integration** (`init-shell`, `install-hook`)~ *(Disabled / Commented Out per User Request)*

---


