'use strict';

const { spawnSync } = require('child_process');

/**
 * Copy text to the system clipboard using native OS commands.
 * Supports UTF-8 emojis and box-drawing characters without corruption.
 * @param {string} text
 * @returns {boolean} true if successful
 */
function copyToClipboard(text) {
  try {
    if (process.platform === 'win32') {
      // Use PowerShell Set-Clipboard with UTF-8 input encoding to preserve Emojis & Tree symbols
      const psScript = '[Console]::InputEncoding = [System.Text.Encoding]::UTF8; $stdin = [Console]::In.ReadToEnd(); Set-Clipboard -Value $stdin';
      const r = spawnSync('powershell', ['-NoProfile', '-Command', psScript], {
        input: text,
        encoding: 'utf8',
        windowsHide: true,
      });
      if (r.status === 0) return true;

      // Fallback to legacy clip if PowerShell is unavailable
      const rClip = spawnSync('clip', { input: text, encoding: 'utf8' });
      return rClip.status === 0;
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
