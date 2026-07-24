'use strict';

const assert = require('assert');
const { createZip, crc32, toDosDateTime } = require('../src/utils/zip.js');

console.log('🧪 ZIP Engine Tests\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

test('crc32 produces correct checksum', () => {
  const buf = Buffer.from('123456789', 'utf8');
  const checksum = crc32(buf);
  // Standard CRC32 of '123456789' is 0xcbf43926
  assert.strictEqual(checksum, 0xcbf43926);
});

test('toDosDateTime formats date properly', () => {
  const res = toDosDateTime(new Date(2026, 6, 24, 12, 30, 0));
  assert.ok(res.time > 0);
  assert.ok(res.date > 0);
});

test('createZip produces valid ZIP header', () => {
  const zipBuf = createZip({
    'hello.txt': 'Hello World',
    'data.json': '{"key": "value"}',
  });

  assert.ok(Buffer.isBuffer(zipBuf));
  assert.ok(zipBuf.length > 100);
  // Check ZIP header signature 0x04034b50 -> 50 4b 03 04
  assert.strictEqual(zipBuf[0], 0x50);
  assert.strictEqual(zipBuf[1], 0x4b);
  assert.strictEqual(zipBuf[2], 0x03);
  assert.strictEqual(zipBuf[3], 0x04);
});

console.log(`\n${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
