'use strict';

/**
 * Markdown exporter — generates PROJECT_STRUCTURE.md content.
 * @param {string}  treeText    Plain-text tree
 * @param {Object}  stats       Output of computeStats()
 * @param {Object}  [projectInfo]  Output of detectProject() (optional)
 * @returns {string} markdown
 */
function toMarkdown(treeText, stats, projectInfo = null) {
  const timestamp = new Date().toISOString();
  const lines = [
    '# Project Structure',
    '',
    `_Auto-generated on ${timestamp}_`,
    `_Total: ${stats.statsText}_`,
  ];

  if (projectInfo && projectInfo.framework) {
    lines.push(`_Framework: ${projectInfo.framework}_`);
  }

  lines.push('', '```', treeText, '```', '');
  return lines.join('\n');
}

module.exports = { toMarkdown };
