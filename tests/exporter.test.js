'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { exportReports } = require('../src/features/exporter.js');

console.log('🧪 Exporter Engine Tests\n');

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

test('exportReports exports selective formats to target output directory', () => {
  const tmpDir = path.join(__dirname, 'tmp_export_test');
  try {
    const res = exportReports({
      rootDir: process.cwd(),
      outputDir: tmpDir,
      exportList: 'html,json,svg',
    });

    assert.ok(fs.existsSync(path.join(tmpDir, 'PROJECT_STRUCTURE.html')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'PROJECT_STRUCTURE.json')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'PROJECT_STRUCTURE.svg')));
    assert.ok(res.exportedFiles.includes('PROJECT_STRUCTURE.html'));

    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (e) {
    if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
    throw e;
  }
});

console.log(`\n${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
