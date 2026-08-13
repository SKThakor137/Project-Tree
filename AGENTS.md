# AI Agent Coding Guidelines & Context for project-tree-md

## 📌 Project Overview
- **Project Name**: `project-tree-md`
- **Primary Language**: JavaScript (Node.js CommonJS)
- **Zero External Dependencies**: Core package must use Node.js standard library (`fs`, `path`, `os`, `crypto`, `child_process`, `http`) with ZERO third-party npm dependencies.

---

## 🚨 MANDATORY USER PREFERENCES & RULES (DO NOT VIOLATE)

### 1. 🚫 NO HARDCODED VERSION NUMBERS IN DOCS OR IMAGES
- **NEVER** write hardcoded version numbers (e.g. `v3.5`, `v3.2.0`) inside `README.md`, exported Markdown headers, diagrams, or generated hero images.
- Version numbers belong **strictly in `package.json`**. Keep documentation and visuals version-agnostic for seamless maintenance.

### 2. 📁 DEDICATED UNIQUE OUTPUT FILE NAMES (PREVENT OVERWRITING)
- Every CLI flag or analysis mode **MUST** output to its own dedicated, task-specific file name so files **NEVER** replace or overwrite each other:
  - Default tree ➔ `PROJECT_STRUCTURE.md`
  - `--git-status` ➔ `GIT_STATUS_TREE.md`
  - `--changed-only` ➔ `CHANGED_FILES_TREE.md`
  - `--sort` ➔ `SORTED_TREE.md`
  - `--hash` ➔ `FILE_HASHES.md`
  - `--modified` / `--created` / `--permissions` / `--owner` ➔ `FILE_ATTRIBUTES.md`
  - `--exclude` / `-I` ➔ `FILTERED_TREE.md`
  - `--depth` / `-L` ➔ `DEPTH_TREE.md`
  - `--max-files` / `--max-folders` / `--bfs` ➔ `LIMITED_TREE.md`
  - `--theme` / `--icons` ➔ `THEMED_TREE.md`
  - `--details` / `--compress` / `--collapse` / `--summarize` ➔ `FORMATTED_TREE.md`
  - `--dashboard` ➔ Terminal stdout report ONLY (do NOT write default files)
  - `ai` ➔ `AI_CONTEXT.md`
  - `prompt` ➔ `AI_PROMPT.md`
  - `ai-rules` ➔ `AGENTS.md`

### 3. 📋 CHECKLIST STATUS CONTROL
- Update `COMMANDS_CHECKLIST.md` step-by-step.
- Mark an item as `[x] Completed` **ONLY AFTER** the user explicitly says "done" or "next".

### 4. 🎨 HUMAN-READABLE UI & CLEAN METADATA
- Format inline tree node metadata with bullet separators ` • ` (e.g. `rw-rw-rw- • owner: shail • mod: 2026-08-12`).
- Format Git status badges with clear readable labels `[Modified]`, `[Added]`, `[Untracked]`, `[Deleted]` instead of cryptic raw characters.
- Ensure generated Markdown headers feature clean metadata cards and quick summary tables.

---

## ⚙️ Architecture & Testing Standards
- **Zero-Unused-Imports**: Keep imports clean and remove unused modules.
- **Error Handling**: Always handle async promises and stream errors safely without swallowing exceptions.
- **Testing**: Ensure all new features or bug fixes have corresponding unit tests before committing. Run `npm test` after edits.