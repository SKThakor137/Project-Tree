/**
 * Bundle Export Engine — generates complete or selected analysis reports and packages them into a ZIP archive.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const pkg = require('../../package.json');
const { generateTree } = require('../core/generator.js');
const { toJson } = require('../exporters/json.js');
const { toHtml } = require('../exporters/html.js');
const { toSvg } = require('../exporters/svg.js');
const { toMermaid } = require('../exporters/mermaid.js');
const { generateAiContext } = require('./ai.js');
const { createZip } = require('../utils/zip.js');
const colors = require('../utils/colors.js');
const { generateUniversalGraph } = require('../core/universalParser.js');
const { toGraphVisualizerHtml } = require('../exporters/graphVisualizer.js');
const { toGraphJson } = require('../exporters/graphJson.js');
const { toGraph3dVisualizerHtml } = require('../exporters/graph3dVisualizer.js');

const REPORT_ALIAS_MAP = {
  md: ['PROJECT_STRUCTURE.md'],
  markdown: ['PROJECT_STRUCTURE.md'],
  json: ['PROJECT_STRUCTURE.json', 'PROJECT_STATS.json'],
  html: ['PROJECT_STRUCTURE.html'],
  svg: ['PROJECT_STRUCTURE.svg'],
  mermaid: ['PROJECT_STRUCTURE.mmd'],
  mmd: ['PROJECT_STRUCTURE.mmd'],
  ai: ['AI_CONTEXT.md'],
  component: ['COMPONENT_USAGE.json', 'UNUSED_COMPONENTS.json'],
  components: ['COMPONENT_USAGE.json', 'UNUSED_COMPONENTS.json'],
  dependency: ['IMPORT_GRAPH.json', 'EXPORT_GRAPH.json', 'CIRCULAR_DEPENDENCIES.json', 'DEPENDENCY_HEATMAP.json'],
  dependencies: ['IMPORT_GRAPH.json', 'EXPORT_GRAPH.json', 'CIRCULAR_DEPENDENCIES.json', 'DEPENDENCY_HEATMAP.json'],
  deadcode: ['DEAD_CODE.json'],
  health: ['PROJECT_HEALTH.json'],
  framework: ['FRAMEWORK_INFO.json'],
  language: ['LANGUAGE_BREAKDOWN.json'],
  readme: ['README_ANALYSIS.md'],
  graph: ['CODE_GRAPH.html', 'CODE_GRAPH.json'],
  '3d-graph': ['CODE_GRAPH_3D.html'],
  'graph-3d': ['CODE_GRAPH_3D.html'],
  'visualize-3d': ['CODE_GRAPH_3D.html'],
  visualize: ['CODE_GRAPH.html'],
  'graph-json': ['CODE_GRAPH.json'],
};

/**
 * Compiles all individual report files and bundle metadata for a scanned project.
 *
 * @param {Object} options
 * @param {string} [options.rootDir]
 * @param {Object} [options.genResult] - Reused generateTree result if already computed
 * @returns {Object<string, string>} Map of filename to content string
 */
