'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Watch a directory for changes and invoke a callback on each change.
 * Uses fs.watch with debouncing. Ctrl+C stops the watcher.
 *
 * @param {string}   rootDir
 * @param {Function} onChange - called with no arguments on each debounced change
 * @param {Object}   [opts]
 * @param {number}   [opts.debounceMs=500]
 */
function watchDirectory(rootDir, onChange, opts = {}) {
  const { debounceMs = 500 } = opts;
  const absRoot = path.resolve(rootDir);

  let timer = null;
  const watchers = [];

  function debounced() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      onChange();
    }, debounceMs);
  }

  // Recursive watch (Node >= 15 supports { recursive: true })
  try {
    const w = fs.watch(absRoot, { recursive: true }, debounced);
    watchers.push(w);
  } catch (_) {
    // Fallback for platforms without recursive watch
    const w = fs.watch(absRoot, debounced);
    watchers.push(w);
  }

  const colors = require('../utils/colors.js');
  console.log(colors.info(`Watching ${absRoot} for changes... (Ctrl+C to stop)`));

  function cleanup() {
    watchers.forEach(w => { try { w.close(); } catch (_) {} });
    console.log(colors.success('Watcher stopped.'));
    process.exit(0);
  }

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

module.exports = { watchDirectory };
