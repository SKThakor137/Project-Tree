'use strict';

/**
 * Plugin API — extensible rendering, scanning, and formatting hooks.
 *
 * Allows registration of:
 *   - Custom renderers (output formats)
 *   - Scanner hooks (pre/post scan)
 *   - Custom formatters (tree display)
 *
 * Zero dependencies.
 */

/**
 * @typedef {Object} Plugin
 * @property {string}    name
 * @property {string}    [version]
 * @property {Function}  [init] — called when plugin is loaded
 * @property {Object}    [renderers] — { name: renderFunction }
 * @property {Object}    [scannerHooks] — { pre: fn, post: fn }
 * @property {Object}    [formatters] — { name: formatFunction }
 */

/** Plugin registry singleton. */
const registry = {
  /** @type {Map<string, Function>} */
  renderers: new Map(),
  /** @type {Array<{ phase: string, fn: Function }>} */
  scannerHooks: [],
  /** @type {Map<string, Function>} */
  formatters: new Map(),
  /** @type {Map<string, Plugin>} */
  plugins: new Map(),
};

/**
 * Register a custom renderer (output format).
 *
 * @param {string} name — format name (e.g. 'dot', 'asciidoc')
 * @param {Function} renderFn — (tree, stats, options) => string
 */
function registerRenderer(name, renderFn) {
  if (typeof name !== 'string' || !name) {
    throw new Error('Renderer name must be a non-empty string');
  }
  if (typeof renderFn !== 'function') {
    throw new Error('Renderer must be a function');
  }
  registry.renderers.set(name, renderFn);
}

/**
 * Register a scanner hook.
 *
 * @param {'pre'|'post'} phase — when to run the hook
 * @param {Function} fn — hook function
 *   - pre:  (rootDir, options) => options (can modify scan options)
 *   - post: (tree, options) => tree (can modify the scanned tree)
 */
function registerScannerHook(phase, fn) {
  if (phase !== 'pre' && phase !== 'post') {
    throw new Error('Scanner hook phase must be "pre" or "post"');
  }
  if (typeof fn !== 'function') {
    throw new Error('Scanner hook must be a function');
  }
  registry.scannerHooks.push({ phase, fn });
}

/**
 * Register a custom formatter.
 *
 * @param {string} name — formatter name
 * @param {Function} formatFn — (node, options, prefix, isLast, isRoot) => string
 */
function registerFormatter(name, formatFn) {
  if (typeof name !== 'string' || !name) {
    throw new Error('Formatter name must be a non-empty string');
  }
  if (typeof formatFn !== 'function') {
    throw new Error('Formatter must be a function');
  }
  registry.formatters.set(name, formatFn);
}

/**
 * Load a plugin object into the registry.
 *
 * @param {Plugin} plugin
 */
function loadPlugin(plugin) {
  if (!plugin || typeof plugin !== 'object') {
    throw new Error('Plugin must be an object');
  }
  if (!plugin.name) {
    throw new Error('Plugin must have a name');
  }

  // Initialize
  if (typeof plugin.init === 'function') {
    plugin.init();
  }

  // Register renderers
  if (plugin.renderers) {
    for (const [name, fn] of Object.entries(plugin.renderers)) {
      registerRenderer(name, fn);
    }
  }

  // Register scanner hooks
  if (plugin.scannerHooks) {
    if (typeof plugin.scannerHooks.pre === 'function') {
      registerScannerHook('pre', plugin.scannerHooks.pre);
    }
    if (typeof plugin.scannerHooks.post === 'function') {
      registerScannerHook('post', plugin.scannerHooks.post);
    }
  }

  // Register formatters
  if (plugin.formatters) {
    for (const [name, fn] of Object.entries(plugin.formatters)) {
      registerFormatter(name, fn);
    }
  }

  registry.plugins.set(plugin.name, plugin);
}

/**
 * Load plugins from a config object (e.g. from project-tree.config.json).
 *
 * @param {Array<string|Object>} pluginList — array of plugin paths or objects
 * @param {string} rootDir — project root for resolving relative paths
 */
function loadPluginsFromConfig(pluginList, rootDir) {
  if (!Array.isArray(pluginList)) return;

  const path = require('path');

  for (const entry of pluginList) {
    try {
      if (typeof entry === 'string') {
        // Path to a plugin file
        const resolved = path.resolve(rootDir, entry);
        const mod = require(resolved);
        const plugin = typeof mod === 'function' ? mod() : mod;
        loadPlugin(plugin);
      } else if (typeof entry === 'object') {
        loadPlugin(entry);
      }
    } catch (err) {
      console.warn(`Failed to load plugin: ${err.message}`);
    }
  }
}

/**
 * Get a registered renderer by name.
 *
 * @param {string} name
 * @returns {Function|null}
 */
function getRenderer(name) {
  return registry.renderers.get(name) || null;
}

/**
 * Get a registered formatter by name.
 *
 * @param {string} name
 * @returns {Function|null}
 */
function getFormatter(name) {
  return registry.formatters.get(name) || null;
}

/**
 * Run all pre-scan hooks.
 *
 * @param {string} rootDir
 * @param {Object} options
 * @returns {Object} — possibly modified options
 */
function runPreScanHooks(rootDir, options) {
  let opts = { ...options };
  for (const hook of registry.scannerHooks) {
    if (hook.phase === 'pre') {
      const result = hook.fn(rootDir, opts);
      if (result && typeof result === 'object') opts = result;
    }
  }
  return opts;
}

/**
 * Run all post-scan hooks.
 *
 * @param {Object} tree — scanned tree
 * @param {Object} options
 * @returns {Object} — possibly modified tree
 */
function runPostScanHooks(tree, options) {
  let result = tree;
  for (const hook of registry.scannerHooks) {
    if (hook.phase === 'post') {
      const modified = hook.fn(result, options);
      if (modified) result = modified;
    }
  }
  return result;
}

/**
 * List all registered plugins.
 * @returns {string[]}
 */
function listPlugins() {
  return Array.from(registry.plugins.keys());
}

/**
 * List all registered renderers.
 * @returns {string[]}
 */
function listRenderers() {
  return Array.from(registry.renderers.keys());
}

/**
 * List all registered formatters.
 * @returns {string[]}
 */
function listFormatters() {
  return Array.from(registry.formatters.keys());
}

/**
 * Reset the registry (useful for testing).
 */
function resetRegistry() {
  registry.renderers.clear();
  registry.scannerHooks.length = 0;
  registry.formatters.clear();
  registry.plugins.clear();
}

module.exports = {
  registerRenderer,
  registerScannerHook,
  registerFormatter,
  loadPlugin,
  loadPluginsFromConfig,
  getRenderer,
  getFormatter,
  runPreScanHooks,
  runPostScanHooks,
  listPlugins,
  listRenderers,
  listFormatters,
  resetRegistry,
};
