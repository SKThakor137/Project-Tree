'use strict';

/**
 * v3.0 Enterprise Upgrade Test Suite.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const {
  globToRegExp,
  parseIgnoreLine,
  isIgnored,
} = require('../src/utils/globMatcher.js');

const {
  loadConfig,
  findConfigFile,
  loadEnvConfig,
} = require('../src/core/configLoader.js');

const {
  sortTree,
  getSortComparator,
  naturalCompare,
} = require('../src/core/sorter.js');

const {
  hashFileSync,
  hashData,
} = require('../src/utils/hasher.js');

const {
  findDuplicatesByName,
  findDuplicatesByHash,
} = require('../src/features/duplicates.js');

const {
  loadTheme,
  getPresetNames,
} = require('../src/core/themeEngine.js');

const {
  createIconResolver,
} = require('../src/core/iconEngine.js');

const { toCsv, toTsv } = require('../src/exporters/csv.js');
const { toXml } = require('../src/exporters/xml.js');
const { toYaml } = require('../src/exporters/yaml.js');
const { toPlantUml } = require('../src/exporters/plantuml.js');
const { registerRenderer, loadPlugin, getRenderer, resetRegistry } = require('../src/core/pluginApi.js');
const { scan } = require('../src/core/scanner.js');

console.log('🧪 Testing v3.0 Enterprise Upgrade Features...\n');

// 1. Glob Matcher Tests
{
  const reg1 = globToRegExp('*.js');
  assert.strictEqual(reg1.test('index.js'), true);
  assert.strictEqual(reg1.test('src/index.js'), true);

  const reg2 = globToRegExp('src/**/*.ts');
  assert.strictEqual(reg2.test('src/core/types.ts'), true);
  assert.strictEqual(reg2.test('lib/core/types.ts'), false);

  const rule = parseIgnoreLine('!important.txt');
  assert.strictEqual(rule.negated, true);
  assert.strictEqual(rule.pattern, 'important.txt');

  console.log('  ✅ Glob matcher tests passed');
}

// 2. Config Loader Tests
{
  const envCfg = loadEnvConfig();
  assert.strictEqual(typeof envCfg, 'object');

  const { config } = loadConfig(process.cwd());
  assert.strictEqual(typeof config, 'object');
  assert.strictEqual(config.theme, 'emoji');

  console.log('  ✅ Config loader tests passed');
}

// 3. Sorter Tests
{
  assert.strictEqual(naturalCompare('file2.js', 'file10.js') < 0, true);

  const mockTree = {
    name: 'root',
    children: [
      { name: 'fileB.js', size: 200 },
      { name: 'folderA', children: [] },
      { name: 'fileA.js', size: 100 },
    ],
  };

  sortTree(mockTree, 'folders-first');
  assert.strictEqual(mockTree.children[0].name, 'folderA');
  assert.strictEqual(mockTree.children[1].name, 'fileA.js');

  sortTree(mockTree, 'size');
  assert.strictEqual(mockTree.children[1].name, 'fileA.js');

  console.log('  ✅ Sorter tests passed');
}

// 4. Hasher Tests
{
  const h1 = hashData('hello world', 'sha256');
  assert.strictEqual(h1, 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');

  const h2 = hashFileSync(path.join(process.cwd(), 'package.json'), 'md5');
  assert.strictEqual(typeof h2, 'string');
  assert.strictEqual(h2.length, 32);

  console.log('  ✅ Hasher tests passed');
}

// 5. Duplicate Detection Tests
{
  const mockTree = {
    name: 'root',
    children: [
      { name: 'utils.js', path: '/a/utils.js' },
      { name: 'sub', children: [{ name: 'utils.js', path: '/b/utils.js' }] },
    ],
  };

  const dups = findDuplicatesByName(mockTree);
  assert.strictEqual(dups.length, 1);
  assert.strictEqual(dups[0].key, 'utils.js');
  assert.strictEqual(dups[0].count, 2);

  console.log('  ✅ Duplicate detection tests passed');
}

// 6. Theme & Icon Engine Tests
{
  const presets = getPresetNames();
  assert.strictEqual(presets.includes('rounded'), true);
  assert.strictEqual(presets.includes('double'), true);

  const roundedTheme = loadTheme('rounded');
  assert.strictEqual(roundedTheme.last, '╰');

  const resolver = createIconResolver();
  const icon = resolver.getIcon({ name: 'main.py', ext: '.py' });
  assert.strictEqual(icon, '🐍 ');

  console.log('  ✅ Theme & icon engine tests passed');
}

// 7. New Exporters Tests (CSV, TSV, XML, YAML, PlantUML)
{
  const sampleTree = {
    name: 'my-project',
    children: [
      { name: 'src', children: [{ name: 'index.js', size: 500, ext: '.js' }] },
      { name: 'README.md', size: 1000, ext: '.md' },
    ],
  };

  const csv = toCsv(sampleTree);
  assert.strictEqual(csv.includes('path,name,type'), true);
  assert.strictEqual(csv.includes('index.js'), true);

  const tsv = toTsv(sampleTree);
  assert.strictEqual(tsv.includes('path\tname\ttype'), true);

  const xml = toXml(sampleTree);
  assert.strictEqual(xml.includes('<?xml'), true);
  assert.strictEqual(xml.includes('<directory name="my-project"'), true);

  const yaml = toYaml(sampleTree);
  assert.strictEqual(yaml.includes('my-project'), true);

  const puml = toPlantUml(sampleTree);
  assert.strictEqual(puml.includes('@startuml'), true);
  assert.strictEqual(puml.includes('@enduml'), true);

  console.log('  ✅ New exporter tests passed (CSV, TSV, XML, YAML, PlantUML)');
}

// 8. Plugin API Tests
{
  resetRegistry();
  registerRenderer('custom-text', (tree) => `Custom: ${tree.name}`);
  const renderer = getRenderer('custom-text');
  assert.strictEqual(renderer({ name: 'root' }), 'Custom: root');

  console.log('  ✅ Plugin API tests passed');
}

// 9. Scanner Metadata & Limit Tests
{
  const scanned = scan(process.cwd(), {
    maxDepth: 2,
    modified: true,
    created: true,
    permissions: true,
  });
  assert.notStrictEqual(scanned, null);
  assert.strictEqual(typeof scanned.name, 'string');
  assert.notStrictEqual(scanned.permissions, undefined);

  console.log('  ✅ Scanner metadata tests passed');
}

console.log('\n🎉 All v3.0 Enterprise Upgrade Tests Passed Successfully!\n');
