'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const {
  detectFrameworkRole,
  getFileImports,
  generateArchitectureFlow,
  ROLES,
} = require('../src/core/architectureFlow.js');

console.log('🧪 Architecture Flow Engine Tests\n');

// 1. detectFrameworkRole tests
const routeRole = detectFrameworkRole('src/routes/user.routes.js');
assert.strictEqual(routeRole.role, 'ROUTE');

const ctrlRole = detectFrameworkRole('src/controllers/user.controller.js');
assert.strictEqual(ctrlRole.role, 'CONTROLLER');

const serviceRole = detectFrameworkRole('src/services/user.service.js');
assert.strictEqual(serviceRole.role, 'SERVICE');

const modelRole = detectFrameworkRole('src/models/user.model.js');
assert.strictEqual(modelRole.role, 'MODEL');

const mwRole = detectFrameworkRole('src/middlewares/auth.js');
assert.strictEqual(mwRole.role, 'MIDDLEWARE');

const layoutRole = detectFrameworkRole('src/app/layout.tsx');
assert.strictEqual(layoutRole.role, 'LAYOUT');

const pageRole = detectFrameworkRole('src/app/page.tsx');
assert.strictEqual(pageRole.role, 'PAGE');

const clientRole = detectFrameworkRole('src/components/Header.tsx', "'use client';\nexport function Header() {}");
assert.strictEqual(clientRole.role, 'CLIENT_COMP');

console.log('  ✅ Framework role detection works across all patterns');

// 2. getFileImports tests for multi-language syntax
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-test-'));

try {
  // JS/TS imports
  const indexJs = path.join(tmpDir, 'index.js');
  const helperJs = path.join(tmpDir, 'helper.js');
  fs.writeFileSync(helperJs, '// Helper module\nmodule.exports = {};');
  fs.writeFileSync(indexJs, 'const helper = require("./helper");\nimport { utils } from "./helper.js";');

  const jsImports = getFileImports(indexJs, tmpDir, fs.readFileSync(indexJs, 'utf8'));
  assert.ok(jsImports.includes('helper.js'), 'Extracted JS relative import');
  console.log('  ✅ JS/TS import extraction works');

  // Python imports
  const mainPy = path.join(tmpDir, 'main.py');
  const modelsPy = path.join(tmpDir, 'models.py');
  fs.writeFileSync(modelsPy, '# Models module\nclass User: pass');
  fs.writeFileSync(mainPy, 'from .models import User\nimport models');

  const pyImports = getFileImports(mainPy, tmpDir, fs.readFileSync(mainPy, 'utf8'));
  assert.ok(pyImports.includes('models.py'), 'Extracted Python relative import');
  console.log('  ✅ Python import extraction works');

  // C/C++ includes
  const mainCpp = path.join(tmpDir, 'main.cpp');
  const headerH = path.join(tmpDir, 'header.h');
  fs.writeFileSync(headerH, '// Header file');
  fs.writeFileSync(mainCpp, '#include "header.h"\nint main() { return 0; }');

  const cppImports = getFileImports(mainCpp, tmpDir, fs.readFileSync(mainCpp, 'utf8'));
  assert.ok(cppImports.includes('header.h'), 'Extracted C++ header include');
  console.log('  ✅ C/C++ include extraction works');

  // 3. generateArchitectureFlow integration test
  const flowResult = generateArchitectureFlow(tmpDir);
  assert.ok(typeof flowResult.flowText === 'string');
  assert.ok(flowResult.flowText.includes('Global Application Architecture Flow'));
  assert.ok(flowResult.entryPoint);
  console.log('  ✅ Architecture flow engine generates tree originating from detected entry point');

} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

console.log('\nAll architecture flow tests passed!');
