'use strict';

/**
 * ANSI color helpers + terminal spinner.
 * Zero dependencies — uses raw escape codes only.
 */

const ESC = '\x1b[';
const RESET = '\x1b[0m';

const isColorEnabled = () => !!(process.stdout.isTTY) && !process.env.NO_COLOR;

const code = (n) => `${ESC}${n}m`;

const CODES = {
  reset: RESET,
  bold: code(1), dim: code(2),
  red: code(31), green: code(32), yellow: code(33),
  blue: code(34), magenta: code(35), cyan: code(36),
  white: code(37), gray: code(90),
  brightRed: code(91), brightGreen: code(92), brightYellow: code(93),
  brightBlue: code(94), brightCyan: code(96), brightWhite: code(97),
};

/** Wrap text with ANSI code (no-op if colors disabled). */
const wrap = (colorCode, text) =>
  isColorEnabled() ? `${colorCode}${text}${RESET}` : text;

const colors = {
  c: CODES,
  isColorEnabled,
  reset:        (t) => wrap(CODES.reset, t),
  bold:         (t) => wrap(CODES.bold, t),
  dim:          (t) => wrap(CODES.dim, t),
  red:          (t) => wrap(CODES.red, t),
  green:        (t) => wrap(CODES.green, t),
  yellow:       (t) => wrap(CODES.yellow, t),
  blue:         (t) => wrap(CODES.blue, t),
  magenta:      (t) => wrap(CODES.magenta, t),
  cyan:         (t) => wrap(CODES.cyan, t),
  white:        (t) => wrap(CODES.white, t),
  gray:         (t) => wrap(CODES.gray, t),
  brightGreen:  (t) => wrap(CODES.brightGreen, t),
  brightBlue:   (t) => wrap(CODES.brightBlue, t),
  brightCyan:   (t) => wrap(CODES.brightCyan, t),
  boldBlue:     (t) => isColorEnabled() ? `${CODES.bold}${CODES.blue}${t}${RESET}` : t,
  boldGreen:    (t) => isColorEnabled() ? `${CODES.bold}${CODES.green}${t}${RESET}` : t,
  boldCyan:     (t) => isColorEnabled() ? `${CODES.bold}${CODES.cyan}${t}${RESET}` : t,

  // Semantic helpers
  success: (t) => isColorEnabled() ? `${CODES.green}✅ ${t}${RESET}` : `✅ ${t}`,
  error:   (t) => isColorEnabled() ? `${CODES.red}❌ ${t}${RESET}` : `❌ ${t}`,
  warn:    (t) => isColorEnabled() ? `${CODES.yellow}⚠️  ${t}${RESET}` : `⚠️  ${t}`,
  info:    (t) => isColorEnabled() ? `${CODES.cyan}ℹ️  ${t}${RESET}` : `ℹ️  ${t}`,

  /**
   * Print a divider line.
   * @param {number} [len]
   */
  divider(len = 52) {
    console.log(isColorEnabled()
      ? `${CODES.gray}${'─'.repeat(len)}${RESET}`
      : '─'.repeat(len));
  },

  /** Terminal spinner (TTY only). */
  spinner: {
    _frames: ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'],
    _idx: 0,
    _iv: null,
    start(text = 'Scanning...') {
      if (!isColorEnabled()) return;
      this._idx = 0;
      this._iv = setInterval(() => {
        const f = this._frames[this._idx++ % this._frames.length];
        process.stdout.write(`\r${CODES.cyan}${f}${RESET} ${text}   `);
      }, 80);
    },
    stop(successLine = '') {
      if (!isColorEnabled()) { if (successLine) console.log(successLine); return; }
      clearInterval(this._iv);
      this._iv = null;
      process.stdout.write(`\r${' '.repeat(60)}\r`);
      if (successLine) console.log(successLine);
    },
  },
};

module.exports = colors;
