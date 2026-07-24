'use strict';

const path = require('path');
const fs = require('fs');
const { compare, collectPaths } = require('../src/features/compare.js');
const { scan } = require('../src/core/scanner.js');

const ROOT = path.resolve(__dirname, '..');
let passed = 0, failed = 0;

function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.error(`  ❌ ${msg}`); }
}

console.log('🧪 Compare Tests\n');

// Test 1: collectPaths
const tree = scan(ROOT, { maxDepth: 1 });
const paths = collectPaths(tree);
assert(paths.size > 0, 'collectPaths returns non-empty set');
assert(paths.has('project-tree-md') || paths.has('app'), 'Root path is included');

// Test 2: Compare same directory with itself
const result = compare(ROOT, ROOT, { maxDepth: 1 });
assert(result.added.length === 0, 'Same dir comparison: no additions');
assert(result.removed.length === 0, 'Same dir comparison: no removals');
assert(result.summary.includes('No differences'), 'Summary says no differences');

// Test 3: Compare with nonexistent throws
let threw = false;
try { compare(ROOT, '/nonexistent/path/xyz'); } catch (_) { threw = true; }
assert(threw, 'Comparing with nonexistent path throws');

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
