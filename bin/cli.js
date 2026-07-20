#!/usr/bin/env node

const path = require("path");
const { generateTree, DEFAULT_EXCLUDE } = require("../src/index.js");

function parseArgs(argv) {
  const args = { rootDir: process.cwd(), outputFile: "PROJECT_STRUCTURE.md" };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--out" || arg === "-o") {
      args.outputFile = argv[++i];
    } else if (arg === "--depth" || arg === "-L") {
      args.maxDepth = parseInt(argv[++i], 10);
    } else if (arg === "--exclude" || arg === "-I") {
      args.exclude = new RegExp(argv[++i]);
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    }
  }

  return args;
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
    const { outputPath } = generateTree({
      rootDir: args.rootDir,
      outputFile: args.outputFile,
      exclude: args.exclude || DEFAULT_EXCLUDE,
      maxDepth: args.maxDepth,
    });
    console.log(`✅ Project structure written to ${path.relative(process.cwd(), outputPath)}`);
  } catch (err) {
    console.error(`❌ Failed to generate project structure: ${err.message}`);
    process.exit(1);
  }
}

main();
