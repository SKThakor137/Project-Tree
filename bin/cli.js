#!/usr/bin/env node
/** CLI entrypoint and command parser for project-tree-md. */
'use strict';

const path = require('path');
const fs = require('fs');
const colors = require('../src/utils/colors.js');
const { copyToClipboard } = require('../src/utils/clipboard.js');
const { generateTree } = require('../src/core/generator.js');
const { computeStats, printDashboard } = require('../src/core/stats.js');
const { scan, DEFAULT_EXCLUDE, parseSize } = require('../src/core/scanner.js');
const { buildTreeText, buildColoredTreeText } = require('../src/core/formatter.js');
const { buildIgnoreMatcher } = require('../src/utils/ignore.js');
const { toJson } = require('../src/exporters/json.js');
const { toHtml } = require('../src/exporters/html.js');
const { toSvg } = require('../src/exporters/svg.js');
const { toMermaid } = require('../src/exporters/mermaid.js');
const { toMarkdown } = require('../src/exporters/markdown.js');
const { generateAiContext, generateAiPrompt } = require('../src/features/ai.js');
const { injectIntoFile } = require('../src/features/inject.js');
const { watchDirectory } = require('../src/features/watcher.js');
const { compare } = require('../src/features/compare.js');
const { detectProject } = require('../src/detectors/project.js');
const { estimateTokens, formatTokenSummary } = require('../src/features/tokens.js');
const { generateArchitectureFlow } = require('../src/core/architectureFlow.js');
const { generateBundle } = require('../src/features/bundle.js');
const { exportReports } = require('../src/features/exporter.js');

// ─── Arg Parser ───────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {
    interactive: false,
    dashboard: false,
    tokens: false,
    summarize: false,
    flow: false,
    architecture: false,
    bundle: false,
    bundleList: null,
    exportAll: false,
    exportList: null,
    outputDir: null,
    noWrite: false,
    // Modes
    ai: false,
    prompt: false,
    json: false,
    html: false,
    svg: false,
    mermaid: false,
    watch: false,
    inject: null,
    compare: null,
    help: false,
    version: false,
    copy: true,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      // Existing flags
      case '--out': case '-o':         args.outputFile = argv[++i]; break;
      case '--depth': case '-L':       args.maxDepth = parseInt(argv[++i], 10); break;
      case '--exclude': case '-I':     args.excludeStr = argv[++i]; break;
      case '--no-copy':                args.copy = false; break;
      case '--help': case '-h':        args.help = true; break;
      case '--version': case '-v':     args.version = true; break;

      // Bundle & Export System Flags
      case '--bundle': case '--zip': case '--download':
        args.bundle = true;
        if (argv[i + 1] && !argv[i + 1].startsWith('-')) {
          args.bundleList = argv[++i];
        }
        break;
      case '--export-all':
        args.exportAll = true; break;
      case '--export':
        if (argv[i + 1] && !argv[i + 1].startsWith('-')) {
          args.exportList = argv[++i];
        } else {
          args.exportAll = true;
        }
        break;
      case '--output-dir':
        args.outputDir = argv[++i]; break;
      case '--no-write': case '--stdout':
        args.noWrite = true; break;

      // Format & Analysis Flags
      case '--ai':                     args.ai = true; break;
      case '--prompt':                 args.prompt = true; break;
      case '--tokens':                 args.tokens = true; break;
      case '--summarize':              args.summarize = true; break;
      case '--flow':                   args.flow = true; break;
      case '--architecture':           args.architecture = true; break;
      case '--json':                   args.json = true; break;
      case '--html':                   args.html = true; break;
      case '--svg':                    args.svg = true; break;
      case '--mermaid':                args.mermaid = true; break;
      case '--watch':                  args.watch = true; break;
      case '--inject':                 args.inject = argv[++i]; break;
      case '--theme':                  args.theme = argv[++i]; break;
      case '--details':                args.details = true; break;
      case '--compress':               args.compress = true; break;
      case '--collapse':               args.collapseThreshold = parseInt(argv[++i], 10); break;
      case '--max-size':               args.maxSize = argv[++i]; break;
      case '--include-binary':         args.includeBinary = true; break;
      case '--show-sensitive':         args.showSensitive = true; break;
      case '--no-ignore':              args.noIgnore = true; break;
      case '--dashboard':              args.dashboard = true; break;
      case '-i': case '--interactive': args.interactive = true; break;

      // Subcommand
      case 'compare':
        args.compare = [argv[++i], argv[++i]];
        break;

      default: break;
    }
  }

  if (args.excludeStr) {
    args.exclude = new RegExp(args.excludeStr);
  }

  return args;
}

