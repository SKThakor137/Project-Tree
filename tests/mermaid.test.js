'use strict';

const path = require('path');
const { scan } = require('../src/core/scanner.js');
const { toMermaid } = require('../src/exporters/mermaid.js');

const ROOT = path.resolve(__dirname, '..');
let passed = 0, failed = 0;

function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.error(`  ❌ ${msg}`); }
}

console.log('🧪 Mermaid Exporter Tests\n');

const tree = scan(ROOT, { maxDepth: 2 });
const mermaid = toMermaid(tree);

assert(typeof mermaid === 'string', 'toMermaid returns a string');
assert(mermaid.startsWith('graph TD'), 'Starts with "graph TD"');
assert(mermaid.includes('📁'), 'Contains folder icon');
assert(mermaid.includes('📄'), 'Contains file icon');
assert(mermaid.includes('-->'), 'Contains arrow connections');

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
