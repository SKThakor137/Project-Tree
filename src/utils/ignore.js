'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Convert a gitignore glob pattern to a RegExp string.
 * Supports: *, **, ?, leading-/, trailing-/, negation (handled by caller).
 * @param {string} pattern
 * @returns {string}
 */
function globToRegExpStr(pattern) {
  let p = pattern.trimEnd();
  if (p.endsWith('/')) p = p.slice(0, -1); // trailing slash = dir-match

  // Escape regex specials except * and ?
  p = p.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  p = p.replace(/\*\*/g, '\x00'); // placeholder for **
  p = p.replace(/\*/g, '[^/]*');   // * = anything but /
  p = p.replace(/\?/g, '[^/]');    // ? = single non-/
  p = p.replace(/\x00/g, '.*');    // ** = anything

  return p;
}

/**
 * Parse a .gitignore-style file into an array of rule objects.
 * @param {string} filePath
 * @returns {Array<{pattern: string, negated: boolean, anchored: boolean}>}
 */
function parseIgnoreFile(filePath) {
  if (!fs.existsSync(filePath)) return [];

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  const results = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    const negated = line.startsWith('!');
    const pattern = negated ? line.slice(1) : line;
    const anchored = pattern.startsWith('/');
    const clean = anchored ? pattern.slice(1) : pattern;

    results.push({ pattern: clean, negated, anchored });
  }
  return results;
}

/**
 * Build a compiled matcher from ignore files found in rootDir.
 * Returns a function that takes a relative POSIX path and returns true
 * if the path should be ignored.
 *
 * @param {string} rootDir
 * @param {string[]} [fileNames]
 * @param {boolean} [noIgnore] - if true, returns a no-op matcher
 * @returns {function(string): boolean}
 */
function buildIgnoreMatcher(rootDir, fileNames = ['.gitignore', '.npmignore', '.ignore'], noIgnore = false) {
  if (noIgnore) return () => false;

  /** @type {Array<{reg: RegExp, negated: boolean}>} */
  const rules = [];

  for (const file of fileNames) {
    const filePath = path.join(rootDir, file);
    const entries = parseIgnoreFile(filePath);
    for (const { pattern, negated } of entries) {
      const regStr = globToRegExpStr(pattern);
      try {
        // Match anywhere in path OR as full segment
        const reg = new RegExp(`(^|/)${regStr}(/|$)`);
        rules.push({ reg, negated });
      } catch (_) { /* skip invalid patterns */ }
    }
  }

  if (rules.length === 0) return () => false;

  return function isIgnored(relativePosixPath) {
    let ignored = false;
    for (const { reg, negated } of rules) {
      if (reg.test(relativePosixPath)) {
        ignored = !negated;
      }
    }
    return ignored;
  };
}

module.exports = { buildIgnoreMatcher, parseIgnoreFile, globToRegExpStr };
