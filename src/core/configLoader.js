'use strict';

/**
 * Config file loader for project-tree-md.
 *
 * Searches for configuration in priority order:
 *   1. CLI arguments (highest)
 *   2. project-tree.config.json
 *   3. project-tree.config.js
 *   4. .projecttreerc (JSON)
 *   5. package.json "projectTree" field
 *   6. Environment variables (PTREE_*)
 *   7. Defaults (lowest)
 *
 * Zero dependencies.
 */

const fs = require('fs');
const path = require('path');

/** Default config values. */
const DEFAULTS = {
  theme: 'emoji',
  details: false,
  summarize: false,
  compress: false,
  collapseThreshold: null,
  maxDepth: null,
  exclude: null,
  includeBinary: false,
  showSensitive: false,
  maxSize: null,
  noIgnore: false,
  respectIgnore: true,
  copy: true,
  sort: null,
  sortOrder: 'asc',
  hash: null,
  permissions: false,
  owner: false,
  modified: false,
  created: false,
  duplicates: false,
  icons: null,
  maxFiles: null,
  maxFolders: null,
  bfs: false,
  outputFile: null,
  outputDir: null,
  noWrite: false,

  // v3.2 — Terminal & Browser behavior
  silent: true,
  openHtml: true,
};

/** Valid config keys for schema validation. */
const VALID_KEYS = new Set(Object.keys(DEFAULTS));

/** Additional keys that are valid in config files but not in DEFAULTS. */
const EXTRA_VALID_KEYS = new Set(['plugins', 'ignore', 'customTheme', 'customIcons']);

/**
 * Search for a config file in the given directory.
 *
 * @param {string} rootDir
 * @returns {{ config: Object, source: string } | null}
 */
function findConfigFile(rootDir) {
  const candidates = [
    { file: 'project-tree.config.json', parser: 'json' },
    { file: 'project-tree.config.js',   parser: 'js' },
    { file: '.projecttreerc',           parser: 'json' },
  ];

  for (const { file, parser } of candidates) {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) continue;

    try {
      if (parser === 'json') {
        const content = fs.readFileSync(filePath, 'utf8');
        return { config: JSON.parse(content), source: filePath };
      } else if (parser === 'js') {
        // JS config — require it
        const resolved = path.resolve(filePath);
        const mod = require(resolved);
        const cfg = typeof mod === 'function' ? mod() : mod;
        return { config: cfg, source: filePath };
      }
    } catch (_) {
      // Skip invalid config files
    }
  }

  // Check package.json "projectTree" field
  const pkgPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.projectTree && typeof pkg.projectTree === 'object') {
        return { config: pkg.projectTree, source: pkgPath + '#projectTree' };
      }
    } catch (_) {}
  }

  return null;
}

/**
 * Extract config values from environment variables.
 * Maps PTREE_THEME → theme, PTREE_MAX_DEPTH → maxDepth, etc.
 *
 * @returns {Object}
 */
function loadEnvConfig() {
  const env = {};
  const envMap = {
    PTREE_THEME:       'theme',
    PTREE_DEPTH:       'maxDepth',
    PTREE_EXCLUDE:     'exclude',
    PTREE_SORT:        'sort',
    PTREE_SORT_ORDER:  'sortOrder',
    PTREE_HASH:        'hash',
    PTREE_OUTPUT:      'outputFile',
    PTREE_OUTPUT_DIR:  'outputDir',
    PTREE_MAX_FILES:   'maxFiles',
    PTREE_MAX_FOLDERS: 'maxFolders',
    PTREE_MAX_SIZE:    'maxSize',
  };

  const boolEnvMap = {
    PTREE_DETAILS:     'details',
    PTREE_SUMMARIZE:   'summarize',
    PTREE_COMPRESS:    'compress',
    PTREE_NO_IGNORE:   'noIgnore',
    PTREE_NO_COPY:     'noCopy',
    PTREE_BFS:         'bfs',
    PTREE_PERMISSIONS: 'permissions',
    PTREE_OWNER:       'owner',
    PTREE_MODIFIED:    'modified',
    PTREE_CREATED:     'created',
    PTREE_DUPLICATES:  'duplicates',
    PTREE_NO_WRITE:    'noWrite',
    PTREE_SILENT:      'silent',
    PTREE_OPEN_HTML:   'openHtml',
  };

  for (const [envKey, configKey] of Object.entries(envMap)) {
    const val = process.env[envKey];
    if (val !== undefined) {
      // Auto-parse numbers
      const num = Number(val);
      env[configKey] = !isNaN(num) && val !== '' ? num : val;
    }
  }

  for (const [envKey, configKey] of Object.entries(boolEnvMap)) {
    const val = process.env[envKey];
    if (val !== undefined) {
      env[configKey] = val === '1' || val === 'true' || val === 'yes';
    }
  }

  return env;
}

