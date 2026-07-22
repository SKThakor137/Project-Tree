'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { extractFileSummary, cleanSummaryText } = require('../src/features/summarize.js');

console.log('🧪 Summarize / Comment Extractor Tests\n');

// 1. cleanSummaryText helper
assert.strictEqual(cleanSummaryText('// Handles JWT token validation'), 'Handles JWT token validation');
assert.strictEqual(cleanSummaryText('/* @file User authentication module. */'), 'User authentication module.');
assert.strictEqual(cleanSummaryText('#   @description   Scans directory recursively.   '), 'Scans directory recursively.');
console.log('  ✅ cleanSummaryText helper works');

// Create temporary directory for test files
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tree-summarize-test-'));

try {
  // 2. JavaScript single-line comment
  const jsFile = path.join(tmpDir, 'auth.js');
  fs.writeFileSync(jsFile, '// Handles JWT token validation\nconst jwt = require("jsonwebtoken");\n');
  assert.strictEqual(extractFileSummary(jsFile), 'Handles JWT token validation');
  console.log('  ✅ JS single-line comment extraction works');

  // 3. JavaScript block comment
  const jsBlockFile = path.join(tmpDir, 'scanner.js');
  fs.writeFileSync(jsBlockFile, '/**\n * Scans directory structure recursively.\n * Supports custom ignore rules.\n */\nfunction scan() {}\n');
  assert.strictEqual(extractFileSummary(jsBlockFile), 'Scans directory structure recursively.');
  console.log('  ✅ JS block comment extraction works');

  // 4. Python comment & shebang skipping
  const pyFile = path.join(tmpDir, 'script.py');
  fs.writeFileSync(pyFile, '#!/usr/bin/env python3\n# Processes input data pipeline.\nimport sys\n');
  assert.strictEqual(extractFileSummary(pyFile), 'Processes input data pipeline.');
  console.log('  ✅ Python comment with shebang skipping works');

  // 5. HTML comment
  const htmlFile = path.join(tmpDir, 'index.html');
  fs.writeFileSync(htmlFile, '<!-- Main dashboard user interface template -->\n<!DOCTYPE html>\n<html></html>');
  assert.strictEqual(extractFileSummary(htmlFile), 'Main dashboard user interface template');
  console.log('  ✅ HTML comment extraction works');

  // 6. Binary file safety
  const binFile = path.join(tmpDir, 'image.png');
  const binBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x0d, 0x0a, 0x1a, 0x0a]);
  fs.writeFileSync(binFile, binBuffer);
  assert.strictEqual(extractFileSummary(binFile), null);
  console.log('  ✅ Binary file returns null safely');

  // 7. Non-existent file safety
  assert.strictEqual(extractFileSummary(path.join(tmpDir, 'nonexistent.js')), null);
  console.log('  ✅ Non-existent file returns null safely');

} finally {
  // Cleanup temp files
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

console.log('\nAll summarize tests passed!');
