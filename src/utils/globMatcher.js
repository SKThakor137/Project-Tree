'use strict';

/**
 * Advanced glob pattern matcher — .gitignore-compatible.
 *
 * Supports:
 *   *        — match anything except /
 *   **       — match anything including /
 *   ?        — match a single char except /
 *   [abc]    — character class
 *   [a-z]    — character range
 *   [!abc]   — negated character class
 *   \x       — escape any special character
 *   trailing / — directory-only match
 *
 * Zero dependencies — built-in Node.js only.
 */

/**
 * Escape a string for use inside a RegExp.
 * @param {string} s
 * @returns {string}
 */
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Convert a gitignore-style glob pattern to a RegExp.
 *
 * @param {string} pattern — raw glob pattern (without leading !)
 * @param {Object} [options]
 * @param {boolean} [options.anchored] — pattern was anchored with leading /
 * @param {boolean} [options.dirOnly]  — trailing / means match directories only
 * @returns {RegExp}
 */
function globToRegExp(pattern, options = {}) {
  const { anchored = false } = options;
  let src = '';
  let i = 0;

  while (i < pattern.length) {
    const ch = pattern[i];

    if (ch === '\\' && i + 1 < pattern.length) {
      // Escaped character — match literally
      src += escapeRegExp(pattern[i + 1]);
      i += 2;
      continue;
    }

    if (ch === '*') {
      if (pattern[i + 1] === '*') {
        // ** — match anything (including /)
        if (pattern[i + 2] === '/') {
          // **/ — match zero or more directories
          src += '(?:.*/)?';
          i += 3;
        } else {
          src += '.*';
          i += 2;
        }
      } else {
        // * — match anything except /
        src += '[^/]*';
        i++;
      }
      continue;
    }

    if (ch === '?') {
      src += '[^/]';
      i++;
      continue;
    }

    if (ch === '[') {
      // Character class
      let j = i + 1;
      let classStr = '';
      let negated = false;

      if (j < pattern.length && (pattern[j] === '!' || pattern[j] === '^')) {
        negated = true;
        j++;
      }

      const start = j;
      while (j < pattern.length && pattern[j] !== ']') {
        if (pattern[j] === '\\' && j + 1 < pattern.length) {
          classStr += '\\' + pattern[j + 1];
          j += 2;
        } else {
          classStr += pattern[j];
          j++;
        }
      }

      if (j >= pattern.length) {
        // Unmatched [ — treat literally
        src += '\\[';
        i++;
        continue;
      }

      // Valid character class
      src += '[' + (negated ? '^' : '') + classStr + ']';
      i = j + 1;
      continue;
    }

    // Any other character — escape for regex safety
    src += escapeRegExp(ch);
    i++;
  }

  // Build the full regex
  let fullPattern;
  if (anchored) {
    // Anchored: must match from the start of the path
    fullPattern = '^' + src + '(?:/.*)?$';
  } else {
    // Unanchored: can match anywhere as a path segment
    fullPattern = '(?:^|/)' + src + '(?:/.*)?$';
  }

  return new RegExp(fullPattern);
}

/**
 * Parse a single gitignore-style line into a rule object.
 *
 * @param {string} line — raw line from ignore file
 * @returns {{ pattern: string, negated: boolean, anchored: boolean, dirOnly: boolean, regex: RegExp } | null}
 */
function parseIgnoreLine(line) {
  let trimmed = line.replace(/\r$/, '');

  // Strip trailing unescaped spaces
  trimmed = trimmed.replace(/(?<!\\)\s+$/, '');

  // Skip empty lines and comments
  if (!trimmed || trimmed.startsWith('#')) return null;

  let negated = false;
  if (trimmed.startsWith('!')) {
    negated = true;
    trimmed = trimmed.slice(1);
  }

  // Trailing slash means directory-only
  let dirOnly = false;
  if (trimmed.endsWith('/')) {
    dirOnly = true;
    trimmed = trimmed.slice(0, -1);
  }

  // Leading slash means anchored
  let anchored = false;
  if (trimmed.startsWith('/')) {
    anchored = true;
    trimmed = trimmed.slice(1);
  }

  // If pattern contains / in the middle (not leading/trailing), it's implicitly anchored
  if (!anchored && trimmed.includes('/')) {
    anchored = true;
  }

  if (!trimmed) return null;

  const regex = globToRegExp(trimmed, { anchored, dirOnly });

  return { pattern: trimmed, negated, anchored, dirOnly, regex };
}

/**
 * Compile an array of ignore-file lines into an ordered rule set.
 *
 * @param {string[]} lines
 * @returns {Array<{ negated: boolean, dirOnly: boolean, regex: RegExp }>}
 */
function compileIgnoreRules(lines) {
  const rules = [];
  for (const line of lines) {
    const rule = parseIgnoreLine(line);
    if (rule) rules.push(rule);
  }
  return rules;
}

/**
 * Test a relative POSIX path against a compiled rule set.
 *
 * @param {string} relativePath — forward-slash separated, no leading /
 * @param {Array<{ negated: boolean, dirOnly: boolean, regex: RegExp }>} rules
 * @param {boolean} [isDirectory] — whether the path is a directory
 * @returns {boolean} true if ignored
 */
function isIgnored(relativePath, rules, isDirectory = false) {
  let ignored = false;
  for (const rule of rules) {
    // dirOnly rules only match directories
    if (rule.dirOnly && !isDirectory) continue;
    if (rule.regex.test(relativePath)) {
      ignored = !rule.negated;
    }
  }
  return ignored;
}

/**
 * Quick test: does a simple extension-based pattern match a filename?
 * Optimized for common cases like *.js, *.ts, etc.
 *
 * @param {string} filename
 * @param {string} pattern — e.g. "*.js"
 * @returns {boolean}
 */
function matchesExtension(filename, pattern) {
  if (!pattern.startsWith('*.') || pattern.includes('/')) return false;
  const ext = pattern.slice(1); // ".js"
  return filename.endsWith(ext);
}

module.exports = {
  globToRegExp,
  parseIgnoreLine,
  compileIgnoreRules,
  isIgnored,
  matchesExtension,
  escapeRegExp,
};
