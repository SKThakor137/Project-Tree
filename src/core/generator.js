'use strict';

const fs = require('fs');
const path = require('path');
const { scan, DEFAULT_EXCLUDE, parseSize } = require('./scanner.js');
const { buildTreeText, buildColoredTreeText } = require('./formatter.js');
const { computeStats } = require('./stats.js');
const { buildIgnoreMatcher } = require('../utils/ignore.js');
const { toMarkdown } = require('../exporters/markdown.js');
const { detectProject } = require('../detectors/project.js');

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
    theme       = 'unicode',
    details     = false,
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
  });

  if (!tree) throw new Error(`Could not read directory: ${rootDir}`);

  const fmtOpts = { theme, details };
  const treeText = buildTreeText(tree, fmtOpts);
  const coloredTreeText = buildColoredTreeText(tree, fmtOpts);
  const stats = computeStats(tree);
  const projectInfo = detectProject(rootDir);
  const markdown = toMarkdown(treeText, stats, projectInfo);

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
  };
}

module.exports = { generateTree };
