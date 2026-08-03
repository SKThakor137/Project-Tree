'use strict';

const path = require('path');
const { scan } = require('../src/core/scanner.js');
const { toMindmapHtml } = require('../src/exporters/mindmap.js');

const ROOT = path.resolve(__dirname, '..');
let passed = 0, failed = 0;

function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.error(`  ❌ ${msg}`); }
}

console.log('🧪 Mind Map HTML Exporter Tests\n');

const tree = scan(ROOT, { maxDepth: 2 });
const html = toMindmapHtml(tree);

assert(typeof html === 'string', 'toMindmapHtml returns a string');
assert(html.includes('<!DOCTYPE html>'), 'Contains DOCTYPE');
assert(html.includes('PROJECT_DATA'), 'Contains PROJECT_DATA JSON embedding');
assert(html.includes('<svg id="svg-layer">'), 'Contains SVG Bezier connector layer');
assert(html.includes('computeTreeLayout'), 'Contains horizontal mind map layout engine');
assert(html.includes('Export SVG'), 'Contains Export SVG button');
assert(html.includes('Cubic Bezier Connector Math') || html.includes('connector-path'), 'Contains connector paths logic');

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
