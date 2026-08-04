'use strict';

const path = require('path');
const { scan } = require('../src/core/scanner.js');
const { buildTreeText, buildColoredTreeText, THEMES } = require('../src/core/formatter.js');

const ROOT = path.resolve(__dirname, '..');
let passed = 0, failed = 0;

function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.error(`  ❌ ${msg}`); }
}

console.log('🧪 Formatter Tests\n');

const tree = scan(ROOT, { maxDepth: 2 });

// Test 1: Plain text tree
const plain = buildTreeText(tree);
assert(typeof plain === 'string', 'buildTreeText returns a string');
assert(plain.includes('project-tree-md') || plain.includes('app'), 'Plain tree contains root name');
assert(plain.includes('├──') || plain.includes('└──'), 'Plain tree contains connectors');

// Test 2: Colored tree
const colored = buildColoredTreeText(tree);
assert(typeof colored === 'string', 'buildColoredTreeText returns a string');
assert(colored.includes('\x1b['), 'Colored tree contains ANSI codes');

// Test 3: ASCII theme
const ascii = buildTreeText(tree, { theme: 'ascii' });
assert(ascii.includes('+--') || ascii.includes('\\--'), 'ASCII theme uses + and \\ connectors');

// Test 4: Emoji theme
const emoji = buildTreeText(tree, { theme: 'emoji' });
assert(emoji.includes('📁') || emoji.includes('📄'), 'Emoji theme uses icons');

// Test 5: Details mode
const treeWithSize = scan(ROOT, { maxDepth: 1 });
const detailed = buildTreeText(treeWithSize, { details: true });
assert(typeof detailed === 'string', 'Details mode returns a string');

// Test 6: All themes exist
assert(THEMES.unicode !== undefined, 'Unicode theme exists');
assert(THEMES.ascii !== undefined, 'ASCII theme exists');
assert(THEMES.emoji !== undefined, 'Emoji theme exists');
assert(THEMES.box !== undefined, 'Box theme exists');
assert(THEMES.compact !== undefined, 'Compact theme exists');

// Test 7: Theme-based output file naming
const { generateTree } = require('../src/core/generator.js');
const resAscii = generateTree({ rootDir: ROOT, theme: 'ascii', writeFile: false });
assert(resAscii.outputPath.endsWith('PROJECT_STRUCTURE_ascii.md'), 'ASCII theme generates PROJECT_STRUCTURE_ascii.md by default');
const resBox = generateTree({ rootDir: ROOT, theme: 'box', writeFile: false });
assert(resBox.outputPath.endsWith('PROJECT_STRUCTURE_box.md'), 'Box theme generates PROJECT_STRUCTURE_box.md by default');

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
