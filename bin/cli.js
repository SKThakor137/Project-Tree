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
const { toMindmapHtml } = require('../src/exporters/mindmap.js');
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
const { toArchitectureFlowHtml } = require('../src/exporters/architectureFlowHtml.js');
const { toCsv, toTsv } = require('../src/exporters/csv.js');
const { toXml } = require('../src/exporters/xml.js');
const { toYaml } = require('../src/exporters/yaml.js');
const { toPlantUml } = require('../src/exporters/plantuml.js');
const { loadConfig } = require('../src/core/configLoader.js');
const { findDuplicatesByName, findDuplicatesByHash, formatDuplicateReport } = require('../src/features/duplicates.js');
const { loadPluginsFromConfig } = require('../src/core/pluginApi.js');
const { generateShellHook, installShellHook } = require('../src/features/shellHook.js');

// ─── Arg Parser ───────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {
    interactive: false,
    dashboard: false,
    tokens: false,
    summarize: false,
    flow: false,
    architecture: false,
    visualize: false,
    visualize3d: false,
    graphJson: false,
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
    mindmap: false,
    svg: false,
    mermaid: false,
    csv: false,
    tsv: false,
    xml: false,
    yaml: false,
    plantuml: false,
    watch: false,
    inject: null,
    compare: null,
    help: false,
    version: false,
    copy: true,

    // New v3.0 Flags
    sort: null,
    sortOrder: 'asc',
    hash: null,
    permissions: false,
    owner: false,
    modified: false,
    created: false,
    duplicates: false,
    icons: null,
    maxFiles: null,
    maxFolders: null,
    bfs: false,
    config: null,
    respectIgnore: true,
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

      // New v3.0 flags
      case '--sort':                   args.sort = argv[++i]; break;
      case '--sort-order':             args.sortOrder = argv[++i]; break;
      case '--hash':                   args.hash = argv[++i] || 'sha256'; break;
      case '--permissions':            args.permissions = true; break;
      case '--owner':                  args.owner = true; break;
      case '--modified':               args.modified = true; break;
      case '--created':                args.created = true; break;
      case '--duplicates':             args.duplicates = true; break;
      case '--icons':                  args.icons = argv[++i]; break;
      case '--max-files':              args.maxFiles = parseInt(argv[++i], 10); break;
      case '--max-folders':            args.maxFolders = parseInt(argv[++i], 10); break;
      case '--bfs':                    args.bfs = true; break;
      case '--config':                 args.config = argv[++i]; break;
      case '--respect-ignore':         args.respectIgnore = true; break;

      // Bundle & Export System Flags & Subcommands
      case 'bundle': case '--bundle': case '--zip': case '--download':
        args.bundle = true;
        if (argv[i + 1] && !argv[i + 1].startsWith('-')) {
          args.bundleList = argv[++i];
        }
        break;
      case 'export-all': case '--export-all':
        args.exportAll = true; break;
      case 'export': case '--export':
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

      // Format & Analysis Flags & Subcommands
      case 'ai': case '--ai':                         args.ai = true; break;
      case 'prompt': case '--prompt':                 args.prompt = true; break;
      case 'tokens': case '--tokens':                 args.tokens = true; break;
      case 'summarize': case '--summarize':          args.summarize = true; break;
      case 'flow': case '--flow':                     args.flow = true; break;
      case 'architecture': case '--architecture':     args.architecture = true; break;
      case 'visualize': case 'graph': case 'code-graph':
      case '--visualize': case '--graph': case '--code-graph':
                                                      args.visualize = true; break;
      case 'visualize-3d': case '3d-graph': case 'graph-3d':
      case '--visualize-3d': case '--3d-graph': case '--graph-3d':
                                                      args.visualize3d = true; break;
      case 'graph-json': case '--graph-json':         args.graphJson = true; break;
      case 'json': case '--json':                     args.json = true; break;
      case 'html': case '--html':                     args.html = true; break;
      case 'mindmap': case '--mindmap':               
      case 'roadmap': case '--roadmap':
      case 'codemap': case '--codemap':
      case 'tree-flow': case '--tree-flow':           args.mindmap = true; break;
      case 'svg': case '--svg':                       args.svg = true; break;
      case 'mermaid': case '--mermaid':               args.mermaid = true; break;
      case 'csv': case '--csv':                       args.csv = true; break;
      case 'tsv': case '--tsv':                       args.tsv = true; break;
      case 'xml': case '--xml':                       args.xml = true; break;
      case 'yaml': case '--yaml':                     args.yaml = true; break;
      case 'plantuml': case '--plantuml':             args.plantuml = true; break;
      case '--watch':                                 args.watch = true; break;
      case '--inject':                                args.inject = argv[++i]; break;
      case '--theme':                                 args.theme = argv[++i]; break;
      case '--details':                               args.details = true; break;
      case '--compress':                              args.compress = true; break;
      case '--collapse':                              args.collapseThreshold = parseInt(argv[++i], 10); break;
      case '--max-size':                              args.maxSize = argv[++i]; break;
      case '--include-binary':                        args.includeBinary = true; break;
      case '--show-sensitive':                        args.showSensitive = true; break;
      case '--no-ignore':                             args.noIgnore = true; break;
      case 'dashboard': case '--dashboard':           args.dashboard = true; break;
      case '-i': case '--interactive':                args.interactive = true; break;

      // Terminal Shell Hook Integration
      case 'init-shell': case '--init-shell':
        args.initShell = (argv[i + 1] && !argv[i + 1].startsWith('-')) ? argv[++i] : 'powershell';
        break;
      case 'install-hook': case '--install-hook':
        args.installHook = (argv[i + 1] && !argv[i + 1].startsWith('-')) ? argv[++i] : 'powershell';
        break;

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
${colors.boldCyan('project-tree-md')} — Enterprise AI-Ready Project Analysis Suite (v3.0)

