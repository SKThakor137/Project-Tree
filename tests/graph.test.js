/**
 * Tests for Universal Code Relationship Graph system.
 * Covers: graph model, parser, JSON export, HTML generation.
 */
'use strict';

const path = require('path');
const { UniversalGraphBuilder, NODE_TYPES, EDGE_TYPES } = require('../src/core/universalGraph.js');
const { generateUniversalGraph, detectLanguage, detectNodeType } = require('../src/core/universalParser.js');
const { toGraphJson, fromGraphJson } = require('../src/exporters/graphJson.js');
const { toGraphVisualizerHtml } = require('../src/exporters/graphVisualizer.js');

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${label}`);
  } else {
    failed++;
    console.error(`  ❌ ${label}`);
  }
}

// ─── Universal Graph Model ──────────────────────────────────────────────────

console.log('\n📦 Universal Graph Model');

// Test builder basics
const builder = new UniversalGraphBuilder('TestProject');
builder.addNode({ id: 'src/index.js', name: 'index.js', type: 'ENTRY', language: 'JavaScript' });
builder.addNode({ id: 'src/app.js', name: 'app.js', type: 'COMPONENT', language: 'JavaScript' });
builder.addEdge({ source: 'src/index.js', target: 'src/app.js', type: 'IMPORTS' });
const model = builder.build();

assert(model.projectName === 'TestProject', 'Builder sets project name');
assert(model.nodes.length === 2, 'Builder creates 2 nodes');
assert(model.edges.length === 1, 'Builder creates 1 edge');
assert(model.nodes[0].icon === '🚀', 'ENTRY node has correct icon');
assert(model.nodes[1].icon === '🧩', 'COMPONENT node has correct icon');
assert(model.nodes[0].outgoingCount === 1, 'Source node has outgoing count = 1');
assert(model.nodes[1].incomingCount === 1, 'Target node has incoming count = 1');
assert(model.edges[0].type === 'IMPORTS', 'Edge type is IMPORTS');
assert(model.edges[0].style === 'solid', 'IMPORTS edge style is solid');
assert(model.edges[0].color === '#8b949e', 'IMPORTS edge has correct color');

// Node types catalog
assert(Object.keys(NODE_TYPES).length >= 40, 'At least 40 node types defined');
assert(Object.keys(EDGE_TYPES).length >= 50, 'At least 50 edge types defined');

// Relationship types tracking
assert(model.relationshipTypes['IMPORTS'] !== undefined, 'Used relationship types tracked');
assert(model.nodeTypes['ENTRY'] !== undefined, 'Used node types tracked');
assert(model.nodeTypes['COMPONENT'] !== undefined, 'COMPONENT tracked in used types');

// ─── JSON Export / Import Roundtrip ─────────────────────────────────────────

console.log('\n📋 JSON Export / Import');

const jsonStr = builder.toJSON();
assert(typeof jsonStr === 'string', 'toJSON returns string');
assert(jsonStr.includes('TestProject'), 'JSON contains project name');

const parsed = JSON.parse(jsonStr);
assert(Array.isArray(parsed.nodes), 'Parsed JSON has nodes array');
assert(Array.isArray(parsed.edges), 'Parsed JSON has edges array');

// toGraphJson wrapper
const graphJsonStr = toGraphJson(model);
assert(graphJsonStr.includes('"version"'), 'toGraphJson adds version');
assert(graphJsonStr.includes('"generator"'), 'toGraphJson adds generator');

// fromGraphJson
const reimported = fromGraphJson(graphJsonStr);
assert(reimported.nodes.length === 2, 'fromGraphJson preserves nodes');
assert(reimported.edges.length === 1, 'fromGraphJson preserves edges');

// Invalid JSON
let errorThrown = false;
try { fromGraphJson('{}'); } catch (_) { errorThrown = true; }
assert(errorThrown, 'fromGraphJson rejects invalid structure');

// ─── Language Detection ─────────────────────────────────────────────────────

console.log('\n🌐 Language Detection');

assert(detectLanguage('foo.js') === 'JavaScript', 'Detects JavaScript');
assert(detectLanguage('foo.ts') === 'TypeScript', 'Detects TypeScript');
assert(detectLanguage('foo.py') === 'Python', 'Detects Python');
assert(detectLanguage('foo.php') === 'PHP', 'Detects PHP');
assert(detectLanguage('foo.java') === 'Java', 'Detects Java');
assert(detectLanguage('foo.dart') === 'Dart', 'Detects Dart');
assert(detectLanguage('foo.go') === 'Go', 'Detects Go');
assert(detectLanguage('foo.rs') === 'Rust', 'Detects Rust');
assert(detectLanguage('foo.cs') === 'C#', 'Detects C#');
assert(detectLanguage('foo.rb') === 'Ruby', 'Detects Ruby');
assert(detectLanguage('foo.vue') === 'Vue', 'Detects Vue');
assert(detectLanguage('foo.svelte') === 'Svelte', 'Detects Svelte');
assert(detectLanguage('foo.scss') === 'SCSS', 'Detects SCSS');
assert(detectLanguage('foo.xyz') === 'Unknown', 'Unknown extension returns Unknown');

// ─── Node Type Detection ────────────────────────────────────────────────────

console.log('\n🔍 Node Type Detection');

assert(detectNodeType('src/index.js', '', 'JavaScript') === 'ENTRY', 'index.js is ENTRY');
assert(detectNodeType('src/components/Button.jsx', '', 'JavaScript') === 'COMPONENT', 'components/ is COMPONENT');
assert(detectNodeType('src/utils/helpers.js', '', 'JavaScript') === 'UTILITY', 'utils/ is UTILITY');
assert(detectNodeType('src/services/auth.js', '', 'JavaScript') === 'SERVICE', 'services/ is SERVICE');
assert(detectNodeType('src/models/User.js', '', 'JavaScript') === 'MODEL', 'models/ is MODEL');
assert(detectNodeType('src/routes/api.js', '', 'JavaScript') === 'ROUTE', 'routes/ is ROUTE');
assert(detectNodeType('src/middleware/auth.js', '', 'JavaScript') === 'MIDDLEWARE', 'middleware/ is MIDDLEWARE');
assert(detectNodeType('src/controllers/user.js', '', 'JavaScript') === 'CONTROLLER', 'controllers/ is CONTROLLER');
assert(detectNodeType('src/hooks/useAuth.js', '', 'JavaScript') === 'HOOK', 'hooks/ is HOOK');
assert(detectNodeType('src/context/AuthContext.js', '', 'JavaScript') === 'CONTEXT', 'context/ is CONTEXT');
assert(detectNodeType('src/store/reducer.js', '', 'JavaScript') === 'STORE', 'store/ is STORE');
assert(detectNodeType('tests/app.test.js', '', 'JavaScript') === 'TEST', 'test file is TEST');
assert(detectNodeType('README.md', '', 'Unknown') === 'DOCUMENTATION', 'README is DOCUMENTATION');
assert(detectNodeType('.eslintrc.json', '', 'JSON') === 'CONFIG', 'eslintrc is CONFIG');
assert(detectNodeType('src/pages/Home.tsx', '', 'TypeScript') === 'PAGE', 'pages/ is PAGE');
assert(detectNodeType('src/layouts/MainLayout.tsx', '', 'TypeScript') === 'LAYOUT', 'layouts/ is LAYOUT');
assert(detectNodeType('app/layout.tsx', '', 'TypeScript') === 'LAYOUT', 'layout.tsx is LAYOUT');
assert(detectNodeType('app/page.tsx', '', 'TypeScript') === 'PAGE', 'page.tsx is PAGE');

// Dart widget detection
assert(detectNodeType('lib/widget.dart', 'class MyWidget extends StatelessWidget {}', 'Dart') === 'WIDGET', 'StatelessWidget is WIDGET');
assert(detectNodeType('lib/bloc.dart', 'class MyBloc extends Bloc<Event, State> {}', 'Dart') === 'BLOC', 'Bloc is BLOC');

// ─── HTML Generation ────────────────────────────────────────────────────────

console.log('\n🎨 HTML Visualization');

const htmlOutput = toGraphVisualizerHtml(model, 'TestProject');
assert(typeof htmlOutput === 'string', 'HTML output is string');
assert(htmlOutput.includes('<!DOCTYPE html>'), 'HTML has doctype');
assert(htmlOutput.includes('TestProject'), 'HTML contains project name');
assert(htmlOutput.includes('graphCanvas'), 'HTML has canvas element');
assert(htmlOutput.includes('detailPanel'), 'HTML has detail panel');
assert(htmlOutput.includes('minimap'), 'HTML has minimap');
assert(htmlOutput.includes('legend'), 'HTML has legend');
assert(htmlOutput.includes('contextMenu'), 'HTML has context menu');
assert(htmlOutput.includes('searchBox'), 'HTML has search');
assert(htmlOutput.includes('layoutSelect'), 'HTML has layout selector');
assert(htmlOutput.includes('data-theme="dark"'), 'HTML defaults to dark theme');
assert(htmlOutput.includes('btnTheme'), 'HTML has theme toggle');
assert(htmlOutput.includes('btnFullscreen'), 'HTML has fullscreen button');
assert(htmlOutput.includes('kbdModal'), 'HTML has keyboard shortcuts modal');
assert(htmlOutput.length > 5000, 'HTML is substantial (>5KB)');

// Null/empty model fallback
const emptyHtml = toGraphVisualizerHtml(null);
assert(emptyHtml.includes('No graph data'), 'Null model shows fallback message');

// ─── Live Graph Generation ──────────────────────────────────────────────────

console.log('\n🚀 Live Graph Generation (this project)');

const rootDir = path.resolve(__dirname, '..');
try {
  const liveModel = generateUniversalGraph(rootDir);
  assert(liveModel.nodes.length > 0, 'Live model has nodes (' + liveModel.nodes.length + ')');
  assert(liveModel.edges.length > 0, 'Live model has edges (' + liveModel.edges.length + ')');
  assert(liveModel.projectName !== '', 'Live model has project name');
  assert(liveModel.metadata.totalFiles > 0, 'Live model has file count');
  assert(Object.keys(liveModel.metadata.languages).length > 0, 'Live model has language stats');

  // Check that key files exist as nodes
  const nodeIds = liveModel.nodes.map(n => n.id);
  const hasIndex = nodeIds.some(id => id.includes('index.js'));
  assert(hasIndex, 'Live model includes index.js node');

  // Check edges point to valid nodes
  const nodeIdSet = new Set(nodeIds);
  const validEdges = liveModel.edges.filter(e => nodeIdSet.has(e.source));
  assert(validEdges.length > 0, 'Live model has edges with valid source nodes');

  // Generate HTML from live model
  const liveHtml = toGraphVisualizerHtml(liveModel, 'project-tree-md');
  assert(liveHtml.length > 10000, 'Live HTML is substantial (>10KB): ' + (liveHtml.length / 1024).toFixed(0) + 'KB');

  // Generate JSON from live model
  const liveJson = toGraphJson(liveModel);
  const reparsed = fromGraphJson(liveJson);
  assert(reparsed.nodes.length === liveModel.nodes.length, 'JSON roundtrip preserves node count');
  assert(reparsed.edges.length === liveModel.edges.length, 'JSON roundtrip preserves edge count');
} catch (err) {
  failed++;
  console.error(`  ❌ Live graph generation failed: ${err.message}`);
}

// ─── Edge Cases ─────────────────────────────────────────────────────────────

console.log('\n🧪 Edge Cases');

// Empty builder
const emptyBuilder = new UniversalGraphBuilder('Empty');
const emptyModel = emptyBuilder.build();
assert(emptyModel.nodes.length === 0, 'Empty builder has 0 nodes');
assert(emptyModel.edges.length === 0, 'Empty builder has 0 edges');

// Edge with non-existent target
const edgeBuilder = new UniversalGraphBuilder('EdgeTest');
edgeBuilder.addNode({ id: 'a', name: 'A', type: 'FILE' });
edgeBuilder.addEdge({ source: 'a', target: 'nonexistent', type: 'IMPORTS' });
const edgeModel = edgeBuilder.build();
assert(edgeModel.edges.length === 1, 'Edge to non-existent target still created');
assert(edgeModel.nodes[0].outgoingCount === 1, 'Outgoing count counted for missing target');

// Metadata
builder.setMetadata({ languages: { JavaScript: 5 }, totalFiles: 5 });
const metaModel = builder.build();
assert(metaModel.metadata.totalFiles === 5, 'Metadata totalFiles set correctly');

// fromJSON static
const rebuilt = UniversalGraphBuilder.fromJSON(jsonStr);
assert(rebuilt.nodes.length === 2, 'fromJSON static parses correctly');

// ─── Summary ────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`);
console.log(`✅ Passed: ${passed}  ❌ Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
}
