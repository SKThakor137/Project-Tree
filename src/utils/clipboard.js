'use strict';

const { spawnSync } = require('child_process');

/**
 * Copy text to the system clipboard using native OS commands.
 * @param {string} text
 * @returns {boolean} true if successful
 */
function copyToClipboard(text) {
  try {
    if (process.platform === 'win32') {
      const r = spawnSync('clip', { input: text, encoding: 'utf8' });
      return r.status === 0;
    } else if (process.platform === 'darwin') {
      const r = spawnSync('pbcopy', { input: text, encoding: 'utf8' });
      return r.status === 0;
    } else {
      // Linux: try wl-copy (Wayland) first, then xclip, then xsel
      const wlCopy = spawnSync('wl-copy', { input: text, encoding: 'utf8' });
      if (wlCopy.status === 0) return true;
      const xclip = spawnSync('xclip', ['-selection', 'clipboard'], { input: text, encoding: 'utf8' });
      if (xclip.status === 0) return true;
      const xsel = spawnSync('xsel', ['--clipboard', '--input'], { input: text, encoding: 'utf8' });
      if (xsel.status === 0) return true;
    }
  } catch (_) { /* silently fail */ }
  return false;
}

module.exports = { copyToClipboard };
