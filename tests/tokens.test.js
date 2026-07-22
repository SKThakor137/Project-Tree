'use strict';

const assert = require('assert');
const { estimateTokens, calculateCost, formatTokenSummary } = require('../src/features/tokens.js');

console.log('🧪 Token Estimator Tests\n');

// 1. Empty or non-string input
assert.strictEqual(estimateTokens(''), 0);
assert.strictEqual(estimateTokens(null), 0);
assert.strictEqual(estimateTokens(undefined), 0);
console.log('  ✅ Handles empty/invalid input');

// 2. Simple text token estimation
const text = 'Hello world! This is a simple test string for token counting.';
const tokens = estimateTokens(text);
assert.ok(tokens > 5 && tokens < 25, `Expected tokens between 5 and 25, got ${tokens}`);
console.log(`  ✅ Text token estimation works (tokens: ${tokens})`);

// 3. Tree formatted code text
const treeText = `project-tree-md
├── src
│   ├── core
│   │   ├── formatter.js
│   │   ├── generator.js
│   │   ├── scanner.js
│   │   └── stats.js`;
const treeTokens = estimateTokens(treeText);
assert.ok(treeTokens > 10, `Expected tree tokens > 10, got ${treeTokens}`);
console.log(`  ✅ Tree structure token estimation works (tokens: ${treeTokens})`);

// 4. Cost calculation
const cost = calculateCost(1000000, 2.50);
assert.strictEqual(cost, 2.50);
const smallCost = calculateCost(1000, 2.50);
assert.strictEqual(smallCost, 0.0025);
console.log('  ✅ Cost calculation works');

// 5. Format token summary
const summary = formatTokenSummary(1250, 'GPT-4o');
assert.ok(summary.includes('1,250 tokens'));
assert.ok(summary.includes('GPT-4o'));
assert.ok(summary.includes('~$0.0031 cost'));
console.log('  ✅ Summary string formatting works');

console.log('\nAll token tests passed!');
