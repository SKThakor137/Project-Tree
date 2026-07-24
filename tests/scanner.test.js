'use strict';

const path = require('path');
const { scan, isBinaryFile, parseSize } = require('../src/core/scanner.js');

const ROOT = path.resolve(__dirname, '..');
let passed = 0, failed = 0;

function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.error(`  ❌ ${msg}`); }
}

console.log('🧪 Scanner Tests\n');

// Test 1: Scan root directory
const tree = scan(ROOT, { maxDepth: 2 });
assert(tree !== null, 'scan() returns a non-null tree');
assert(tree.name === 'project-tree-md' || tree.name === 'app', `Root name is "${tree.name}"`);
assert(Array.isArray(tree.children), 'Root has children array');

// Test 2: Exclusion works
const hasNodeModules = tree.children.some(c => c.name === 'node_modules');
assert(!hasNodeModules, 'node_modules is excluded by default');

const hasGit = tree.children.some(c => c.name === '.git');
assert(!hasGit, '.git is excluded by default');

// Test 3: Binary detection
assert(isBinaryFile('photo.png') === true, '.png is binary');
assert(isBinaryFile('photo.jpg') === true, '.jpg is binary');
assert(isBinaryFile('index.js') === false, '.js is not binary');
assert(isBinaryFile('README.md') === false, '.md is not binary');

// Test 4: parseSize
assert(parseSize('5MB') === 5 * 1024 * 1024, 'parseSize("5MB") works');
assert(parseSize('500KB') === 500 * 1024, 'parseSize("500KB") works');
assert(parseSize(undefined) === Infinity, 'parseSize(undefined) returns Infinity');

// Test 5: Nonexistent directory
const noTree = scan('/this/does/not/exist/at/all');
assert(noTree === null, 'scan() returns null for nonexistent dir');

// Test 6: Depth limiting
const shallowTree = scan(ROOT, { maxDepth: 1 });
assert(shallowTree !== null, 'Shallow scan returns tree');
const srcDir = shallowTree.children.find(c => c.name === 'src');
assert(srcDir !== undefined, 'src/ directory found at depth 1');

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
