'use strict';

const fs = require('fs');

/**
 * Clean and format raw comment text into a 1-sentence description.
 *
 * @param {string} rawText
 * @returns {string|null}
 */
function cleanSummaryText(rawText) {
  if (!rawText) return null;

  let cleaned = rawText
    // Remove doc tags like @file, @description, @overview, @module, @brief, @typedef, @param, @returns
    .replace(/@(?:typedef|param|returns?|type|template|see|link)\s*\{[^}]*\}\s*\w*/gi, '')
    .replace(/@(?:file|overview|description|module|brief|doc|typedef|param|returns?|type|template|see|link)\b/gi, '')
    // Remove comment delimiters
    .replace(/^(\/\/|#|--|;|\/\*+|\*+|\*\/|<!--|-->|'''|""")+/gm, '')
    .replace(/(\/\*+|\*+|\*\/|<!--|-->|'''|""")+$/gm, '')
    // Replace tabs/newlines with spaces
    .replace(/[\r\n\t]+/g, ' ')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return null;

  // Extract the first sentence if multiple sentences exist
  const sentenceMatch = cleaned.match(/^([^.!?]+[.!?])/);
  if (sentenceMatch && sentenceMatch[1] && sentenceMatch[1].length >= 5) {
    cleaned = sentenceMatch[1].trim();
  }

  // Truncate to maximum 90 characters for neat alignment in terminal trees
  if (cleaned.length > 90) {
    cleaned = cleaned.substring(0, 87).trim() + '...';
  }

  // Ensure first letter is capitalized
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Extract top header comment summary from a text file (first 5-10 lines).
 *
 * @param {string} filePath
 * @param {number} [maxLines=10]
 * @returns {string|null}
 */
function extractFileSummary(filePath, maxLines = 10) {
  let fd;
  try {
    fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(2048);
    const bytesRead = fs.readSync(fd, buffer, 0, 2048, 0);
    fs.closeSync(fd);
    fd = null;

    if (bytesRead === 0) return null;

    // Check for null bytes (binary file safety)
    const contentBuffer = buffer.slice(0, bytesRead);
    for (let i = 0; i < contentBuffer.length; i++) {
      if (contentBuffer[i] === 0) return null;
    }

    const contentStr = contentBuffer.toString('utf8');
    const lines = contentStr.split(/\r?\n/).slice(0, maxLines);

    let commentLines = [];
    let inBlockComment = false;
    let blockCommentType = null; // 'slashStar', 'html', 'python'

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines or shebang or directives if comment hasn't started yet
      if (!inBlockComment && commentLines.length === 0) {
        if (!line) continue;
        if (line.startsWith('#!')) continue;
        if (/^['"]use strict['"];?$/i.test(line)) continue;
        if (/^\/\/\s*@ts-(?:nocheck|check)/i.test(line)) continue;
        if (/^\/\*\s*eslint-/i.test(line)) continue;
      }

      // Check block comment start
      if (!inBlockComment) {
        if (line.startsWith('/*')) {
          inBlockComment = true;
          blockCommentType = 'slashStar';
          const stripped = line.replace(/^\/\*+/, '').trim();
          if (stripped && !stripped.endsWith('*/')) commentLines.push(stripped);
          if (line.endsWith('*/') && line.length > 4) {
            commentLines.push(line.replace(/^\/\*+/, '').replace(/\*\/$/, '').trim());
            break;
          }
          continue;
        }
        if (line.startsWith('<!--')) {
          inBlockComment = true;
          blockCommentType = 'html';
          const stripped = line.replace(/^<!--+/, '').trim();
          if (stripped && !stripped.endsWith('-->')) commentLines.push(stripped);
          if (line.endsWith('-->') && line.length > 7) {
            commentLines.push(line.replace(/^<!--+/, '').replace(/--+>$/, '').trim());
            break;
          }
          continue;
        }
        if (line.startsWith('"""') || line.startsWith("'''")) {
          const delim = line.substring(0, 3);
          inBlockComment = true;
          blockCommentType = 'python';
          const stripped = line.substring(3).trim();
          if (stripped && !stripped.endsWith(delim)) commentLines.push(stripped);
          if (line.endsWith(delim) && line.length > 6) {
            commentLines.push(stripped.slice(0, -3).trim());
            break;
          }
          continue;
        }
      }

      // Inside block comment
      if (inBlockComment) {
        if (blockCommentType === 'slashStar' && line.includes('*/')) {
          const contentBefore = line.split('*/')[0].replace(/^\*+/, '').trim();
          if (contentBefore) commentLines.push(contentBefore);
          break;
        }
        if (blockCommentType === 'html' && line.includes('-->')) {
          const contentBefore = line.split('-->')[0].replace(/^<!--+/, '').trim();
          if (contentBefore) commentLines.push(contentBefore);
          break;
        }
        if (blockCommentType === 'python' && (line.includes('"""') || line.includes("'''"))) {
          const contentBefore = line.replace(/"""|'''/g, '').trim();
          if (contentBefore) commentLines.push(contentBefore);
          break;
        }

        const cleanedLine = line.replace(/^\*+/, '').trim();
        if (cleanedLine) commentLines.push(cleanedLine);
        continue;
      }

      // Single line comments
      if (line.startsWith('//') || line.startsWith('#') || line.startsWith('--') || line.startsWith(';')) {
        const cleanedLine = line.replace(/^(\/\/|#|--|;)+/, '').trim();
        if (cleanedLine) commentLines.push(cleanedLine);
        continue;
      }

      // If we encounter code after or without comment, stop
      if (commentLines.length > 0) break;
      if (!line.startsWith('//') && !line.startsWith('#') && !line.startsWith('/*') && !line.startsWith('<!--')) {
        break;
      }
    }

    if (commentLines.length === 0) return null;

    const rawText = commentLines.join(' ');
    return cleanSummaryText(rawText);
  } catch (_) {
    return null;
  } finally {
    if (fd) {
      try { fs.closeSync(fd); } catch (_) {}
    }
  }
}

module.exports = {
  extractFileSummary,
  cleanSummaryText,
};