${colors.bold('Usage:')}
  npx project-tree-md [options]
  npx project-tree-md compare <pathA> <pathB>

${colors.bold('Bundle & Export System:')}
  --bundle [list]         Generate ZIP package with all or selected reports (${colors.cyan('e.g. --bundle html,json,svg')})
  --export [list]         Export selected reports to directory (${colors.cyan('e.g. --export html,json')})
  --export-all            Export all individual analysis reports
  --output-dir <dir>      Output directory for exports and ZIP bundles
  --no-write, --stdout    Print to console without writing default output files

${colors.bold('Output & Tree Customization:')}
  -o, --out <file>        Output filename              ${colors.gray('(default: PROJECT_STRUCTURE.md)')}
  -L, --depth <n>         Max depth to traverse        ${colors.gray('(default: unlimited)')}
  -I, --exclude <regex>   Custom exclude pattern       ${colors.gray('(default: standard ignores)')}
  --theme <name|path>     Tree theme                   ${colors.gray('(unicode|ascii|emoji|box|rounded|double|minimal)')}
  --icons <path>          Custom icons JSON file       ${colors.gray('(override extension -> icon mapping)')}
  --sort <mode>           Sort entries                 ${colors.gray('(alpha|folders-first|files-first|extension|size|modified|created|natural)')}
  --sort-order <asc|desc> Sort direction              ${colors.gray('(default: asc)')}
  --details               Show file size & extension
  --summarize             Extract & show inline file comment summaries
  --flow                  Generate architecture execution flow & role map
  --visualize, --graph    Generate 2D & 3D interactive code relationship graph HTML
  --graph-json            Export universal graph model as JSON
  --compress              Compress single-child dirs
  --collapse <n>          Collapse dirs with >n files
  --dashboard             Show rich stats dashboard
  --architecture          Enable advanced architecture parsing & metrics

${colors.bold('File Metadata & Hashing:')}
  --hash [algo]           Compute file content hashes  ${colors.gray('(md5|sha1|sha256)')}
  --permissions           Show file permissions        ${colors.gray('(rwxr-xr-x format)')}
  --owner                 Show file owner UID/GID
  --modified              Show last modified dates
  --created               Show file creation dates
  --duplicates            Detect & report duplicate files (by name or hash)

${colors.bold('Export Formats:')}
  --json                  Export as JSON
  --html                  Export as collapsible HTML with Download Center
  --roadmap, --codemap    Export as interactive Code Architecture Roadmap HTML
  --svg                   Export as SVG diagram
  --mermaid               Export as Mermaid graph
  --csv                   Export as CSV flat table
  --tsv                   Export as TSV flat table
  --xml                   Export as well-formed XML
  --yaml                  Export as YAML document
  --plantuml              Export as PlantUML diagram

