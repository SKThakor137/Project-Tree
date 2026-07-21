'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Detect project frameworks, tools, and configurations.
 * @param {string} rootDir
 * @returns {Object} projectInfo
 */
function detectProject(rootDir) {
  const info = {
    name: path.basename(rootDir),
    language: null,
    framework: null,
    packageManager: null,
    buildTool: null,
    testingFramework: null,
    linter: null,
    formatter: null,
    cssFramework: null,
    database: null,
    runtime: null,
    ci: null,
    containerized: false,
    monorepo: false,
    detectedTools: [],
    scripts: {},
    dependencies: {},
    devDependencies: {},
    configFiles: [],
  };

  // Read package.json if available
  const pkgPath = path.join(rootDir, 'package.json');
  let pkg = null;
  if (fs.existsSync(pkgPath)) {
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      info.name = pkg.name || info.name;
      info.scripts = pkg.scripts || {};
      info.dependencies = pkg.dependencies || {};
      info.devDependencies = pkg.devDependencies || {};
    } catch (_) { /* invalid json */ }
  }

  const allDeps = { ...(info.dependencies), ...(info.devDependencies) };
  const exists = (f) => fs.existsSync(path.join(rootDir, f));

  // ─── Package Manager ────────────────────────────────────────────────
  if (exists('bun.lockb') || exists('bun.lock'))         { info.packageManager = 'Bun'; info.detectedTools.push('Bun'); }
  else if (exists('pnpm-lock.yaml'))                     { info.packageManager = 'pnpm'; info.detectedTools.push('pnpm'); }
  else if (exists('yarn.lock'))                          { info.packageManager = 'Yarn'; info.detectedTools.push('Yarn'); }
  else if (exists('package-lock.json'))                  { info.packageManager = 'npm'; info.detectedTools.push('npm'); }
  else if (exists('deno.json') || exists('deno.jsonc'))  { info.packageManager = 'Deno'; info.detectedTools.push('Deno'); }

  // ─── Runtime ────────────────────────────────────────────────────────
  if (exists('deno.json') || exists('deno.jsonc'))  { info.runtime = 'Deno'; info.detectedTools.push('Deno'); }
  else if (exists('bun.lockb') || exists('bun.lock') || exists('bunfig.toml')) { info.runtime = 'Bun'; }
  else if (pkg)                                          { info.runtime = 'Node.js'; }

  // ─── Language ───────────────────────────────────────────────────────
  if (exists('tsconfig.json') || exists('tsconfig.base.json') || allDeps['typescript']) {
    info.language = 'TypeScript'; info.detectedTools.push('TypeScript');
  } else if (pkg) {
    info.language = 'JavaScript';
  }
  if (exists('requirements.txt') || exists('pyproject.toml') || exists('setup.py')) {
    info.language = info.language ? `${info.language} + Python` : 'Python';
  }
  if (exists('go.mod'))    { info.language = info.language ? `${info.language} + Go` : 'Go'; }
  if (exists('Cargo.toml')){ info.language = info.language ? `${info.language} + Rust` : 'Rust'; }

  // ─── Framework ──────────────────────────────────────────────────────
  if (allDeps['next'])                   { info.framework = 'Next.js'; info.detectedTools.push('Next.js'); }
  else if (allDeps['nuxt'] || allDeps['nuxt3']) { info.framework = 'Nuxt'; info.detectedTools.push('Nuxt'); }
  else if (allDeps['@angular/core'])     { info.framework = 'Angular'; info.detectedTools.push('Angular'); }
  else if (allDeps['vue'])               { info.framework = 'Vue.js'; info.detectedTools.push('Vue.js'); }
  else if (allDeps['svelte'] || allDeps['@sveltejs/kit']) { info.framework = 'Svelte'; info.detectedTools.push('Svelte'); }
  else if (allDeps['astro'])             { info.framework = 'Astro'; info.detectedTools.push('Astro'); }
  else if (allDeps['react'])             { info.framework = 'React'; info.detectedTools.push('React'); }
  else if (allDeps['@nestjs/core'])      { info.framework = 'NestJS'; info.detectedTools.push('NestJS'); }
  else if (allDeps['express'])           { info.framework = 'Express'; info.detectedTools.push('Express'); }
  else if (allDeps['fastify'])           { info.framework = 'Fastify'; info.detectedTools.push('Fastify'); }
  else if (allDeps['koa'])               { info.framework = 'Koa'; info.detectedTools.push('Koa'); }
  else if (allDeps['hono'])              { info.framework = 'Hono'; info.detectedTools.push('Hono'); }

  // ─── Build Tool ────────────────────────────────────────────────────
  if (exists('vite.config.ts') || exists('vite.config.js') || allDeps['vite']) {
    info.buildTool = 'Vite'; info.detectedTools.push('Vite');
  } else if (exists('webpack.config.js') || exists('webpack.config.ts') || allDeps['webpack']) {
    info.buildTool = 'Webpack'; info.detectedTools.push('Webpack');
  } else if (exists('rollup.config.js') || exists('rollup.config.mjs') || allDeps['rollup']) {
    info.buildTool = 'Rollup'; info.detectedTools.push('Rollup');
  } else if (allDeps['parcel'] || allDeps['parcel-bundler']) {
    info.buildTool = 'Parcel'; info.detectedTools.push('Parcel');
  } else if (allDeps['esbuild']) {
    info.buildTool = 'esbuild'; info.detectedTools.push('esbuild');
  } else if (allDeps['tsup']) {
    info.buildTool = 'tsup'; info.detectedTools.push('tsup');
  }

  // ─── Testing Framework ─────────────────────────────────────────────
  if (allDeps['vitest'])                   { info.testingFramework = 'Vitest'; info.detectedTools.push('Vitest'); }
  else if (allDeps['jest'])                { info.testingFramework = 'Jest'; info.detectedTools.push('Jest'); }
  else if (allDeps['mocha'])               { info.testingFramework = 'Mocha'; info.detectedTools.push('Mocha'); }
  if (allDeps['playwright'] || allDeps['@playwright/test']) { info.detectedTools.push('Playwright'); }
  if (allDeps['cypress'])                  { info.detectedTools.push('Cypress'); }

  // ─── Linter ─────────────────────────────────────────────────────────
  if (exists('.eslintrc') || exists('.eslintrc.js') || exists('.eslintrc.json') || exists('.eslintrc.cjs') || exists('eslint.config.js') || exists('eslint.config.mjs') || allDeps['eslint']) {
    info.linter = 'ESLint'; info.detectedTools.push('ESLint');
  }
  if (exists('biome.json') || exists('biome.jsonc') || allDeps['@biomejs/biome']) {
    info.linter = info.linter ? `${info.linter} + Biome` : 'Biome'; info.detectedTools.push('Biome');
  }

  // ─── Formatter ──────────────────────────────────────────────────────
  if (exists('.prettierrc') || exists('.prettierrc.js') || exists('.prettierrc.json') || exists('prettier.config.js') || allDeps['prettier']) {
    info.formatter = 'Prettier'; info.detectedTools.push('Prettier');
  }

  // ─── CSS Framework ─────────────────────────────────────────────────
  if (exists('tailwind.config.js') || exists('tailwind.config.ts') || exists('tailwind.config.cjs') || allDeps['tailwindcss']) {
    info.cssFramework = 'Tailwind CSS'; info.detectedTools.push('Tailwind CSS');
  } else if (allDeps['bootstrap']) {
    info.cssFramework = 'Bootstrap'; info.detectedTools.push('Bootstrap');
  } else if (allDeps['@chakra-ui/react']) {
    info.cssFramework = 'Chakra UI'; info.detectedTools.push('Chakra UI');
  } else if (allDeps['@mui/material']) {
    info.cssFramework = 'Material UI'; info.detectedTools.push('Material UI');
  } else if (allDeps['styled-components']) {
    info.cssFramework = 'styled-components'; info.detectedTools.push('styled-components');
  }

  // ─── Database ───────────────────────────────────────────────────────
  if (exists('prisma') || exists('prisma/schema.prisma') || allDeps['prisma'] || allDeps['@prisma/client']) {
    info.database = 'Prisma'; info.detectedTools.push('Prisma');
  } else if (allDeps['drizzle-orm']) {
    info.database = 'Drizzle'; info.detectedTools.push('Drizzle');
  } else if (allDeps['mongoose'] || allDeps['mongodb']) {
    info.database = 'MongoDB'; info.detectedTools.push('MongoDB');
  } else if (allDeps['pg'] || allDeps['postgres']) {
    info.database = 'PostgreSQL'; info.detectedTools.push('PostgreSQL');
  } else if (allDeps['mysql2'] || allDeps['mysql']) {
    info.database = 'MySQL'; info.detectedTools.push('MySQL');
  } else if (allDeps['better-sqlite3'] || allDeps['sqlite3']) {
    info.database = 'SQLite'; info.detectedTools.push('SQLite');
  }

  // ─── Monorepo ───────────────────────────────────────────────────────
  if (exists('turbo.json'))               { info.monorepo = true; info.detectedTools.push('TurboRepo'); }
  if (exists('nx.json'))                  { info.monorepo = true; info.detectedTools.push('Nx'); }
  if (exists('pnpm-workspace.yaml'))      { info.monorepo = true; info.detectedTools.push('pnpm Workspace'); }
  if (pkg && pkg.workspaces)              { info.monorepo = true; info.detectedTools.push('Yarn/npm Workspace'); }
  if (exists('lerna.json'))               { info.monorepo = true; info.detectedTools.push('Lerna'); }

  // ─── Container / CI ─────────────────────────────────────────────────
  if (exists('Dockerfile') || exists('docker-compose.yml') || exists('docker-compose.yaml') || exists('.dockerignore')) {
    info.containerized = true; info.detectedTools.push('Docker');
  }
  if (exists('.github/workflows') || exists('.github/actions')) {
    info.ci = 'GitHub Actions'; info.detectedTools.push('GitHub Actions');
  } else if (exists('.gitlab-ci.yml')) {
    info.ci = 'GitLab CI'; info.detectedTools.push('GitLab CI');
  } else if (exists('.circleci')) {
    info.ci = 'CircleCI'; info.detectedTools.push('CircleCI');
  } else if (exists('Jenkinsfile')) {
    info.ci = 'Jenkins'; info.detectedTools.push('Jenkins');
  }

  // ─── Git detection ──────────────────────────────────────────────────
  if (exists('.git')) info.detectedTools.push('Git');

  // ─── Config files ───────────────────────────────────────────────────
  const configPatterns = [
    'package.json', 'tsconfig.json', 'vite.config.*', 'webpack.config.*',
    'next.config.*', 'nuxt.config.*', '.eslintrc*', 'eslint.config.*',
    '.prettierrc*', 'prettier.config.*', 'tailwind.config.*',
    'docker-compose.*', 'Dockerfile', '.env', '.env.*',
    'turbo.json', 'nx.json', 'jest.config.*', 'vitest.config.*',
    'biome.json', 'biome.jsonc', '.editorconfig',
  ];
  for (const p of configPatterns) {
    if (p.includes('*')) {
      const base = p.replace('*', '');
      try {
        const entries = fs.readdirSync(rootDir);
        entries.filter(e => e.startsWith(base)).forEach(e => info.configFiles.push(e));
      } catch (_) {}
    } else if (exists(p)) {
      info.configFiles.push(p);
    }
  }

  // Deduplicate
  info.detectedTools = [...new Set(info.detectedTools)];
  info.configFiles = [...new Set(info.configFiles)];

  return info;
}

module.exports = { detectProject };
