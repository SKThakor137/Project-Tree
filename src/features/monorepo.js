/**
 * Detects monorepo workspace configurations, package structures, and root configs.
 */
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Detect monorepo tools and list workspace packages.
 * @param {string} rootDir
 * @returns {{ isMonorepo: boolean, tool: string|null, workspaces: Array<{name:string, path:string}> }}
 */
function detectMonorepo(rootDir) {
  const result = { isMonorepo: false, tool: null, workspaces: [] };
  const exists = (f) => fs.existsSync(path.join(rootDir, f));

  // TurboRepo
  if (exists('turbo.json')) {
    result.isMonorepo = true;
    result.tool = 'TurboRepo';
  }

  // Nx
  if (exists('nx.json')) {
    result.isMonorepo = true;
    result.tool = result.tool ? `${result.tool} + Nx` : 'Nx';
  }

  // pnpm workspace
  if (exists('pnpm-workspace.yaml')) {
    result.isMonorepo = true;
    result.tool = result.tool || 'pnpm Workspace';
    const yamlContent = fs.readFileSync(path.join(rootDir, 'pnpm-workspace.yaml'), 'utf8');
    const globs = extractPnpmWorkspaceGlobs(yamlContent);
    result.workspaces = resolveGlobs(rootDir, globs);
  }

  // Yarn/npm workspaces (package.json)
  const pkgPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.workspaces) {
        result.isMonorepo = true;
        result.tool = result.tool || 'Yarn/npm Workspace';
        const globs = Array.isArray(pkg.workspaces) ? pkg.workspaces : (pkg.workspaces.packages || []);
        if (result.workspaces.length === 0) {
          result.workspaces = resolveGlobs(rootDir, globs);
        }
      }
    } catch (_) {}
  }

  // Lerna
  if (exists('lerna.json')) {
    result.isMonorepo = true;
    result.tool = result.tool || 'Lerna';
    if (result.workspaces.length === 0) {
      try {
        const lerna = JSON.parse(fs.readFileSync(path.join(rootDir, 'lerna.json'), 'utf8'));
        const globs = lerna.packages || ['packages/*'];
        result.workspaces = resolveGlobs(rootDir, globs);
      } catch (_) {}
    }
  }

  // Auto-detect common monorepo directories
  if (result.workspaces.length === 0 && result.isMonorepo) {
    for (const dir of ['apps', 'packages', 'libs', 'modules', 'services']) {
      if (exists(dir)) {
        try {
          const entries = fs.readdirSync(path.join(rootDir, dir), { withFileTypes: true });
          entries.filter(e => e.isDirectory()).forEach(e => {
            result.workspaces.push({ name: e.name, path: `${dir}/${e.name}` });
          });
        } catch (_) {}
      }
    }
  }

  return result;
}

/**
 * Extract glob patterns from pnpm-workspace.yaml content.
 * Simple YAML line parser (avoids yaml dependency).
 * @param {string} content
 * @returns {string[]}
 */
function extractPnpmWorkspaceGlobs(content) {
  const globs = [];
  const lines = content.split(/\r?\n/);
  let inPackages = false;
  for (const line of lines) {
    if (/^packages:/i.test(line.trim())) { inPackages = true; continue; }
    if (inPackages) {
      const m = line.match(/^\s*-\s+['"]?([^'"]+)['"]?/);
      if (m) globs.push(m[1].trim());
      else if (/^\S/.test(line) && line.trim()) break; // next top-level key
    }
  }
  return globs;
}

/**
 * Resolve workspace glob patterns to actual directories.
 * @param {string} rootDir
 * @param {string[]} globs
 * @returns {Array<{name: string, path: string}>}
 */
function resolveGlobs(rootDir, globs) {
  const results = [];
  for (const glob of globs) {
    const clean = glob.replace(/\/\*$/, '').replace(/\/\*\*$/, '');
    const dir = path.join(rootDir, clean);
    if (fs.existsSync(dir)) {
      try {
        const stat = fs.lstatSync(dir);
        if (stat.isDirectory()) {
          // If the glob had a wildcard, list children
          if (glob.includes('*')) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            entries.filter(e => e.isDirectory()).forEach(e => {
              results.push({ name: e.name, path: `${clean}/${e.name}` });
            });
          } else {
            results.push({ name: path.basename(clean), path: clean });
          }
        }
      } catch (_) {}
    }
  }
  return results;
}

/**
 * Generate a workspace summary markdown section.
 * @param {Object} mono - output of detectMonorepo()
 * @returns {string}
 */
function formatWorkspaceSummary(mono) {
  if (!mono.isMonorepo) return '';
  const lines = [`## Workspace Summary (${mono.tool})`, ''];

  // Group by parent directory
  const groups = {};
  mono.workspaces.forEach(ws => {
    const parent = ws.path.split('/')[0] || 'root';
    if (!groups[parent]) groups[parent] = [];
    groups[parent].push(ws.name);
  });

  for (const [group, names] of Object.entries(groups)) {
    lines.push(`### ${group.charAt(0).toUpperCase() + group.slice(1)}`);
    names.forEach(n => lines.push(`- ${n}`));
    lines.push('');
  }

  return lines.join('\n');
}

module.exports = { detectMonorepo, formatWorkspaceSummary, extractPnpmWorkspaceGlobs, resolveGlobs };