/**
 * Validate a config object against the known schema.
 *
 * @param {Object} config
 * @returns {{ valid: boolean, warnings: string[] }}
 */
function validateConfig(config) {
  const warnings = [];
  if (!config || typeof config !== 'object') {
    return { valid: false, warnings: ['Config must be an object'] };
  }

  for (const key of Object.keys(config)) {
    if (!VALID_KEYS.has(key) && !EXTRA_VALID_KEYS.has(key)) {
      warnings.push(`Unknown config key: "${key}"`);
    }
  }

  // Type checks
  if (config.theme && typeof config.theme !== 'string') {
    warnings.push('"theme" must be a string');
  }
  if (config.maxDepth !== undefined && config.maxDepth !== null && typeof config.maxDepth !== 'number') {
    warnings.push('"maxDepth" must be a number');
  }
  if (config.sort && !['alpha', 'folders-first', 'files-first', 'extension', 'size', 'modified', 'created', 'natural'].includes(config.sort)) {
    warnings.push(`"sort" must be one of: alpha, folders-first, files-first, extension, size, modified, created, natural`);
  }
  if (config.hash && !['md5', 'sha1', 'sha256'].includes(config.hash)) {
    warnings.push(`"hash" must be one of: md5, sha1, sha256`);
  }
  if (config.sortOrder && !['asc', 'desc'].includes(config.sortOrder)) {
    warnings.push(`"sortOrder" must be "asc" or "desc"`);
  }

  return { valid: true, warnings };
}

/**
 * Load and merge configuration from all sources.
 *
 * Priority: cliArgs > configFile > envVars > defaults
 *
 * @param {string} rootDir
 * @param {Object} [cliArgs] — parsed CLI arguments (highest priority)
 * @returns {{ config: Object, source: string|null, warnings: string[] }}
 */
function loadConfig(rootDir, cliArgs = {}) {
  // Start from defaults
  const merged = { ...DEFAULTS };
  let source = null;
  const warnings = [];

  // Layer 1: Environment variables
  const envConfig = loadEnvConfig();
  for (const [key, val] of Object.entries(envConfig)) {
    if (val !== undefined) merged[key] = val;
  }

  // Layer 2: Config file
  const fileResult = findConfigFile(rootDir);
  if (fileResult) {
    source = fileResult.source;
    const { valid, warnings: fileWarnings } = validateConfig(fileResult.config);
    warnings.push(...fileWarnings);
    if (valid) {
      for (const [key, val] of Object.entries(fileResult.config)) {
        if (val !== undefined) merged[key] = val;
      }
    }
  }

  // Layer 3: CLI args (highest priority, only override if explicitly set)
  for (const [key, val] of Object.entries(cliArgs)) {
    if (val !== undefined && val !== null) {
      merged[key] = val;
    }
  }

  return { config: merged, source, warnings };
}

module.exports = { loadConfig, findConfigFile, loadEnvConfig, validateConfig, DEFAULTS };
