/**
 * Main generator orchestrator — scans directory and generates tree, stats, and markdown exports.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { scan, DEFAULT_EXCLUDE, parseSize } = require('./scanner.js');
const { buildTreeText, buildColoredTreeText } = require('./formatter.js');
const { computeStats } = require('./stats.js');
const { buildIgnoreMatcher } = require('../utils/ignore.js');
const { toMarkdown } = require('../exporters/markdown.js');
const { detectProject } = require('../detectors/project.js');
const { estimateTokens, formatTokenSummary } = require('../features/tokens.js');
const { generateArchitectureFlow } = require('./architectureFlow.js');
const { buildArchitectureGraph } = require('./analyzer.js');

/**
 * Main orchestrator — generates everything from a single call.
 *
 * @param {Object} options
 * @param {string}   [options.rootDir]
 * @param {string}   [options.outputFile]
 * @param {RegExp}   [options.exclude]
 * @param {number}   [options.maxDepth]
 * @param {boolean}  [options.noIgnore]
 * @param {boolean}  [options.includeBinary]
 * @param {boolean}  [options.showSensitive]
 * @param {string}   [options.maxSize]
 * @param {boolean}  [options.compress]
 * @param {number}   [options.collapseThreshold]
 * @param {string}   [options.theme]
 * @param {boolean}  [options.details]
 * @param {boolean}  [options.summarize]
 * @param {boolean}  [options.flow]
 * @param {boolean}  [options.writeFile] - write output file (default true)
 * @returns {Object}
 */
function generateTree(options = {}) {
  const {
    rootDir     = process.cwd(),
    outputFile  = 'PROJECT_STRUCTURE.md',
    exclude     = DEFAULT_EXCLUDE,
    maxDepth,
    noIgnore    = false,
    includeBinary = false,
    showSensitive = false,
    maxSize,
    compress    = false,
    collapseThreshold = null,
    theme       = 'emoji',
    details     = false,
    summarize   = false,
    flow        = false,
    writeFile   = true,
  } = options;

  const ignoreFn = buildIgnoreMatcher(rootDir, undefined, noIgnore);
  const maxSizeBytes = parseSize(maxSize);

  const tree = scan(rootDir, {
    exclude,
    maxDepth,
    ignoreFn,
    includeBinary,
    showSensitive,
    maxSize: maxSizeBytes,
    compress,
    collapseThreshold,
    summarize,
    architecture: options.architecture,
  });

  if (!tree) throw new Error(`Could not read directory: ${rootDir}`);

  const fmtOpts = { theme, details };
  const treeText = buildTreeText(tree, fmtOpts);
  const coloredTreeText = buildColoredTreeText(tree, fmtOpts);
  const stats = computeStats(tree);

  if (options.architecture) {
    // Collect parsed files for architecture graph
    const parsedFiles = [];
    function collectParsed(node) {
      if (node.parsed) {
        parsedFiles.push(node);
      }
      if (node.children) {
        node.children.forEach(collectParsed);
      }
    }
    collectParsed(tree);

    const architectureGraph = buildArchitectureGraph(parsedFiles);

    // Attach new architecture data to stats
    stats.architectureGraph = architectureGraph;
    stats.componentsCount = parsedFiles.reduce((acc, f) => acc + (f.parsed.components ? f.parsed.components.length : 0), 0);
    stats.totalLines = parsedFiles.reduce((acc, f) => acc + (f.parsed.lines || 0), 0);
    stats.avgComplexity = parsedFiles.length > 0 ? parsedFiles.reduce((acc, f) => acc + (f.parsed.complexity || 1), 0) / parsedFiles.length : 1;
  }

  const projectInfo = detectProject(rootDir);
  const markdown = toMarkdown(treeText, stats, projectInfo);

  const tokens = estimateTokens(markdown);
  const tokenSummary = formatTokenSummary(tokens);

  let flowResult = null;
  if (flow) {
    try {
      flowResult = generateArchitectureFlow(rootDir, tree);
    } catch (_) {}
  }

  let outputPath = null;
  if (writeFile) {
    outputPath = path.isAbsolute(outputFile)
      ? outputFile
      : path.join(rootDir, outputFile);
    fs.writeFileSync(outputPath, markdown, 'utf8');
  }

  return {
    tree,
    treeText,
    coloredTreeText,
    stats,
    statsText: stats.statsText,
    markdown,
    outputPath,
    projectInfo,
    tokens,
    tokenSummary,
    flowResult,
    flowText: flowResult ? flowResult.flowText : null,
    coloredFlowText: flowResult ? flowResult.coloredFlowText : null,
  };
}

module.exports = { generateTree };
