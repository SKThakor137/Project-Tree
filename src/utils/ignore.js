'use strict';

const fs = require('fs');
const path = require('path');
const { compileIgnoreRules, isIgnored: globIsIgnored } = require('./globMatcher.js');

/**
 * Convert a gitignore glob pattern to a RegExp string.
 * Supports: *, **, ?, leading-/, trailing-/, negation (handled by caller).
 * @param {string} pattern
 * @returns {string}
 * @deprecated Use globMatcher.js instead — kept for backward compatibility.
 */
function globToRegExpStr(pattern) {
  let p = pattern.trimEnd();
  if (p.endsWith('/')) p = p.slice(0, -1);
  p = p.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  p = p.replace(/\*\*/g, '\x00');
  p = p.replace(/\*/g, '[^/]*');
  p = p.replace(/\?/g, '[^/]');
  p = p.replace(/\x00/g, '.*');
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
 * Discover all ignore files in the project tree recursively.
 * Returns a map of directory path → compiled rule set, so that
 * deeper .gitignore files override parent rules (proper gitignore semantics).
 *
 * @param {string} rootDir
 * @param {string[]} fileNames — ignore file names to search for
 * @param {RegExp} [excludePattern] — directories to skip (e.g. node_modules)
 * @returns {Map<string, Array>} — dirPath → compiled rules
 */
function discoverNestedIgnoreFiles(rootDir, fileNames, excludePattern = null) {
  /** @type {Map<string, Array>} */
  const rulesMap = new Map();

  function walkDir(dirPath) {
    for (const fileName of fileNames) {
      const filePath = path.join(dirPath, fileName);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split(/\r?\n/);
          const rules = compileIgnoreRules(lines);
          if (rules.length > 0) {
            const dirKey = dirPath.replace(/\\/g, '/');
            const existing = rulesMap.get(dirKey) || [];
            rulesMap.set(dirKey, existing.concat(rules));
          }
        } catch (_) {}
      }
    }

    // Recurse into subdirectories
    let entries;
    try { entries = fs.readdirSync(dirPath, { withFileTypes: true }); } catch (_) { return; }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const name = entry.name;
      // Skip excluded dirs
      if (excludePattern && excludePattern.test(name)) continue;
      // Skip common non-project dirs
      if (name === 'node_modules' || name === '.git') continue;
      walkDir(path.join(dirPath, name));
    }
  }

  walkDir(rootDir);
  return rulesMap;
}

/**
 * Build a compiled matcher from ignore files found in rootDir.
 * Supports nested subfolder .gitignore files with proper precedence:
 * deeper rules override parent rules.
 *
 * Returns a function that takes a relative POSIX path and returns true
 * if the path should be ignored.
 *
 * @param {string} rootDir
 * @param {string[]} [fileNames]
 * @param {boolean} [noIgnore] - if true, returns a no-op matcher
 * @param {Object} [options]
 * @param {boolean} [options.nested=true] — scan for nested ignore files
 * @param {RegExp}  [options.excludePattern] — dirs to skip during nested scan
 * @returns {function(string, boolean=): boolean}
 */
function buildIgnoreMatcher(rootDir, fileNames = ['.gitignore', '.npmignore', '.ignore', '.projecttreeignore'], noIgnore = false, options = {}) {
  if (noIgnore) return () => false;

  const { nested = true, excludePattern = null } = options;
  const absoluteRoot = path.resolve(rootDir).replace(/\\/g, '/');

  if (nested) {
    // Use advanced nested ignore file discovery
    const rulesMap = discoverNestedIgnoreFiles(rootDir, fileNames, excludePattern);

    if (rulesMap.size === 0) return () => false;

    // Sort directories by depth (shallowest first) for correct precedence
    const sortedDirs = Array.from(rulesMap.keys()).sort((a, b) => {
      const aDepth = a.split('/').length;
      const bDepth = b.split('/').length;
      return aDepth - bDepth;
    });

    return function isIgnoredNested(relativePosixPath, isDirectory = false) {
      let ignored = false;

      for (const dirKey of sortedDirs) {
        // Only apply rules from directories that are parents of (or equal to) the file's directory
        const relDirFromRoot = path.relative(absoluteRoot, dirKey).replace(/\\/g, '/');

        // Check if this rule set applies to the given path
        if (relDirFromRoot && !relativePosixPath.startsWith(relDirFromRoot + '/') && relativePosixPath !== relDirFromRoot) {
          continue;
        }

        const rules = rulesMap.get(dirKey);
        // For nested rules, adjust the path to be relative to the rule's directory
        let adjustedPath = relativePosixPath;
        if (relDirFromRoot) {
          adjustedPath = relativePosixPath.slice(relDirFromRoot.length + 1);
        }

        if (adjustedPath && globIsIgnored(adjustedPath, rules, isDirectory)) {
          ignored = true;
        }
      }

      return ignored;
    };
  }

  // Legacy mode: only root-level ignore files (backward compatible)
  /** @type {Array<{reg: RegExp, negated: boolean}>} */
  const rules = [];

  for (const file of fileNames) {
    const filePath = path.join(rootDir, file);
    const entries = parseIgnoreFile(filePath);
    for (const { pattern, negated } of entries) {
      const regStr = globToRegExpStr(pattern);
      try {
        const reg = new RegExp(`(^|/)${regStr}(/|$)`);
        rules.push({ reg, negated });
      } catch (_) { /* skip invalid patterns */ }
    }
  }

  if (rules.length === 0) return () => false;

  return function isIgnoredLegacy(relativePosixPath) {
    let ignored = false;
    for (const { reg, negated } of rules) {
      if (reg.test(relativePosixPath)) {
        ignored = !negated;
      }
    }
    return ignored;
  };
}

module.exports = { buildIgnoreMatcher, parseIgnoreFile, globToRegExpStr, discoverNestedIgnoreFiles };
