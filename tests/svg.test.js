'use strict';

const path = require('path');
const { scan } = require('../src/core/scanner.js');
const { toSvg } = require('../src/exporters/svg.js');

const ROOT = path.resolve(__dirname, '..');
let passed = 0, failed = 0;

function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.error(`  ❌ ${msg}`); }
}

console.log('🧪 SVG Exporter Tests\n');

const tree = scan(ROOT, { maxDepth: 2 });
const svg = toSvg(tree);

assert(typeof svg === 'string', 'toSvg returns a string');
assert(svg.includes('<?xml'), 'Contains XML declaration');
assert(svg.includes('<svg'), 'Contains SVG element');
assert(svg.includes('project-tree-md'), 'Contains project name');
assert(svg.includes('📁'), 'Contains folder icon');
assert(svg.includes('📄'), 'Contains file icon');

// With stats
const { computeStats } = require('../src/core/stats.js');
const stats = computeStats(tree);
const svgWithStats = toSvg(tree, stats);
assert(svgWithStats.includes('director'), 'SVG with stats contains stats text');

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
