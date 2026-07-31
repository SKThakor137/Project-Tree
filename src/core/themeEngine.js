'use strict';

/**
 * Custom theme engine — allows user-defined tree character sets.
 *
 * Built-in presets and support for loading custom JSON themes.
 * Zero dependencies.
 */

const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} ThemeCharset
 * @property {string} pipe   — vertical continuation line (│)
 * @property {string} tee    — branch with continuation (├)
 * @property {string} last   — last branch in a group (└)
 * @property {string} dash   — horizontal segment (──)
 * @property {string} indent — whitespace for nested levels
 */

/** Built-in theme presets. */
const PRESETS = {
  unicode:  { pipe: '│', tee: '├', last: '└', dash: '──', indent: '    ' },
  ascii:    { pipe: '|', tee: '+', last: '\\', dash: '--', indent: '    ' },
  box:      { pipe: '┃', tee: '┣', last: '┗', dash: '━━', indent: '    ' },
  emoji:    { pipe: '│', tee: '├', last: '└', dash: '──', indent: '    ' },
  compact:  { pipe: '│', tee: '├', last: '└', dash: '──', indent: '    ' },

  // New presets
  rounded:  { pipe: '│', tee: '├', last: '╰', dash: '──', indent: '    ' },
  double:   { pipe: '║', tee: '╠', last: '╚', dash: '══', indent: '    ' },
  minimal:  { pipe: '·', tee: '·', last: '·', dash: '· ', indent: '  '   },
  classic:  { pipe: '│', tee: '├', last: '└', dash: '─ ', indent: '│   ' },
  dotted:   { pipe: ':', tee: '+', last: '`', dash: '..', indent: '    ' },
  heavy:    { pipe: '┃', tee: '┣', last: '┗', dash: '━━', indent: '┃   ' },
  thin:     { pipe: '╎', tee: '├', last: '╰', dash: '╌╌', indent: '    ' },
};

/** Required keys for a valid theme. */
const REQUIRED_KEYS = ['pipe', 'tee', 'last', 'dash', 'indent'];

/**
 * Validate a theme object.
 *
 * @param {Object} theme
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateTheme(theme) {
  const errors = [];
  if (!theme || typeof theme !== 'object') {
    return { valid: false, errors: ['Theme must be an object'] };
  }
  for (const key of REQUIRED_KEYS) {
    if (typeof theme[key] !== 'string') {
      errors.push(`Missing or invalid key: "${key}" (must be a string)`);
    }
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Load a theme by name (preset) or file path (custom JSON).
 *
 * @param {string} nameOrPath — preset name or path to JSON file
 * @returns {ThemeCharset}
 */
function loadTheme(nameOrPath) {
  if (!nameOrPath) return PRESETS.unicode;

  // Check presets first
  if (PRESETS[nameOrPath]) {
    return PRESETS[nameOrPath];
  }

  // Try as file path
  try {
    const resolvedPath = path.resolve(nameOrPath);
    if (fs.existsSync(resolvedPath)) {
      const content = fs.readFileSync(resolvedPath, 'utf8');
      const custom = JSON.parse(content);
      const { valid, errors } = validateTheme(custom);
      if (!valid) {
        console.warn(`Invalid custom theme: ${errors.join(', ')}. Falling back to unicode.`);
        return PRESETS.unicode;
      }
      return custom;
    }
  } catch (_) {}

  // Fallback
  return PRESETS.unicode;
}

/**
 * Get list of all available preset names.
 * @returns {string[]}
 */
function getPresetNames() {
  return Object.keys(PRESETS);
}

module.exports = { loadTheme, validateTheme, getPresetNames, PRESETS, REQUIRED_KEYS };
