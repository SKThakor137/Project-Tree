'use strict';

const path = require('path');
const { getGitStatus, filterTreeByChanged } = require('../src/utils/git.js');
const { scan } = require('../src/core/scanner.js');
const { buildTreeText } = require('../src/core/formatter.js');

console.log('🧪 Testing Git Integration & Status...');

const rootDir = path.join(__dirname, '..');

// Test 1: getGitStatus returns an object
const statusMap = getGitStatus(rootDir);
if (typeof statusMap !== 'object' || statusMap === null) {
  console.error('❌ getGitStatus failed to return an object');
  process.exit(1);
}
console.log('  ✅ getGitStatus executed cleanly');

// Test 2: scan with gitStatus option
const treeWithStatus = scan(rootDir, { gitStatus: true });
if (!treeWithStatus || !treeWithStatus.children) {
  console.error('❌ scan with gitStatus failed');
  process.exit(1);
}

const formattedText = buildTreeText(treeWithStatus);
if (typeof formattedText !== 'string' || formattedText.length === 0) {
  console.error('❌ buildTreeText failed for gitStatus tree');
  process.exit(1);
}
console.log('  ✅ scan with gitStatus: true succeeded');

// Test 3: filterTreeByChanged mock test
const mockNode = {
  name: 'root',
  path: rootDir,
  children: [
    { name: 'fileA.js', path: path.join(rootDir, 'fileA.js') },
    { name: 'fileB.js', path: path.join(rootDir, 'fileB.js') }
  ]
};

const mockStatusMap = { 'fileA.js': 'M' };
const filtered = filterTreeByChanged(mockNode, mockStatusMap, rootDir);

if (!filtered || !filtered.children || filtered.children.length !== 1 || filtered.children[0].name !== 'fileA.js') {
  console.error('❌ filterTreeByChanged failed to isolate changed files');
  process.exit(1);
}
console.log('  ✅ filterTreeByChanged correctly filters unchanged files');

console.log('✨ Git Integration tests passed!\n');
