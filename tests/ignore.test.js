'use strict';

const { globToRegExpStr, buildIgnoreMatcher } = require('../src/utils/ignore.js');

let passed = 0, failed = 0;

function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.error(`  ❌ ${msg}`); }
}

console.log('🧪 Ignore Parser Tests\n');

// Test glob conversion
const r1 = globToRegExpStr('*.js');
assert(r1 === '[^/]*\\.js', `globToRegExpStr("*.js") = "${r1}"`);

const r2 = globToRegExpStr('**/*.test.js');
assert(r2 === '.*/[^/]*\\.test\\.js', `globToRegExpStr("**/*.test.js") = "${r2}"`);

const r3 = globToRegExpStr('node_modules');
assert(r3 === 'node_modules', `globToRegExpStr("node_modules") = "${r3}"`);

// Test noIgnore
const noop = buildIgnoreMatcher('.', ['.gitignore'], true);
assert(noop('anything/here') === false, 'noIgnore returns false for everything');

// Test with nonexistent ignore file
const empty = buildIgnoreMatcher('.', ['nonexistent_file_xyz']);
assert(empty('anything') === false, 'Missing ignore file returns no-op matcher');

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
