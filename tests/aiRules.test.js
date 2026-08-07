'use strict';

const path = require('path');
const { generateAiRules } = require('../src/features/aiRules.js');

console.log('🧪 Testing AI Rules Generator...');

const rootDir = path.join(__dirname, '..');
const rulesText = generateAiRules(rootDir);

if (typeof rulesText !== 'string' || rulesText.length === 0) {
  console.error('❌ generateAiRules returned empty content');
  process.exit(1);
}

if (!rulesText.includes('# AI Agent Coding Guidelines') || !rulesText.includes('project-tree-md')) {
  console.error('❌ generateAiRules output missing expected header tags');
  process.exit(1);
}

console.log('  ✅ generateAiRules generated valid guidelines text');
console.log('✨ AI Rules Generator tests passed!\n');
