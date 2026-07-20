# project-tree-md

[![npm version](https://img.shields.io/npm/v/project-tree-md.svg)](https://www.npmjs.com/package/project-tree-md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Generate a clean, Markdown-wrapped ASCII folder structure tree for your project. This is perfect for inserting into `README.md` files or pasting directly into AI prompts to provide context on your project's structure.

## Features

- **Zero configuration**: Run it instantly.
- **Smart defaults**: Automatically ignores common build, dependency, and configuration directories:
  - `node_modules/`
  - `.git/`
  - `dist/` and `build/`
  - `.next/` and `.turbo/`
  - `.env*` files
  - `coverage/`
- **Highly customizable**: Override exclusions, limit recursion depth, and specify output paths.

---

## Quick Start

You can run it directly without installing it:

```bash
npx project-tree-md
```

Or install it as a dev dependency in your project:

```bash
npm install --save-dev project-tree-md
```

And run it using:

```bash
npx project-tree-md
```

---

## CLI Usage

By default, running `npx project-tree-md` will generate a file named `PROJECT_STRUCTURE.md` in your current working directory.

```bash
npx project-tree-md [options]
```

### Options

| Flag | Alias | Description | Default |
| :--- | :--- | :--- | :--- |
| `--out` | `-o` | Output file path | `PROJECT_STRUCTURE.md` |
| `--depth` | `-L` | Maximum recursion depth | Unlimited |
| `--exclude` | `-I` | Custom regex exclusion pattern | (Standard ignore list) |
| `--help` | `-h` | Show help command | — |

#### Examples

1. **Custom Output File Name:**
   ```bash
   npx project-tree-md --out docs/STRUCTURE.md
   ```

2. **Limit Traversal Depth:**
   ```bash
   npx project-tree-md --depth 3
   ```

3. **Custom Exclusion Regex:**
   ```bash
   npx project-tree-md --exclude "temp\|test"
   ```

---

## Programmatic Usage

You can also import and use it directly in your Node.js scripts:

```javascript
const { generateTree } = require("project-tree-md");

const { markdown, outputPath } = generateTree({
  rootDir: process.cwd(),
  outputFile: "PROJECT_STRUCTURE.md",
  maxDepth: 4,
});

console.log(`Markdown tree generated successfully at: ${outputPath}`);
```

---

## Example Output

Here is what the generated `PROJECT_STRUCTURE.md` file looks like:

# Project Structure

_Auto-generated on 2026-07-20T10:15:00.000Z_

```text
my-project/
├── bin/
│   └── cli.js
├── src/
│   └── index.js
├── package.json
└── README.md
```

---

## License

[MIT](LICENSE)

