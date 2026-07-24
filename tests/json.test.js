'use strict';

const path = require('path');
const { scan } = require('../src/core/scanner.js');
const { toJson, nodeToJson } = require('../src/exporters/json.js');

const ROOT = path.resolve(__dirname, '..');
let passed = 0, failed = 0;

function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.error(`  ❌ ${msg}`); }
}

console.log('🧪 JSON Exporter Tests\n');

const tree = scan(ROOT, { maxDepth: 2 });

// Test 1: nodeToJson
const obj = nodeToJson(tree);
assert(obj.name === 'project-tree-md' || obj.name === 'app', 'Root name preserved');
assert(obj.type === 'directory', 'Root type is directory');
assert(Array.isArray(obj.children), 'Root has children');

// Test 2: toJson
const jsonStr = toJson(tree);
assert(typeof jsonStr === 'string', 'toJson returns a string');
const parsed = JSON.parse(jsonStr);
assert(parsed.tree !== undefined, 'JSON has tree property');
assert(parsed.generatedAt !== undefined || (parsed.project && parsed.project.generatedAt !== undefined), 'JSON has generatedAt');

// Test 3: with stats
const { computeStats } = require('../src/core/stats.js');
const stats = computeStats(tree);
const jsonWithStats = toJson(tree, stats);
const parsedWithStats = JSON.parse(jsonWithStats);
assert(parsedWithStats.stats !== undefined, 'JSON has stats when provided');
assert(parsedWithStats.stats.dirs >= 0, 'Stats has dirs count');

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
