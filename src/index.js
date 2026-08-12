'use strict';

/**
 * project-tree-md — public API
 *
 * Backward-compatible re-export. Existing code that does
 *   const { generateTree } = require('project-tree-md')
 * will continue to work unchanged.
 */

const { generateTree } = require('./core/generator.js');
const { buildTreeText, buildColoredTreeText } = require('./core/formatter.js');
const { computeStats } = require('./core/stats.js');
const { scan, DEFAULT_EXCLUDE } = require('./core/scanner.js');
const { detectProject } = require('./detectors/project.js');
const { buildIgnoreMatcher } = require('./utils/ignore.js');
const { toJson } = require('./exporters/json.js');
const { toHtml } = require('./exporters/html.js');
const { toSvg } = require('./exporters/svg.js');
const { toMermaid } = require('./exporters/mermaid.js');
const { generateAiContext, generateAiPrompt } = require('./features/ai.js');
const { injectIntoFile } = require('./features/inject.js');
const { compare } = require('./features/compare.js');
const { detectMonorepo, formatWorkspaceSummary } = require('./features/monorepo.js');
const { estimateTokens, calculateCost, formatTokenSummary } = require('./features/tokens.js');
const { extractFileSummary } = require('./features/summarize.js');
const { generateArchitectureFlow, detectFrameworkRole } = require('./core/architectureFlow.js');
const { createZip } = require('./utils/zip.js');
const { generateBundle, compileAllReports } = require('./features/bundle.js');
const { exportReports } = require('./features/exporter.js');
const { toArchitectureFlowHtml } = require('./exporters/architectureFlowHtml.js');
const { generateUniversalGraph } = require('./core/universalParser.js');
const { toGraphVisualizerHtml } = require('./exporters/graphVisualizer.js');
const { toGraphJson, fromGraphJson } = require('./exporters/graphJson.js');
const { toGraph3dVisualizerHtml } = require('./exporters/graph3dVisualizer.js');

const { toMindmapHtml } = require('./exporters/mindmap.js');

// New v3.0 modules
const { loadConfig, findConfigFile } = require('./core/configLoader.js');
const { sortTree, getSortComparator } = require('./core/sorter.js');
const { findDuplicatesByName, findDuplicatesByHash, formatDuplicateReport } = require('./features/duplicates.js');
const { hashFileSync, hashData } = require('./utils/hasher.js');
const { loadTheme, getPresetNames } = require('./core/themeEngine.js');
// const { toCsv, toTsv } = require('./exporters/csv.js');
// const { toXml } = require('./exporters/xml.js');
// const { toYaml } = require('./exporters/yaml.js');
// const { toPlantUml } = require('./exporters/plantuml.js');
const { registerRenderer, registerScannerHook, registerFormatter, loadPlugin } = require('./core/pluginApi.js');
const { openInBrowser } = require('./utils/opener.js');

const { getGitStatus } = require('./utils/git.js');
const { generateAiRules } = require('./features/aiRules.js');
const { startLiveServer } = require('./features/server.js');

module.exports = {
  // Core (backward-compatible)
  generateTree,
  buildTreeText,
  buildColoredTreeText,
  computeStats,
  scan,
  DEFAULT_EXCLUDE,
  detectProject,
  buildIgnoreMatcher,
  generateArchitectureFlow,
  detectFrameworkRole,

  // Exporters
  toJson,
  toHtml,
  toMindmapHtml,
  toSvg,
  toMermaid,
  toArchitectureFlowHtml,
  // toCsv,
  // toTsv,
  // toXml,
  // toYaml,
  // toPlantUml,

  // Universal Code Relationship Graph (2D & 3D)
  generateUniversalGraph,
  toGraphVisualizerHtml,
  toGraph3dVisualizerHtml,
  toGraphJson,
  fromGraphJson,

  // Features
  generateAiContext,
  generateAiPrompt,
  generateAiRules,
  injectIntoFile,
  compare,
  detectMonorepo,
  formatWorkspaceSummary,
  estimateTokens,
  calculateCost,
  formatTokenSummary,
  extractFileSummary,

  // Config & Sorter & Hashing & Duplicates (v3.0)
  loadConfig,
  findConfigFile,
  sortTree,
  getSortComparator,
  findDuplicatesByName,
  findDuplicatesByHash,
  formatDuplicateReport,
  hashFileSync,
  hashData,

  // Custom Themes & Icons & Plugins (v3.0)
  loadTheme,
  getPresetNames,
  createIconResolver,
  registerRenderer,
  registerScannerHook,
  registerFormatter,
  loadPlugin,

  // Download & Export System
  createZip,
  compileAllReports,
  generateBundle,
  exportReports,

  // Git & Live Server (v3.2)
  getGitStatus,
  startLiveServer,

  // Shell Hook & Terminal Integration
  ...require('./features/shellHook.js'),

  // Browser Opener (v3.2)
  openInBrowser,
};