// ─── Help ─────────────────────────────────────────────────────────────────────

function printHelp() {
  console.log(`
${colors.boldCyan('project-tree-md')} — AI-Ready Project Analysis Suite

${colors.bold('Usage:')}
  npx project-tree-md [options]
  npx project-tree-md compare <pathA> <pathB>

${colors.bold('Bundle & Export System:')}
  --bundle [list]         Generate ZIP package with all or selected reports (${colors.cyan('e.g. --bundle html,json,svg')})
  --export [list]         Export selected reports to directory (${colors.cyan('e.g. --export html,json')})
  --export-all            Export all individual analysis reports
  --output-dir <dir>      Output directory for exports and ZIP bundles
  --no-write, --stdout    Print to console without writing default output files

${colors.bold('Output Options:')}
  -o, --out <file>        Output filename              ${colors.gray('(default: PROJECT_STRUCTURE.md)')}
  -L, --depth <n>         Max depth to traverse        ${colors.gray('(default: unlimited)')}
  -I, --exclude <regex>   Custom exclude pattern       ${colors.gray('(default: standard ignores)')}
  --no-copy               Do not copy to clipboard
  --theme <name>          Tree theme                   ${colors.gray('(unicode|ascii|emoji|box)')}
  --details               Show file size & extension
  --summarize             Extract & show inline file comment summaries
  --flow                  Generate architecture execution flow & role map
  --compress              Compress single-child dirs
  --collapse <n>          Collapse dirs with >n files
  --dashboard             Show rich stats dashboard
  --architecture          Enable advanced architecture parsing & metrics

${colors.bold('Export Formats:')}
  --json                  Export as JSON
  --html                  Export as collapsible HTML with Download Center
  --svg                   Export as SVG diagram
  --mermaid               Export as Mermaid graph

${colors.bold('AI Features:')}
  --ai                    Generate AI context document
  --prompt                Generate AI-ready prompt
  --tokens                Output AI context token count & cost estimation

${colors.bold('Other Options:')}
  -h, --help              Show this help
  -v, --version           Show version
`);
}

// ─── Interactive Mode ─────────────────────────────────────────────────────────

function runInteractive() {
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise(r => rl.question(q, r));

  (async () => {
    console.log(colors.boldCyan('\n🎯 project-tree-md — Interactive Setup\n'));

    const action = (await ask(`  Action [bundle/export/default] ${colors.gray('(default)')}: `)).toLowerCase();
    let reportChoice = 'all';
    if (action === 'bundle' || action === 'export') {
      reportChoice = (await ask(`  Reports to include [all / md,json,html,svg,ai,health] ${colors.gray('(all)')}: `)) || 'all';
    }
    const out = (await ask(`  Output file ${colors.gray('(PROJECT_STRUCTURE.md)')}: `)) || 'PROJECT_STRUCTURE.md';
    const theme = (await ask(`  Theme [unicode/ascii/emoji/box] ${colors.gray('(unicode)')}: `)) || 'unicode';

    rl.close();

    const opts = ['--theme', theme];
    if (action === 'bundle') {
      opts.push('--bundle');
      if (reportChoice !== 'all') opts.push(reportChoice);
    } else if (action === 'export') {
      opts.push('--export', reportChoice);
    } else if (out) {
      opts.push('--out', out);
    }

    const args = parseArgs(opts);
    runGenerate(args);
  })();
}

