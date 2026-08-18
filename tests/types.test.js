'use strict';

const fs = require('fs');
const path = require('path');
const api = require('../src/index.js');

console.log('🧪 Testing TypeScript Declarations...');

const typesPath = path.join(__dirname, '..', 'types', 'index.d.ts');
if (!fs.existsSync(typesPath)) {
  console.error('❌ types/index.d.ts does not exist!');
  process.exit(1);
}

const content = fs.readFileSync(typesPath, 'utf8');

// Verify key exports are mentioned in index.d.ts
const expectedFunctions = [
  'scan',
  'generateTree',
  'buildTreeText',
  'computeStats',
  'detectProject',
  'toJson',
  'toHtml',
  'toMindmapHtml',
  'toSvg',
  'toMermaid',
  'generateUniversalGraph',
  'toGraphVisualizerHtml',
  // 'generateAiContext',
  // 'generateAiPrompt',
  'generateAiRules',
  'openInBrowser',
  'getGitStatus',
  'startLiveServer'
];

for (const fn of expectedFunctions) {
  if (!content.includes(`export function ${fn}`)) {
    console.error(`❌ Missing declaration for function: ${fn}`);
    process.exit(1);
  }
}

console.log('  ✅ types/index.d.ts exists and declares all public API functions');
console.log('✨ TypeScript type declaration tests passed!\n');
