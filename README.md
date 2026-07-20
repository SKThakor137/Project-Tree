# project-tree-md

Generate a clean, Markdown-wrapped ASCII folder structure for your project — perfect for `README.md` files or pasting into AI prompts.

Automatically excludes `node_modules`, `.git`, `dist`, `build`, `.next`, `.env*`, `coverage`, and `.turbo`.

## Install

```bash
npm install --save-dev project-tree-md
```

Or run directly without installing:

```bash
npx project-tree-md
```

## CLI Usage

```bash
npx project-tree-md --out PROJECT_STRUCTURE.md
```

### Options

| Flag | Alias | Description | Default |
|---|---|---|---|
| `--out` | `-o` | Output filename | `PROJECT_STRUCTURE.md` |
| `--depth` | `-L` | Max recursion depth | unlimited |
| `--exclude` | `-I` | Custom regex exclude pattern | node_modules/.git/dist/build/.next/.env* |
| `--help` | `-h` | Show help | — |

## Programmatic Usage

```js
const { generateTree } = require("project-tree-md");

const { markdown, outputPath } = generateTree({
  rootDir: process.cwd(),
  outputFile: "PROJECT_STRUCTURE.md",
  maxDepth: 4,
});

console.log(`Written to ${outputPath}`);
```

## Example Output

```markdown
# Project Structure

_Auto-generated on 2026-07-20T10:15:00.000Z_

​```
my-project
├── src
│   ├── components
│   └── utils
├── package.json
└── README.md
​```
```

## License

MIT
