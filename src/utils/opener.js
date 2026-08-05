'use strict';

/**
 * Cross-platform utility to open a file in the user's default browser.
 * Zero dependencies — uses only Node.js built-in `child_process`.
 *
 * Supports: Windows, macOS, Linux (xdg-open).
 */

const { spawn } = require('child_process');
const path = require('path');

/**
 * Open a file (typically an HTML report) in the user's default browser.
 *
 * - Resolves the path to an absolute path before opening.
 * - Non-blocking: spawns a detached child process and unrefs it.
 * - Silently fails if no browser or desktop environment is available.
 * - Only attempts to open in TTY environments (skips CI/CD).
 *
 * @param {string} filePath - Path to the file to open (can be relative or absolute).
 * @param {Object} [options]
 * @param {boolean} [options.forceTTY=false] - Force open even in non-TTY environments.
 * @returns {boolean} true if the open command was dispatched, false otherwise.
 */
function openInBrowser(filePath, options = {}) {
  const { forceTTY = false } = options;

  // Skip in non-TTY environments (CI/CD, piped output) unless forced
  if (!forceTTY && !process.stdout.isTTY) {
    return false;
  }

  try {
    const absPath = path.resolve(filePath);
    let cmd, args;

    switch (process.platform) {
      case 'win32':
        // Windows: use 'start' command via cmd.exe
        // The empty "" is the title argument for 'start'
        cmd = 'cmd.exe';
        args = ['/c', 'start', '""', absPath];
        break;

      case 'darwin':
        // macOS: use 'open' command
        cmd = 'open';
        args = [absPath];
        break;

      default:
        // Linux / Other: use 'xdg-open'
        cmd = 'xdg-open';
        args = [absPath];
        break;
    }

    const child = spawn(cmd, args, {
      detached: true,
      stdio: 'ignore',
      // Don't throw if the command fails (e.g., no desktop env)
      windowsHide: true,
    });

    // Prevent the child process from keeping the parent alive
    child.unref();

    // Handle spawn errors silently
    child.on('error', () => {});

    return true;
  } catch (_) {
    // Silently fail — browser opening is a convenience, not critical
    return false;
  }
}

module.exports = { openInBrowser };
