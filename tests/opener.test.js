'use strict';

const assert = require('assert');
const { openInBrowser } = require('../src/utils/opener.js');
const { loadConfig, DEFAULTS } = require('../src/core/configLoader.js');
const pkg = require('../src/index.js');

console.log('🧪 Testing Opener Utility & v3.2 Config Defaults...\n');

// 1. Check DEFAULTS in configLoader
{
  assert.strictEqual(DEFAULTS.silent, true, 'Default silent should be true');
  assert.strictEqual(DEFAULTS.openHtml, true, 'Default openHtml should be true');
  console.log('  ✅ DEFAULTS.silent and DEFAULTS.openHtml are true');
}

// 2. Check loadConfig output
{
  const { config } = loadConfig(__dirname);
  assert.strictEqual(config.silent, true, 'Loaded config silent should be true');
  assert.strictEqual(config.openHtml, true, 'Loaded config openHtml should be true');
  console.log('  ✅ loadConfig returns silent: true and openHtml: true');
}

// 3. Test openInBrowser exported via package index
{
  assert.strictEqual(typeof pkg.openInBrowser, 'function', 'openInBrowser should be exported');
  console.log('  ✅ openInBrowser is exported from index.js');
}

// 4. Test openInBrowser non-TTY fallback
{
  // In non-TTY environment, openInBrowser returns false unless forced
  const res = openInBrowser(__filename);
  assert.strictEqual(typeof res, 'boolean');
  console.log(`  ✅ openInBrowser returned boolean (${res}) without throwing`);
}

console.log('\nAll opener & v3.2 config tests passed successfully!\n');