function compileAllReports(options = {}) {
  const rootDir = options.rootDir || process.cwd();

  const res = options.genResult || generateTree({
    rootDir,
    architecture: true,
    flow: true,
    summarize: true,
    writeFile: false,
  });

  const { tree, stats, projectInfo, treeText, markdown } = res;
  const arch = stats.architectureGraph || {
    imports: {},
    exports: {},
    usage: {},
    deadCode: { files: [], exports: [], components: [] },
    circular: [],
  };

  const reports = {};

  // 1. PROJECT_STRUCTURE.md
  reports['PROJECT_STRUCTURE.md'] = markdown;

  // 2. PROJECT_STRUCTURE.json
  reports['PROJECT_STRUCTURE.json'] = toJson(tree, stats);

  // 3. PROJECT_STRUCTURE.html
  reports['PROJECT_STRUCTURE.html'] = toHtml(tree, stats);

  // 4. PROJECT_STRUCTURE.svg
  reports['PROJECT_STRUCTURE.svg'] = toSvg(tree, stats);

  // 5. PROJECT_STRUCTURE.mmd
  reports['PROJECT_STRUCTURE.mmd'] = toMermaid(tree);

  // 6. AI_CONTEXT.md
  reports['AI_CONTEXT.md'] = generateAiContext(rootDir, treeText, stats);

  // Collect component mapping & languages
  const componentUsageMap = {};
  const unusedComponents = [];
  const languageExts = {};

  function walkNode(node) {
    if (node.parsed) {
      const ext = path.extname(node.name).toLowerCase() || '[no ext]';
      if (!languageExts[ext]) languageExts[ext] = { files: 0, lines: 0 };
      languageExts[ext].files++;
      languageExts[ext].lines += (node.parsed.lines || 0);

      if (node.parsed.components && node.parsed.components.length > 0) {
        const u = arch.usage[node.relPath] || { count: 0, by: [] };
        node.parsed.components.forEach(comp => {
          componentUsageMap[`${node.relPath}::${comp}`] = {
            file: node.relPath,
            component: comp,
            usageCount: u.count,
            usedBy: u.by,
          };
          if (u.count === 0 && !node.relPath.includes('index.') && !node.relPath.includes('App.') && !node.relPath.includes('app.')) {
            unusedComponents.push({
              file: node.relPath,
              component: comp,
            });
          }
        });
      }
    }
    if (node.children) node.children.forEach(walkNode);
  }
  walkNode(tree);

  // 7. COMPONENT_USAGE.json
  reports['COMPONENT_USAGE.json'] = JSON.stringify(componentUsageMap, null, 2);

  // 8. IMPORT_GRAPH.json
  reports['IMPORT_GRAPH.json'] = JSON.stringify(arch.imports, null, 2);

  // 9. EXPORT_GRAPH.json
  reports['EXPORT_GRAPH.json'] = JSON.stringify(arch.exports, null, 2);

  // 10. DEAD_CODE.json
  reports['DEAD_CODE.json'] = JSON.stringify(arch.deadCode, null, 2);

  // 11. UNUSED_COMPONENTS.json
  reports['UNUSED_COMPONENTS.json'] = JSON.stringify(unusedComponents, null, 2);

  // 12. CIRCULAR_DEPENDENCIES.json
  reports['CIRCULAR_DEPENDENCIES.json'] = JSON.stringify(arch.circular, null, 2);

  // 13. PROJECT_STATS.json
  const statsExport = {
    projectName: tree.name,
    files: stats.files,
    dirs: stats.dirs,
    totalSize: stats.totalSize,
    totalSizeText: stats.totalSizeText,
    componentsCount: stats.componentsCount || 0,
    totalLines: stats.totalLines || 0,
    avgComplexity: Math.round((stats.avgComplexity || 1) * 100) / 100,
    extensions: stats.extensions || {},
  };
  reports['PROJECT_STATS.json'] = JSON.stringify(statsExport, null, 2);

  // 14. PROJECT_HEALTH.json
  const deadCount = (arch.deadCode.files || []).length;
  const circularCount = (arch.circular || []).length;
  const healthScore = Math.max(0, 100 - (circularCount * 15) - (deadCount * 5));
  const healthGrade = healthScore >= 90 ? 'A' : healthScore >= 75 ? 'B' : healthScore >= 60 ? 'C' : 'D';

  const healthData = {
    score: healthScore,
    grade: healthGrade,
    deadCodeCount: deadCount,
    circularDependenciesCount: circularCount,
    avgCyclomaticComplexity: Math.round((stats.avgComplexity || 1) * 100) / 100,
    status: healthScore >= 80 ? 'Healthy' : healthScore >= 60 ? 'Needs Attention' : 'Critical',
  };
  reports['PROJECT_HEALTH.json'] = JSON.stringify(healthData, null, 2);

  // 15. FRAMEWORK_INFO.json
  reports['FRAMEWORK_INFO.json'] = JSON.stringify(projectInfo, null, 2);

  // 16. LANGUAGE_BREAKDOWN.json
  reports['LANGUAGE_BREAKDOWN.json'] = JSON.stringify(languageExts, null, 2);

  // 17. DEPENDENCY_HEATMAP.json
  const sortedHeatmap = Object.keys(arch.usage)
    .map(key => ({ file: key, usageCount: arch.usage[key].count, usedBy: arch.usage[key].by }))
    .sort((a, b) => b.usageCount - a.usageCount);
  reports['DEPENDENCY_HEATMAP.json'] = JSON.stringify(sortedHeatmap, null, 2);

  // 18. README_ANALYSIS.md
  const readmeMd = `# ${tree.name} — Architecture & Health Analysis

Generated by **project-tree-md v${pkg.version}** on ${new Date().toLocaleString()}

---

## 📊 Quick Summary

- **Project:** \`${tree.name}\`
- **Framework:** ${projectInfo.framework || 'Vanilla / Node'}
- **Language:** ${projectInfo.language || 'JavaScript'}
- **Files / Dirs:** ${stats.files} files, ${stats.dirs} directories
- **Total Code Lines:** ${stats.totalLines || 'N/A'}
- **Health Score:** **${healthScore}/100** (Grade: **${healthGrade}**)

---

## 🏥 Code Health & Architecture

- **Dead Code Files:** ${deadCount}
- **Circular Import Loops:** ${circularCount}
- **Average Cyclomatic Complexity:** ${healthData.avgCyclomaticComplexity}

${circularCount > 0 ? `\n### ⚠️ Circular Dependencies\n` + arch.circular.map(c => `- \`${c}\``).join('\n') : ''}
${deadCount > 0 ? `\n### 🧹 Dead Code Files\n` + arch.deadCode.files.map(f => `- \`${f}\``).join('\n') : ''}

---

## 🔥 Top Used Modules (Dependency Heatmap)

${sortedHeatmap.slice(0, 10).map((h, i) => `${i + 1}. \`${h.file}\` — Used by **${h.usageCount}** modules`).join('\n') || 'No module usage detected.'}

---

*Full reports available inside this export bundle.*
`;
  reports['README_ANALYSIS.md'] = readmeMd;

  // 19. manifest.json
  const reportKeys = Object.keys(reports);
  const manifest = {
    project: tree.name,
    generatedAt: new Date().toISOString(),
    version: pkg.version,
    framework: projectInfo.framework || 'Unknown',
    language: projectInfo.language || 'JavaScript',
    reports: [...reportKeys, 'manifest.json'],
  };
  reports['manifest.json'] = JSON.stringify(manifest, null, 2);

  // 20. CODE_GRAPH.html & CODE_GRAPH.json (Interactive Graph Visualizer)
  try {
    const graphModel = generateUniversalGraph(rootDir, tree);
    reports['CODE_GRAPH.html'] = toGraphVisualizerHtml(graphModel, tree.name);
    reports['CODE_GRAPH.json'] = toGraphJson(graphModel);
    reports['CODE_GRAPH_3D.html'] = toGraph3dVisualizerHtml(graphModel, tree.name);
  } catch (_) {
    // Graph generation is optional — skip if it fails
  }

  return reports;
}

/**
 * Generates a project analysis ZIP bundle (with optional report filtering).
 *
 * @param {Object} options
 * @param {string} [options.rootDir]
 * @param {string} [options.outputDir]
 * @param {string} [options.bundleName]
 * @param {string|Array<string>} [options.exportList] - Selective report list
 * @returns {{zipBuffer: Buffer, zipPath: string, reports: Object, summaryText: string}}
 */
function generateBundle(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const outputDir = options.outputDir
    ? (path.isAbsolute(options.outputDir) ? options.outputDir : path.join(rootDir, options.outputDir))
    : rootDir;

  const bundleFileName = options.bundleName || 'project-analysis.zip';
  const zipPath = path.join(outputDir, bundleFileName);

  const allCompiled = compileAllReports({ rootDir });
  let filteredReports = {};

  const exportList = options.exportList || options.reportList;
  if (!exportList || exportList === 'all' || exportList === true) {
    filteredReports = allCompiled;
  } else {
    const keys = Array.isArray(exportList)
      ? exportList
      : String(exportList).split(',').map(s => s.trim().toLowerCase());

    const targetFiles = new Set();
    keys.forEach(k => {
      if (REPORT_ALIAS_MAP[k]) {
        REPORT_ALIAS_MAP[k].forEach(f => targetFiles.add(f));
      } else {
        const matched = Object.keys(allCompiled).find(
          f => f.toLowerCase() === k || f.toLowerCase() === `${k}.json` || f.toLowerCase() === `${k}.md`
        );
        if (matched) targetFiles.add(matched);
      }
    });

    targetFiles.add('manifest.json');

    targetFiles.forEach(f => {
      if (allCompiled[f]) filteredReports[f] = allCompiled[f];
    });
  }

  const zipBuffer = createZip(filteredReports);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(zipPath, zipBuffer);

  const sizeMb = (zipBuffer.length / (1024 * 1024)).toFixed(2);
  const totalFiles = Object.keys(filteredReports).length;

  const relativeZipPath = path.relative(process.cwd(), zipPath) || bundleFileName;

  const summaryText = `
${colors.boldGreen('📦 Bundle Generated Successfully')}

${colors.bold('Location:')}
${colors.cyan(relativeZipPath)}

${colors.bold('Reports Included in ZIP:')}
${Object.keys(filteredReports).map(item => `  ${colors.green('✓')} ${item}`).join('\n')}

${colors.bold('Total Files:')} ${totalFiles}
${colors.bold('Bundle Size:')} ${sizeMb} MB
`.trim();

  return {
    zipBuffer,
    zipPath,
    reports: filteredReports,
    totalFiles,
    sizeMb,
    summaryText,
  };
}

module.exports = {
  compileAllReports,
  generateBundle,
};
