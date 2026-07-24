'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { generateBundle, compileAllReports } = require('../src/features/bundle.js');

console.log('🧪 Bundle Engine Tests\n');

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

test('compileAllReports returns all 19 required report files', () => {
  const reports = compileAllReports({ rootDir: process.cwd() });
  assert.ok(reports['PROJECT_STRUCTURE.md']);
  assert.ok(reports['PROJECT_STRUCTURE.json']);
  assert.ok(reports['PROJECT_STRUCTURE.html']);
  assert.ok(reports['PROJECT_STRUCTURE.svg']);
  assert.ok(reports['PROJECT_STRUCTURE.mmd']);
  assert.ok(reports['AI_CONTEXT.md']);
  assert.ok(reports['COMPONENT_USAGE.json']);
  assert.ok(reports['IMPORT_GRAPH.json']);
  assert.ok(reports['EXPORT_GRAPH.json']);
  assert.ok(reports['DEAD_CODE.json']);
  assert.ok(reports['UNUSED_COMPONENTS.json']);
  assert.ok(reports['CIRCULAR_DEPENDENCIES.json']);
  assert.ok(reports['PROJECT_STATS.json']);
  assert.ok(reports['PROJECT_HEALTH.json']);
  assert.ok(reports['FRAMEWORK_INFO.json']);
  assert.ok(reports['LANGUAGE_BREAKDOWN.json']);
  assert.ok(reports['DEPENDENCY_HEATMAP.json']);
  assert.ok(reports['README_ANALYSIS.md']);
  assert.ok(reports['manifest.json']);
});

test('manifest.json contains required metadata fields', () => {
  const reports = compileAllReports({ rootDir: process.cwd() });
  const manifest = JSON.parse(reports['manifest.json']);
  assert.ok(manifest.project);
  assert.ok(manifest.generatedAt);
  assert.ok(manifest.version);
  assert.ok(Array.isArray(manifest.reports));
  assert.ok(manifest.reports.includes('PROJECT_STRUCTURE.md'));
});

test('generateBundle outputs zip file and summary text', () => {
  const tmpDir = path.join(__dirname, 'tmp_bundle_test');
  try {
    const res = generateBundle({
      rootDir: process.cwd(),
      outputDir: tmpDir,
      bundleName: 'test-analysis.zip',
    });

    assert.ok(fs.existsSync(res.zipPath));
    assert.ok(res.zipBuffer.length > 0);
    assert.ok(res.summaryText.includes('Bundle Generated Successfully'));

    // Clean up
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (e) {
    if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
    throw e;
  }
});

test('generateBundle supports selective report filtering', () => {
  const tmpDir = path.join(__dirname, 'tmp_bundle_select_test');
  try {
    const res = generateBundle({
      rootDir: process.cwd(),
      outputDir: tmpDir,
      bundleName: 'selective-analysis.zip',
      exportList: 'html,json,svg',
    });

    assert.ok(res.reports['PROJECT_STRUCTURE.html']);
    assert.ok(res.reports['PROJECT_STRUCTURE.json']);
    assert.ok(res.reports['PROJECT_STRUCTURE.svg']);
    assert.strictEqual(res.reports['AI_CONTEXT.md'], undefined);
    assert.ok(res.reports['manifest.json']);

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
