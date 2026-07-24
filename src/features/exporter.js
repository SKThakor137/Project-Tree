/**
 * Selective report exporter — outputs chosen formats or all reports to an output directory.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { compileAllReports } = require('./bundle.js');
const colors = require('../utils/colors.js');

/**
 * Supported report key aliases for --export option.
 */
const EXPORT_MAP = {
  markdown: ['PROJECT_STRUCTURE.md'],
  md: ['PROJECT_STRUCTURE.md'],
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
};

/**
 * Export selected or all reports to the destination directory.
 *
 * @param {Object} options
 * @param {string} [options.rootDir]
 * @param {string} [options.outputDir]
 * @param {string|Array<string>} [options.exportList] - Comma-separated or array of format keys
 * @param {boolean} [options.exportAll]
 * @returns {{exportedFiles: Array<string>, outputDir: string}}
 */
function exportReports(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const outputDir = options.outputDir
    ? (path.isAbsolute(options.outputDir) ? options.outputDir : path.join(rootDir, options.outputDir))
    : rootDir;

  const allReports = compileAllReports({ rootDir });

  let filesToExport = new Set();

  if (options.exportAll || !options.exportList || options.exportList === 'all' || options.exportList === true) {
    Object.keys(allReports).forEach(f => filesToExport.add(f));
  } else {
    const keys = Array.isArray(options.exportList)
      ? options.exportList
      : String(options.exportList).split(',').map(s => s.trim().toLowerCase());

    keys.forEach(key => {
      if (EXPORT_MAP[key]) {
        EXPORT_MAP[key].forEach(f => filesToExport.add(f));
      } else {
        // Direct match attempt
        const matched = Object.keys(allReports).find(
          f => f.toLowerCase() === key || f.toLowerCase() === `${key}.json` || f.toLowerCase() === `${key}.md`
        );
        if (matched) filesToExport.add(matched);
      }
    });

    // Always include manifest.json for bundle context
    filesToExport.add('manifest.json');
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const exportedFiles = [];
  filesToExport.forEach(fileName => {
    if (allReports[fileName]) {
      const destPath = path.join(outputDir, fileName);
      fs.writeFileSync(destPath, allReports[fileName], 'utf8');
      exportedFiles.push(fileName);
    }
  });

  const relOutputDir = path.relative(process.cwd(), outputDir) || '.';

  console.log(`\n${colors.boldGreen('🚀 Selective Export Completed')}`);
  console.log(`📂 Output Directory: ${colors.cyan(relOutputDir)}`);
  console.log(`📄 Exported ${exportedFiles.length} file(s):`);
  exportedFiles.forEach(f => console.log(`  ✓ ${colors.green(f)}`));

  return {
    exportedFiles,
    outputDir,
  };
}

module.exports = {
  EXPORT_MAP,
  exportReports,
};
