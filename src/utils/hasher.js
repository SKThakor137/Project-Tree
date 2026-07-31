'use strict';

/**
 * File hashing utility — compute md5, sha1, sha256 using Node's crypto.
 *
 * Uses streaming for files > 64 KB to avoid memory spikes.
 * Zero dependencies.
 */

const crypto = require('crypto');
const fs = require('fs');

/** Threshold for switching to streaming (64 KB). */
const STREAM_THRESHOLD = 64 * 1024;

/**
 * Compute a hash of a file synchronously.
 *
 * @param {string} filePath — absolute path to file
 * @param {string} [algorithm='sha256'] — 'md5', 'sha1', or 'sha256'
 * @param {number} [maxSize=Infinity] — skip files larger than this
 * @returns {string|null} hex digest, or null if file is too large / unreadable
 */
function hashFileSync(filePath, algorithm = 'sha256', maxSize = Infinity) {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size > maxSize || stat.size === 0) return null;

    const hash = crypto.createHash(algorithm);

    if (stat.size <= STREAM_THRESHOLD) {
      // Small file — read all at once
      const data = fs.readFileSync(filePath);
      hash.update(data);
    } else {
      // Larger file — read in chunks
      const fd = fs.openSync(filePath, 'r');
      const buf = Buffer.alloc(16384);
      let bytesRead;
      while ((bytesRead = fs.readSync(fd, buf, 0, buf.length, null)) > 0) {
        hash.update(buf.slice(0, bytesRead));
      }
      fs.closeSync(fd);
    }

    return hash.digest('hex');
  } catch (_) {
    return null;
  }
}

/**
 * Compute a hash of a string or Buffer.
 *
 * @param {string|Buffer} data
 * @param {string} [algorithm='sha256']
 * @returns {string} hex digest
 */
function hashData(data, algorithm = 'sha256') {
  return crypto.createHash(algorithm).update(data).digest('hex');
}

/**
 * Compute a short hash (first 8 hex chars) for display purposes.
 *
 * @param {string} filePath
 * @param {string} [algorithm='sha256']
 * @returns {string|null}
 */
function shortHash(filePath, algorithm = 'sha256') {
  const full = hashFileSync(filePath, algorithm);
  return full ? full.slice(0, 8) : null;
}

/** Valid hash algorithms. */
const HASH_ALGORITHMS = ['md5', 'sha1', 'sha256'];

module.exports = { hashFileSync, hashData, shortHash, HASH_ALGORITHMS };
