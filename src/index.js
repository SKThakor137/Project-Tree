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
  toSvg,
  toMermaid,

  // Features
  generateAiContext,
  generateAiPrompt,
  injectIntoFile,
  compare,
  detectMonorepo,
  formatWorkspaceSummary,
  estimateTokens,
  calculateCost,
  formatTokenSummary,
  extractFileSummary,
};
