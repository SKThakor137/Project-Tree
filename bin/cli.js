#!/usr/bin/env node

const path = require("path");
const { spawnSync } = require("child_process");
const { generateTree, DEFAULT_EXCLUDE } = require("../src/index.js");

function parseArgs(argv) {
  const args = { rootDir: process.cwd(), outputFile: "PROJECT_STRUCTURE.md", copy: true };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--out" || arg === "-o") {
      args.outputFile = argv[++i];
    } else if (arg === "--depth" || arg === "-L") {
      args.maxDepth = parseInt(argv[++i], 10);
    } else if (arg === "--exclude" || arg === "-I") {
      args.exclude = new RegExp(argv[++i]);
    } else if (arg === "--no-copy") {
      args.copy = false;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    }
  }

  return args;
}

function copyToClipboard(text) {
  try {
    if (process.platform === "win32") {
      spawnSync("clip", { input: text });
      return true;
    } else if (process.platform === "darwin") {
      spawnSync("pbcopy", { input: text });
      return true;
    } else {
      const xclip = spawnSync("xclip", ["-selection", "clipboard"], { input: text });
      if (xclip.status === 0) return true;
      const xsel = spawnSync("xsel", ["--clipboard", "--input"], { input: text });
      if (xsel.status === 0) return true;
    }
  } catch (e) {
    // Fail silently if clipboard commands are not available
  }
  return false;
}

function printHelp() {
  console.log(`
project-tree-md - Generate a Markdown project structure file

Usage:
  npx project-tree-md [options]

Options:
  -o, --out <file>      Output filename (default: PROJECT_STRUCTURE.md)
  -L, --depth <number>  Max depth to traverse (default: unlimited)
  -I, --exclude <regex> Custom exclude pattern (default excludes node_modules, .git, dist, build, .next, .env*)
  --no-copy             Do not copy the output to the clipboard
  -h, --help            Show this help message
`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  try {
    const { outputPath, coloredTreeText, statsText, markdown } = generateTree({
      rootDir: args.rootDir,
      outputFile: args.outputFile,
      exclude: args.exclude || DEFAULT_EXCLUDE,
      maxDepth: args.maxDepth,
    });

    console.log("\n" + coloredTreeText + "\n");
    console.log(`📊 \x1b[1mStats:\x1b[0m ${statsText}`);
    console.log(`✅ Project structure written to \x1b[32m${path.relative(process.cwd(), outputPath)}\x1b[0m`);

    if (args.copy && process.stdout.isTTY) {
      const copied = copyToClipboard(markdown);
      if (copied) {
        console.log("📋 \x1b[32mProject structure copied to clipboard!\x1b[0m");
      }
    }
  } catch (err) {
    console.error(`❌ Failed to generate project structure: ${err.message}`);
    process.exit(1);
  }
}

main();