// ─── Core Generate ────────────────────────────────────────────────────────────

function runGenerate(args) {
  try {
    const rootDir = args.rootDir || process.cwd();

    // Preserve 100% existing functionality: PROJECT_STRUCTURE.md is always written by default unless --no-write is passed
    const shouldWriteMarkdown = !args.noWrite;

    // If architecture is required by bundle or export, enable architecture mode automatically
    const isArchNeeded = args.architecture || args.bundle || args.exportAll || args.exportList;

    const result = generateTree({
      rootDir,
      outputFile: args.outputFile || 'PROJECT_STRUCTURE.md',
      exclude: args.exclude || DEFAULT_EXCLUDE,
      maxDepth: args.maxDepth,
      noIgnore: args.noIgnore,
      includeBinary: args.includeBinary,
      showSensitive: args.showSensitive,
      maxSize: args.maxSize,
      compress: args.compress,
      collapseThreshold: args.collapseThreshold,
      theme: args.theme,
      details: args.details,
      summarize: args.summarize,
      flow: args.flow,
      architecture: isArchNeeded,
      writeFile: shouldWriteMarkdown,
    });

    // Print colorized tree
    console.log('\n' + result.coloredTreeText + '\n');

    // Architecture Flow Output
    if (args.flow) {
      const flowRes = result.flowResult || generateArchitectureFlow(rootDir, result.tree);
      console.log(flowRes.coloredFlowText + '\n');
    }

    console.log(`📊 ${colors.bold('Stats:')} ${result.statsText}`);

    // Dashboard
    if (args.dashboard) {
      printDashboard(result.stats);
    }

    // Token Estimation Summary
    if (args.tokens) {
      let targetText = result.markdown;
      if (args.ai) {
        targetText = generateAiContext(rootDir, result.treeText, result.stats);
      }
      const estimatedCount = estimateTokens(targetText);
      const summaryText = formatTokenSummary(estimatedCount);
      console.log(`🧮 ${colors.boldCyan(summaryText)}`);
    }

    const outDir = args.outputDir
      ? (path.isAbsolute(args.outputDir) ? args.outputDir : path.join(rootDir, args.outputDir))
      : rootDir;

    const baseOutName = args.outputFile ? path.basename(args.outputFile) : 'PROJECT_STRUCTURE.md';

    // Format Exports
    if (args.json) {
      const jsonStr = toJson(result.tree, result.stats);
      const jsonName = baseOutName.replace(/\.md$/, '.json');
      const jsonPath = path.join(outDir, jsonName);
      fs.writeFileSync(jsonPath, jsonStr, 'utf8');
      console.log(colors.success(`JSON exported to ${path.relative(process.cwd(), jsonPath)}`));
    }

    if (args.html) {
      const htmlStr = toHtml(result.tree, result.stats);
      const htmlName = baseOutName.replace(/\.md$/, '.html');
      const htmlPath = path.join(outDir, htmlName);
      fs.writeFileSync(htmlPath, htmlStr, 'utf8');
      console.log(colors.success(`HTML exported to ${path.relative(process.cwd(), htmlPath)}`));
    }

    if (args.svg) {
      const svgStr = toSvg(result.tree, result.stats);
      const svgName = baseOutName.replace(/\.md$/, '.svg');
      const svgPath = path.join(outDir, svgName);
      fs.writeFileSync(svgPath, svgStr, 'utf8');
      console.log(colors.success(`SVG exported to ${path.relative(process.cwd(), svgPath)}`));
    }

    if (args.mermaid) {
      const mermaidStr = toMermaid(result.tree);
      const mermaidName = baseOutName.replace(/\.md$/, '_mermaid.md');
      const mermaidPath = path.join(outDir, mermaidName);
      const content = '# Project Structure (Mermaid)\n\n```mermaid\n' + mermaidStr + '\n```\n';
      fs.writeFileSync(mermaidPath, content, 'utf8');
      console.log(colors.success(`Mermaid exported to ${path.relative(process.cwd(), mermaidPath)}`));
    }

    // AI Context
    if (args.ai) {
      const aiContent = generateAiContext(rootDir, result.treeText, result.stats);
      const aiPath = path.join(outDir, 'AI_CONTEXT.md');
      fs.writeFileSync(aiPath, aiContent, 'utf8');
      console.log(colors.success(`AI context written to ${path.relative(process.cwd(), aiPath)}`));
    }

    // AI Prompt
    if (args.prompt) {
      const promptContent = generateAiPrompt(rootDir, result.treeText, result.stats);
      const promptPath = path.join(outDir, 'AI_PROMPT.md');
      fs.writeFileSync(promptPath, promptContent, 'utf8');
      console.log(colors.success(`AI prompt written to ${path.relative(process.cwd(), promptPath)}`));
    }

    // Inject
    if (args.inject) {
      const injectPath = path.isAbsolute(args.inject) ? args.inject : path.join(rootDir, args.inject);
      const { success, message } = injectIntoFile(injectPath, result.markdown);
      if (success) console.log(colors.success(message));
      else console.log(colors.warn(message));
    }

    // Bundle Mode
    if (args.bundle) {
      const bundleRes = generateBundle({
        rootDir,
        outputDir: args.outputDir,
        exportList: args.bundleList || args.exportList,
      });
      console.log('\n' + bundleRes.summaryText);
    }

    // Selective / All Exports Mode
    if (args.exportAll || args.exportList) {
      exportReports({
        rootDir,
        outputDir: args.outputDir,
        exportList: args.exportList,
        exportAll: args.exportAll,
      });
    }

    // Output file report
    if (result.outputPath && shouldWriteMarkdown) {
      console.log(colors.success(`Project structure written to ${colors.green(path.relative(process.cwd(), result.outputPath))}`));
    }

    // Clipboard
    if (args.copy && process.stdout.isTTY) {
      const copied = copyToClipboard(result.markdown);
      if (copied) console.log(`📋 ${colors.green('Project structure copied to clipboard!')}`);
    }

    // Watch mode
    if (args.watch) {
      watchDirectory(rootDir, () => {
        try {
          const r = generateTree({
            rootDir, outputFile: args.outputFile,
            exclude: args.exclude || DEFAULT_EXCLUDE, maxDepth: args.maxDepth,
            noIgnore: args.noIgnore, includeBinary: args.includeBinary,
            showSensitive: args.showSensitive, maxSize: args.maxSize,
            compress: args.compress, collapseThreshold: args.collapseThreshold,
            theme: args.theme, details: args.details, summarize: args.summarize,
            writeFile: shouldWriteMarkdown,
          });
          const ts = new Date().toLocaleTimeString();
          console.log(`🔄 ${colors.cyan(`Tree updated at ${ts}`)} (${r.statsText})`);
          if (args.copy && process.stdout.isTTY) copyToClipboard(r.markdown);
        } catch (e) {
          console.error(colors.error(e.message));
        }
      });
    }

  } catch (err) {
    console.error(colors.error(`Failed to generate project structure: ${err.message}`));
    process.exit(1);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.version) {
    const pkg = require('../package.json');
    console.log(`project-tree-md v${pkg.version}`);
    return;
  }

  if (args.help) {
    printHelp();
    return;
  }

  // Compare subcommand
  if (args.compare) {
    const [a, b] = args.compare;
    if (!a || !b) {
      console.error(colors.error('Usage: project-tree-md compare <pathA> <pathB>'));
      process.exit(1);
    }
    try {
      const result = compare(a, b, { exclude: args.exclude || DEFAULT_EXCLUDE });
      console.log('\n' + result.summary);
    } catch (e) {
      console.error(colors.error(e.message));
      process.exit(1);
    }
    return;
  }

  // Interactive mode
  if (args.interactive) {
    runInteractive();
    return;
  }

  runGenerate(args);
}

main();