${colors.bold('Limits & Controls:')}
  --max-files <n>         Stop after scanning N files
  --max-folders <n>       Stop after scanning N folders
  --config <path>         Path to custom config file
  --respect-ignore        Respect nested .gitignore files

${colors.bold('AI Features:')}
  --ai                    Generate AI context document
  --prompt                Generate AI-ready prompt
  --tokens                Output AI context token count & cost estimation

${colors.bold('Terminal Shell Integration:')}
  --init-shell [shell]    Output shell tab hook snippet ${colors.gray('(powershell|bash|zsh|cmd)')}
  --install-hook [shell]  Install shell hook into user profile (runs tree ONCE on 1st command)

${colors.bold('Other Options:')}
  -i, --interactive       Interactive guided setup
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
    const theme = (await ask(`  Theme [unicode/ascii/emoji/box] ${colors.gray('(emoji)')}: `)) || 'emoji';

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

function runGenerate(cliArgs) {
  try {
    const rootDir = cliArgs.rootDir || process.cwd();

    // Load config (CLI args override config file)
    const { config: mergedConfig, source: configSource } = loadConfig(rootDir, cliArgs);
    const args = { ...mergedConfig, ...cliArgs };

    if (configSource && process.env.VERBOSE) {
      console.log(colors.dim(`Loaded config from ${configSource}`));
    }

    // Load plugins if configured
    if (args.plugins) {
      loadPluginsFromConfig(args.plugins, rootDir);
    }

    // Preserve 100% existing functionality: PROJECT_STRUCTURE.md is always written by default unless --no-write is passed
    const shouldWriteMarkdown = !args.noWrite;

    // If architecture is required by bundle or export, enable architecture mode automatically
    const isArchNeeded = args.architecture || args.bundle || args.exportAll || args.exportList;

    const result = generateTree({
      rootDir,
      outputFile: args.outputFile,
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
      modified: args.modified,
      created: args.created,
      permissions: args.permissions,
      owner: args.owner,
      hash: args.hash,
      sort: args.sort,
      sortOrder: args.sortOrder,
      icons: args.icons,
      maxFiles: args.maxFiles,
      maxFolders: args.maxFolders,
    });

    // Print colorized tree
    console.log('\n' + result.coloredTreeText + '\n');

    // Duplicate Detection Report
    if (args.duplicates) {
      const mode = args.hash ? 'hash' : 'name';
      const dups = mode === 'hash'
        ? findDuplicatesByHash(result.tree, args.hash)
        : findDuplicatesByName(result.tree);
      console.log(formatDuplicateReport(dups, mode) + '\n');
    }

    const outDir = args.outputDir
      ? (path.isAbsolute(args.outputDir) ? args.outputDir : path.join(rootDir, args.outputDir))
      : rootDir;

    // Architecture Flow Output
    if (args.flow) {
      const flowRes = result.flowResult || generateArchitectureFlow(rootDir, result.tree);
      console.log(flowRes.coloredFlowText + '\n');

      // Generate Architecture Flow HTML
      const flowHtml = toArchitectureFlowHtml(flowRes, result.tree.name);
      const flowHtmlPath = path.join(outDir, 'ARCHITECTURE_FLOW.html');
      fs.writeFileSync(flowHtmlPath, flowHtml, 'utf8');
      console.log(colors.success(`Architecture Flow HTML exported to ${path.relative(process.cwd(), flowHtmlPath)}`));
    }

    // Universal Code Relationship Graph
    if (args.visualize || args.visualize3d || args.graphJson) {
      try {
        const graphModel = generateUniversalGraph(rootDir, result.tree);
        const nodeCount = graphModel.nodes ? graphModel.nodes.length : 0;
        const edgeCount = graphModel.edges ? graphModel.edges.length : 0;

        if (args.visualize) {
          const graphHtml = toGraphVisualizerHtml(graphModel, result.tree.name);
          const graphHtmlPath = path.join(outDir, 'CODE_GRAPH.html');
          fs.writeFileSync(graphHtmlPath, graphHtml, 'utf8');
          console.log(colors.success(`Code Relationship Graph exported to ${path.relative(process.cwd(), graphHtmlPath)} (${nodeCount} nodes, ${edgeCount} edges)`));
        }

        if (args.visualize3d) {
          const graph3dHtml = toGraph3dVisualizerHtml(graphModel, result.tree.name);
          const graph3dPath = path.join(outDir, 'CODE_GRAPH_3D.html');
          fs.writeFileSync(graph3dPath, graph3dHtml, 'utf8');
          console.log(colors.success(`3D Code Relationship Graph exported to ${path.relative(process.cwd(), graph3dPath)} (${nodeCount} nodes, ${edgeCount} edges)`));
        }

        if (args.graphJson) {
          const graphJsonStr = toGraphJson(graphModel);
          const graphJsonPath = path.join(outDir, 'CODE_GRAPH.json');
          fs.writeFileSync(graphJsonPath, graphJsonStr, 'utf8');
          console.log(colors.success(`Graph JSON exported to ${path.relative(process.cwd(), graphJsonPath)} (${nodeCount} nodes, ${edgeCount} edges)`));
        }
      } catch (graphErr) {
        console.log(colors.warn(`Graph generation: ${graphErr.message}`));
      }
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

    const baseOutName = result.outputPath
      ? path.basename(result.outputPath)
      : (args.outputFile ? path.basename(args.outputFile) : 'PROJECT_STRUCTURE.md');

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

    if (args.mindmap) {
      const mindmapStr = toMindmapHtml(result.tree, result.stats);
      const mindmapPath = path.join(outDir, 'PROJECT_MINDMAP.html');
      fs.writeFileSync(mindmapPath, mindmapStr, 'utf8');
      console.log(colors.success(`Mind Map HTML exported to ${path.relative(process.cwd(), mindmapPath)}`));
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

    if (args.csv) {
      const csvStr = toCsv(result.tree, result.stats, rootDir);
      const csvName = baseOutName.replace(/\.md$/, '.csv');
      const csvPath = path.join(outDir, csvName);
      fs.writeFileSync(csvPath, csvStr, 'utf8');
      console.log(colors.success(`CSV exported to ${path.relative(process.cwd(), csvPath)}`));
    }

    if (args.tsv) {
      const tsvStr = toTsv(result.tree, result.stats, rootDir);
      const tsvName = baseOutName.replace(/\.md$/, '.tsv');
      const tsvPath = path.join(outDir, tsvName);
      fs.writeFileSync(tsvPath, tsvStr, 'utf8');
      console.log(colors.success(`TSV exported to ${path.relative(process.cwd(), tsvPath)}`));
    }

    if (args.xml) {
      const xmlStr = toXml(result.tree, result.stats);
      const xmlName = baseOutName.replace(/\.md$/, '.xml');
      const xmlPath = path.join(outDir, xmlName);
      fs.writeFileSync(xmlPath, xmlStr, 'utf8');
      console.log(colors.success(`XML exported to ${path.relative(process.cwd(), xmlPath)}`));
    }

    if (args.yaml) {
      const yamlStr = toYaml(result.tree, result.stats);
      const yamlName = baseOutName.replace(/\.md$/, '.yaml');
      const yamlPath = path.join(outDir, yamlName);
      fs.writeFileSync(yamlPath, yamlStr, 'utf8');
      console.log(colors.success(`YAML exported to ${path.relative(process.cwd(), yamlPath)}`));
    }

    if (args.plantuml) {
      const pumlStr = toPlantUml(result.tree, result.stats);
      const pumlName = baseOutName.replace(/\.md$/, '.puml');
      const pumlPath = path.join(outDir, pumlName);
      fs.writeFileSync(pumlPath, pumlStr, 'utf8');
      console.log(colors.success(`PlantUML exported to ${path.relative(process.cwd(), pumlPath)}`));
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

  // Shell Hook Subcommands / Flags
  if (args.initShell) {
    try {
      const snippet = generateShellHook(args.initShell);
      console.log(snippet);
    } catch (e) {
      console.error(colors.error(e.message));
      process.exit(1);
    }
    return;
  }

  if (args.installHook) {
    try {
      const res = installShellHook(args.installHook);
      console.log(colors.success(res.message));
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
