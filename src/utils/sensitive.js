'use strict';

/** Patterns that identify sensitive files. */
const SENSITIVE_PATTERNS = [
  /^\.env$/,
  /^\.env\..+/,
  /^secret\..+/i,
  /^private\..+/i,
  /^credentials\..+/i,
  /^\.secrets?$/,
  /^auth\.json$/i,
  /^service[-_]account.*\.json$/i,
  /^\.htpasswd$/,
  /^id_rsa$/, /^id_ed25519$/, /^id_ecdsa$/,
];

/**
 * Check if a filename is sensitive.
 * @param {string} name
 * @returns {boolean}
 */
function isSensitive(name) {
  return SENSITIVE_PATTERNS.some((p) => p.test(name));
}

/**
 * Return a masked display name for a sensitive file.
 * @param {string} name
 * @param {boolean} [color]
 * @returns {string}
 */
function maskName(name, color = false) {
  return color ? `\x1b[33m${name} (hidden)\x1b[0m` : `${name} (hidden)`;
}

module.exports = { isSensitive, maskName, SENSITIVE_PATTERNS };
