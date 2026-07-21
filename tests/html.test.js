'use strict';

const path = require('path');
const { scan } = require('../src/core/scanner.js');
const { toHtml } = require('../src/exporters/html.js');

const ROOT = path.resolve(__dirname, '..');
let passed = 0, failed = 0;

function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.error(`  ❌ ${msg}`); }
}

console.log('🧪 HTML Exporter Tests\n');

const tree = scan(ROOT, { maxDepth: 2 });
const html = toHtml(tree);

assert(typeof html === 'string', 'toHtml returns a string');
assert(html.includes('<!DOCTYPE html>'), 'Contains DOCTYPE');
assert(html.includes('<details'), 'Contains collapsible details elements');
assert(html.includes('<summary>'), 'Contains summary elements');
assert(html.includes('📁'), 'Contains folder icon');
assert(html.includes('project-tree-md'), 'Contains project name');
assert(html.includes('<style>'), 'Contains embedded styles');

// With stats
const { computeStats } = require('../src/core/stats.js');
const stats = computeStats(tree);
const htmlWithStats = toHtml(tree, stats);
assert(htmlWithStats.includes('class="stats"'), 'Stats section is present');

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
