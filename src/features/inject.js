/**
 * Injects generated project tree text into existing Markdown files between HTML comment markers.
 */
'use strict';

const fs = require('fs');

const START_MARKER = '<!-- PROJECT_TREE_START -->';
const END_MARKER = '<!-- PROJECT_TREE_END -->';

/**
 * Inject the tree markdown into a file between markers.
 * @param {string} filePath - Target file (e.g. README.md)
 * @param {string} treeMarkdown - The markdown content to inject
 * @returns {{ success: boolean, message: string }}
 */
function injectIntoFile(filePath, treeMarkdown) {
  if (!fs.existsSync(filePath)) {
    return { success: false, message: `File not found: ${filePath}` };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const startIdx = content.indexOf(START_MARKER);
  const endIdx = content.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) {
    return {
      success: false,
      message: `Markers not found in ${filePath}. Add these to your file:\n  ${START_MARKER}\n  ${END_MARKER}`,
    };
  }

  if (endIdx < startIdx) {
    return { success: false, message: `End marker appears before start marker in ${filePath}` };
  }

  const before = content.slice(0, startIdx + START_MARKER.length);
  const after = content.slice(endIdx);
  const injected = `${before}\n\n${treeMarkdown}\n${after}`;

  fs.writeFileSync(filePath, injected, 'utf8');
  return { success: true, message: `Tree injected into ${filePath}` };
}

module.exports = { injectIntoFile, START_MARKER, END_MARKER };
