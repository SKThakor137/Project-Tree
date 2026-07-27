/**
 * Universal Multi-Language Parser
 *
 * Extracts deep code relationships from any programming language and converts
 * them into the Universal Graph Model format. Each language has its own parser
 * section that detects imports, components, hooks, services, routes, models, etc.
 *
 * Architecture:  Source Files → Universal Parser → UniversalGraphBuilder → Graph Model
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { UniversalGraphBuilder, NODE_TYPES, EDGE_TYPES } = require('./universalGraph.js');

// ─── Language Detection ──────────────────────────────────────────────────────

const LANG_MAP = {
  '.js': 'JavaScript', '.jsx': 'JavaScript', '.mjs': 'JavaScript', '.cjs': 'JavaScript',
  '.ts': 'TypeScript', '.tsx': 'TypeScript',
  '.vue': 'Vue', '.svelte': 'Svelte',
  '.py': 'Python',
  '.php': 'PHP',
  '.java': 'Java', '.kt': 'Kotlin', '.kts': 'Kotlin',
  '.dart': 'Dart',
  '.go': 'Go',
  '.rs': 'Rust',
  '.cs': 'C#',
  '.rb': 'Ruby',
  '.c': 'C', '.cpp': 'C++', '.h': 'C', '.hpp': 'C++',
  '.swift': 'Swift',
  '.css': 'CSS', '.scss': 'SCSS', '.less': 'LESS', '.sass': 'SASS',
  '.html': 'HTML', '.htm': 'HTML',
  '.json': 'JSON', '.yaml': 'YAML', '.yml': 'YAML', '.toml': 'TOML',
  '.md': 'Markdown', '.mdx': 'MDX',
  '.sql': 'SQL',
  '.graphql': 'GraphQL', '.gql': 'GraphQL',
  '.proto': 'Protobuf',
  '.xml': 'XML',
};

function detectLanguage(filePath) {
  return LANG_MAP[path.extname(filePath).toLowerCase()] || 'Unknown';
}

// ─── Framework Detection ─────────────────────────────────────────────────────

function detectFrameworks(files, rootDir) {
  const frameworks = new Set();
  const hasFile = (name) => {
    for (const f of files) {
      const rel = path.relative(rootDir, f.path).replace(/\\/g, '/');
      const base = path.basename(rel);
      if (base === name || rel === name) return true;
    }
    return false;
  };

  // JavaScript Frameworks
  if (hasFile('next.config.js') || hasFile('next.config.mjs') || hasFile('next.config.ts')) frameworks.add('Next.js');
  if (hasFile('nuxt.config.js') || hasFile('nuxt.config.ts')) frameworks.add('Nuxt.js');
  if (hasFile('svelte.config.js')) frameworks.add('Svelte');
  if (hasFile('angular.json')) frameworks.add('Angular');
  if (hasFile('vite.config.js') || hasFile('vite.config.ts')) frameworks.add('Vite');

  // Backend
  if (hasFile('nest-cli.json') || hasFile('tsconfig.build.json')) frameworks.add('NestJS');
  if (hasFile('artisan')) frameworks.add('Laravel');
  if (hasFile('manage.py')) frameworks.add('Django');
  if (hasFile('Gemfile')) frameworks.add('Ruby on Rails');
  if (hasFile('go.mod')) frameworks.add('Go');
  if (hasFile('Cargo.toml')) frameworks.add('Rust');
  if (hasFile('pubspec.yaml')) frameworks.add('Flutter');
  if (hasFile('pom.xml') || hasFile('build.gradle') || hasFile('build.gradle.kts')) frameworks.add('Java/Spring');

  // Check package.json for dependencies
  for (const f of files) {
    if (path.basename(f.path) === 'package.json') {
      try {
        const pkg = JSON.parse(fs.readFileSync(f.path, 'utf8'));
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (allDeps.react || allDeps['react-dom']) frameworks.add('React');
        if (allDeps.vue) frameworks.add('Vue');
        if (allDeps.express) frameworks.add('Express');
        if (allDeps['@nestjs/core']) frameworks.add('NestJS');
        if (allDeps.redux || allDeps['@reduxjs/toolkit']) frameworks.add('Redux');
        if (allDeps.zustand) frameworks.add('Zustand');
        if (allDeps.mobx) frameworks.add('MobX');
        if (allDeps.pinia) frameworks.add('Pinia');
        if (allDeps.vuex) frameworks.add('Vuex');
        if (allDeps['react-native']) frameworks.add('React Native');
      } catch (_) { }
      break;
    }
  }

  return Array.from(frameworks);
}

// ─── Node Type Detection ─────────────────────────────────────────────────────

function detectNodeType(filePath, content, language) {
  const normPath = filePath.replace(/\\/g, '/').toLowerCase();
  const baseName = path.basename(normPath);
  const ext = path.extname(normPath);

  // Config files
  if (/\.(config|rc|env|lock)\b/i.test(baseName) || /^\./.test(baseName) || /^(tsconfig|jsconfig|package|composer|cargo|pubspec|go\.mod|go\.sum|gemfile|makefile|dockerfile|procfile)/i.test(baseName)) {
    return 'CONFIG';
  }

  // Documentation
  if (/\.(md|mdx|txt|rst|adoc)$/i.test(ext) || /^(readme|changelog|contributing|license|code_of_conduct)/i.test(baseName)) {
    return 'DOCUMENTATION';
  }

  // Tests
  if (/\.(test|spec|_test|_spec)\./i.test(baseName) || /\/__(tests|specs)__\//i.test(normPath) || /\/(test|tests|spec|specs)\//i.test(normPath)) {
    return 'TEST';
  }

  // Assets
  if (/\.(css|scss|sass|less|svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|otf)$/i.test(ext)) {
    return 'ASSET';
  }

  // Entry points
  if (/^(index|main|app|server)\.(js|ts|tsx|jsx|py|go|php|rb|rs|java|dart|c|cpp)$/i.test(baseName)) {
    if (!normPath.includes('/components/') && !normPath.includes('/utils/') && !normPath.includes('/helpers/')) {
      return 'ENTRY';
    }
  }

  // Content-based detection for Dart / Flutter
  if (ext === '.dart' && content) {
    if (/extends\s+StatelessWidget|extends\s+StatefulWidget/.test(content)) return 'WIDGET';
    if (/extends\s+Bloc\b/.test(content)) return 'BLOC';
    if (/extends\s+Cubit\b/.test(content)) return 'CUBIT';
  }

  // Layouts
  if (/^layout\.(tsx|jsx|js|ts|vue|svelte)$/i.test(baseName) || /\/layouts?\//i.test(normPath)) {
    return 'LAYOUT';
  }

  // Pages
  if (/^page\.(tsx|jsx|js|ts)$/i.test(baseName) || /\/pages?\//i.test(normPath) || /^view\.vue$/i.test(baseName)) {
    return 'PAGE';
  }

  // Routes
  if (/(?:route|routing|urls\.py|endpoint|endpoints)/i.test(normPath) || /\/api\//i.test(normPath)) {
    return 'ROUTE';
  }

  // Middleware
  if (/(?:middleware|middlewares|interceptor|guard|guards)/i.test(normPath)) {
    return 'MIDDLEWARE';
  }

  // Controllers
  if (/(?:controller|ctrl|handler|handlers|views\.py)/i.test(normPath)) {
    return 'CONTROLLER';
  }

  // Services
  if (/(?:service|services|provider|providers|usecase)/i.test(normPath)) {
    return 'SERVICE';
  }

  // Models
  if (/(?:model|models|schema|schemas|entity|entities|prisma)/i.test(normPath)) {
    return 'MODEL';
  }

  // Repository
  if (/(?:repository|repositories|repo|repos|dao)/i.test(normPath)) {
    return 'REPOSITORY';
  }

  // Store / State
  if (/(?:store|stores|state|redux|slice|reducer|action|zustand|mobx|pinia|vuex|bloc|cubit|riverpod)/i.test(normPath)) {
    return 'STORE';
  }

  // Hooks
  if (/(?:hook|hooks|composable|composables)/i.test(normPath) || /^use[A-Z]/.test(path.basename(filePath, ext))) {
    return 'HOOK';
  }

  // Context
  if (/(?:context|contexts)/i.test(normPath)) {
    return 'CONTEXT';
  }

  // Components — check content for JSX/component patterns
  if (/(?:component|components|widget|widgets|ui\/)/i.test(normPath)) {
    return 'COMPONENT';
  }

  // Jobs / Workers / Queues
  if (/(?:job|jobs|worker|workers|queue|queues|cron)/i.test(normPath)) {
    if (/worker/i.test(normPath)) return 'WORKER';
    if (/queue/i.test(normPath)) return 'QUEUE';
    return 'JOB';
  }

  // Events / Listeners
  if (/(?:event|events)/i.test(normPath)) return 'EVENT';
  if (/(?:listener|listeners|subscriber|subscribers)/i.test(normPath)) return 'LISTENER';

  // Utilities
  if (/(?:util|utils|helper|helpers|lib|tools|common)/i.test(normPath)) {
    return 'UTILITY';
  }

  // Content-based detection for JS/TS
  if (content && ['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
    const top500 = content.substring(0, 500);
    if (/['"]use client['"]/m.test(top500)) return 'COMPONENT';
    if (/['"]use server['"]/m.test(top500)) return 'SERVICE';

    // React component detection (PascalCase export with JSX)
    if (/export\s+(default\s+)?function\s+[A-Z]/.test(content) && /<\w+/.test(content)) return 'COMPONENT';
    if (/export\s+(default\s+)?class\s+[A-Z]/.test(content) && /render\s*\(/.test(content)) return 'COMPONENT';
  }

  return 'FILE';
}

// ─── Flutter Package Name Cache ──────────────────────────────────────────────

let _cachedFlutterPkgName = undefined;
let _cachedRootDir = null;

function getFlutterPackageName(rootDir) {
  if (_cachedRootDir === rootDir && _cachedFlutterPkgName !== undefined) {
    return _cachedFlutterPkgName;
  }
  _cachedRootDir = rootDir;
  _cachedFlutterPkgName = null;
  const pubspecPath = path.join(rootDir, 'pubspec.yaml');
  if (fs.existsSync(pubspecPath)) {
    try {
      const pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
      const nameMatch = pubspecContent.match(/^name:\s*([a-zA-Z0-9_]+)/m);
      if (nameMatch) {
        _cachedFlutterPkgName = nameMatch[1];
      }
    } catch (_) {}
  }
  return _cachedFlutterPkgName;
}

// ─── Relationship Extraction ─────────────────────────────────────────────────

/**
 * Extract all relationships from file content based on language.
 * Returns an array of { target, type, metadata } objects.
 */
function extractRelationships(filePath, rootDir, content, language) {
  if (!content) return [];
  const relationships = [];
  const ext = path.extname(filePath).toLowerCase();
  const fileDir = path.dirname(filePath);
  let m;

  // ── JavaScript / TypeScript ──
  if (['JavaScript', 'TypeScript', 'Vue', 'Svelte', 'MDX'].includes(language)) {
    // Standard imports
    const importRegex = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?['"](.*?)['"]|require\(['"](.*?)['"]\)|import\(['"](.*?)['"]\)/g;
    while ((m = importRegex.exec(content)) !== null) {
      const imp = m[1] || m[2] || m[3];
      if (!imp) continue;

      if (imp.startsWith('.') || imp.startsWith('@/')) {
        // Local import
        const resolved = resolveImport(fileDir, rootDir, imp);
        if (resolved) {
          relationships.push({ target: resolved, type: 'IMPORTS' });
        }
      } else {
        // External package
        relationships.push({ target: `pkg:${imp.split('/')[0]}`, type: 'EXTERNAL_PACKAGE', metadata: { package: imp } });
      }
    }

    // React Hooks
    const hookRegex = /\b(use[A-Z]\w+)\s*\(/g;
    while ((m = hookRegex.exec(content)) !== null) {
      const hookName = m[1];
      if (['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useReducer', 'useLayoutEffect', 'useImperativeHandle', 'useDebugValue', 'useId', 'useTransition', 'useDeferredValue', 'useSyncExternalStore', 'useInsertionEffect'].includes(hookName)) continue;
      // Custom hook — find its file
      relationships.push({ target: `hook:${hookName}`, type: 'HOOK_USAGE', metadata: { hook: hookName } });
    }

    // React Context
    if (/\buse[Cc]ontext\s*\(/.test(content) || /\bcreateContext\s*\(/.test(content)) {
      const ctxMatch = content.match(/\buse[Cc]ontext\s*\(\s*(\w+)/g);
      if (ctxMatch) {
        for (const cm of ctxMatch) {
          const name = cm.match(/\(\s*(\w+)/);
          if (name) relationships.push({ target: `ctx:${name[1]}`, type: 'CONTEXT_USAGE', metadata: { context: name[1] } });
        }
      }
    }

    // Redux / Zustand / MobX / Pinia / Vuex
    if (/\buseSelector\b|\buseDispatch\b|\bcreateSlice\b|\bconfigureStore\b/.test(content)) {
      relationships.push({ target: 'state:redux', type: 'REDUX', metadata: { stateLib: 'Redux' } });
    }
    if (/\buseStore\b.*zustand|\bcreate\b.*zustand|from\s+['"]zustand['"]/i.test(content)) {
      relationships.push({ target: 'state:zustand', type: 'ZUSTAND', metadata: { stateLib: 'Zustand' } });
    }
    if (/\bobserver\b|\bmakeObservable\b|\bmakeAutoObservable\b/i.test(content)) {
      relationships.push({ target: 'state:mobx', type: 'MOBX', metadata: { stateLib: 'MobX' } });
    }
    if (/\bdefineStore\b|\buse\w+Store\b.*pinia|from\s+['"]pinia['"]/i.test(content)) {
      relationships.push({ target: 'state:pinia', type: 'PINIA', metadata: { stateLib: 'Pinia' } });
    }
    if (/\bmapState\b|\bmapGetters\b|\bmapMutations\b|\bmapActions\b|from\s+['"]vuex['"]/i.test(content)) {
      relationships.push({ target: 'state:vuex', type: 'VUEX', metadata: { stateLib: 'Vuex' } });
    }

    // API calls
    if (/\bfetch\s*\(|\baxios\b|\b\$http\b|\bhttp\.\w+\(/.test(content)) {
      const apiMatch = content.match(/(?:fetch|axios\.\w+|http\.\w+)\s*\(\s*[`'"](\/[^`'"]*)[`'"]/g);
      if (apiMatch) {
        for (const am of apiMatch) {
          const url = am.match(/[`'"](\/[^`'"]*)[`'"]/);
          if (url) relationships.push({ target: `api:${url[1]}`, type: 'API_CALL', metadata: { url: url[1] } });
        }
      }
    }

    // GraphQL
    if (/\bgql\s*`|\buseQuery\b|\buseMutation\b|\buseLazyQuery\b|\buseSubscription\b/.test(content)) {
      relationships.push({ target: 'graphql:usage', type: 'GRAPHQL_QUERY' });
    }

    // CSS Module imports
    const cssModuleRegex = /import\s+\w+\s+from\s+['"](.+\.module\.(css|scss|sass|less))['"]/g;
    while ((m = cssModuleRegex.exec(content)) !== null) {
      const resolved = resolveImport(fileDir, rootDir, m[1]);
      if (resolved) relationships.push({ target: resolved, type: 'CSS_MODULE' });
    }

    // SCSS / CSS imports
    const styleImportRegex = /import\s+['"](.+\.(css|scss|sass|less))['"]/g;
    while ((m = styleImportRegex.exec(content)) !== null) {
      const resolved = resolveImport(fileDir, rootDir, m[1]);
      if (resolved) relationships.push({ target: resolved, type: 'SCSS' });
    }
  }

  // ── Python ──
  if (language === 'Python') {
    const pyFromImport = /from\s+(\.?\.?[a-zA-Z0-9_.]+)\s+import/g;
    while ((m = pyFromImport.exec(content)) !== null) {
      const imp = m[1];
      if (imp.startsWith('.')) {
        const relPath = imp.replace(/\./g, '/') + '.py';
        const resolved = resolveImport(fileDir, rootDir, relPath);
        if (resolved) relationships.push({ target: resolved, type: 'IMPORTS' });
      } else {
        const pyPath = imp.replace(/\./g, '/') + '.py';
        const resolved = resolveImport(rootDir, rootDir, pyPath) || resolveImport(rootDir, rootDir, './' + pyPath);
        if (resolved) relationships.push({ target: resolved, type: 'IMPORTS' });
        else relationships.push({ target: `pkg:${imp.split('.')[0]}`, type: 'EXTERNAL_PACKAGE', metadata: { package: imp } });
      }
    }

    const pyImport = /^import\s+([a-zA-Z0-9_.]+)/gm;
    while ((m = pyImport.exec(content)) !== null) {
      const imp = m[1];
      const pyPath = imp.replace(/\./g, '/') + '.py';
      const resolved = resolveImport(rootDir, rootDir, pyPath) || resolveImport(rootDir, rootDir, './' + pyPath);
      if (resolved) relationships.push({ target: resolved, type: 'IMPORTS' });
      else relationships.push({ target: `pkg:${imp.split('.')[0]}`, type: 'EXTERNAL_PACKAGE' });
    }

    // Django patterns
    if (/class\s+\w+\(.*(?:models\.Model|Model)\)/.test(content)) {
      relationships.push({ target: 'django:models', type: 'DATABASE_WRITE', metadata: { orm: 'Django' } });
    }
    if (/class\s+\w+\(.*(?:APIView|ViewSet|ModelViewSet|GenericAPIView)\)/.test(content)) {
      relationships.push({ target: 'django:views', type: 'ROUTE_HANDLER' });
    }
    if (/\bpath\s*\(|\burl\s*\(|\brouter\.register\b/.test(content)) {
      relationships.push({ target: 'django:urls', type: 'ROUTE_HANDLER' });
    }
    // FastAPI
    if (/@app\.(get|post|put|delete|patch)\s*\(|@router\.(get|post|put|delete|patch)\s*\(/.test(content)) {
      relationships.push({ target: 'fastapi:routes', type: 'ROUTE_HANDLER', metadata: { framework: 'FastAPI' } });
    }
    // Celery
    if (/@(app|celery)\.task|@shared_task/.test(content)) {
      relationships.push({ target: 'celery:tasks', type: 'JOB_DISPATCH', metadata: { queue: 'Celery' } });
    }
  }

  // ── PHP / Laravel ──
  if (language === 'PHP') {
    // use statements
    const phpUse = /use\s+([A-Za-z0-9_\\]+)/g;
    while ((m = phpUse.exec(content)) !== null) {
      const ns = m[1].replace(/\\\\/g, '\\');
      relationships.push({ target: `php:${ns}`, type: 'IMPORTS', metadata: { namespace: ns } });
    }

    // require/include
    const phpRequire = /(?:require|require_once|include|include_once)\s*\(?\s*['"](.+?)['"]/g;
    while ((m = phpRequire.exec(content)) !== null) {
      const resolved = resolveImport(fileDir, rootDir, m[1]);
      if (resolved) relationships.push({ target: resolved, type: 'IMPORTS' });
    }

    // Laravel patterns
    if (/extends\s+Controller\b/.test(content)) {
      relationships.push({ target: 'laravel:controller', type: 'EXTENDS' });
    }
    if (/extends\s+Model\b|extends\s+Eloquent\b/.test(content)) {
      relationships.push({ target: 'laravel:model', type: 'DATABASE_WRITE' });
    }
    if (/Route::(get|post|put|delete|patch|resource|apiResource)\s*\(/.test(content)) {
      relationships.push({ target: 'laravel:routes', type: 'ROUTE_HANDLER' });
    }
    if (/class\s+\w+\s+extends\s+Middleware|implements\s+\w*Middleware/.test(content)) {
      relationships.push({ target: 'laravel:middleware', type: 'MIDDLEWARE_USAGE' });
    }
  }

  // ── Java / Kotlin ──
  if (language === 'Java' || language === 'Kotlin') {
    // Import statements
    const javaImport = /import\s+([\w.]+)/g;
    while ((m = javaImport.exec(content)) !== null) {
      relationships.push({ target: `java:${m[1]}`, type: 'IMPORTS', metadata: { package: m[1] } });
    }

    // Spring Boot annotations
    if (/@RestController|@Controller/.test(content)) {
      relationships.push({ target: 'spring:controller', type: 'ROUTE_HANDLER' });
    }
    if (/@Service/.test(content)) {
      relationships.push({ target: 'spring:service', type: 'SERVICE_USAGE' });
    }
    if (/@Repository/.test(content)) {
      relationships.push({ target: 'spring:repository', type: 'REPOSITORY_USAGE' });
    }
    if (/@Entity|@Table/.test(content)) {
      relationships.push({ target: 'spring:entity', type: 'DATABASE_WRITE' });
    }
    if (/@Autowired|@Inject/.test(content)) {
      relationships.push({ target: 'spring:di', type: 'DEPENDENCY_INJECT' });
    }
    if (/@RequestMapping|@GetMapping|@PostMapping|@PutMapping|@DeleteMapping/.test(content)) {
      relationships.push({ target: 'spring:routes', type: 'ROUTE_HANDLER' });
    }

    // Class hierarchy
    const classExtends = /class\s+\w+\s+extends\s+(\w+)/g;
    while ((m = classExtends.exec(content)) !== null) {
      relationships.push({ target: `class:${m[1]}`, type: 'EXTENDS', metadata: { parent: m[1] } });
    }
    const classImpl = /class\s+\w+.*?implements\s+([\w,\s]+)/g;
    while ((m = classImpl.exec(content)) !== null) {
      const interfaces = m[1].split(',').map(s => s.trim()).filter(Boolean);
      for (const iface of interfaces) {
        relationships.push({ target: `interface:${iface}`, type: 'IMPLEMENTS', metadata: { interface: iface } });
      }
    }
  }

  // ── Dart / Flutter ──
  if (language === 'Dart') {
    const pkgName = getFlutterPackageName(rootDir);
    // Import statements
    const dartImport = /import\s+['"](.+?)['"]/g;
    while ((m = dartImport.exec(content)) !== null) {
      const imp = m[1];
      if (imp.startsWith('package:')) {
        const afterPkg = imp.replace(/^package:/, '');
        const slashIdx = afterPkg.indexOf('/');
        const importPkgName = slashIdx !== -1 ? afterPkg.substring(0, slashIdx) : afterPkg;
        const subPath = slashIdx !== -1 ? afterPkg.substring(slashIdx + 1) : '';

        let resolved = null;
        if (pkgName && importPkgName === pkgName) {
          resolved = resolveImport(rootDir, rootDir, path.join('lib', subPath)) ||
                     resolveImport(rootDir, rootDir, subPath);
        } else if (subPath) {
          resolved = resolveImport(rootDir, rootDir, path.join('lib', subPath)) ||
                     resolveImport(rootDir, rootDir, subPath);
        }

        if (resolved) {
          relationships.push({ target: resolved, type: 'IMPORTS' });
        } else {
          relationships.push({ target: `dart:${importPkgName}`, type: 'EXTERNAL_PACKAGE', metadata: { package: imp } });
        }
      } else {
        const resolved = resolveImport(fileDir, rootDir, imp) || resolveImport(path.join(rootDir, 'lib'), rootDir, imp);
        if (resolved) relationships.push({ target: resolved, type: 'IMPORTS' });
      }
    }

    // BLoC / Cubit / Riverpod / Provider
    if (/extends\s+Bloc\b/.test(content)) {
      relationships.push({ target: 'flutter:bloc', type: 'BLOC_PATTERN' });
    }
    if (/extends\s+Cubit\b/.test(content)) {
      relationships.push({ target: 'flutter:cubit', type: 'CUBIT_PATTERN' });
    }
    if (/\bProviderScope\b|\bref\.watch\b|\bref\.read\b|\bStateNotifierProvider\b|\bFutureProvider\b/.test(content)) {
      relationships.push({ target: 'flutter:riverpod', type: 'RIVERPOD' });
    }
  }

  // ── Go ──
  if (language === 'Go') {
    const goImportBlock = /import\s*\(([\s\S]*?)\)/g;
    while ((m = goImportBlock.exec(content)) !== null) {
      const lines = m[1].split(/\r?\n/);
      for (const l of lines) {
        const lineMatch = l.match(/["'](.+?)["']/);
        if (lineMatch) {
          const imp = lineMatch[1];
          if (imp.startsWith('.') || imp.includes('/')) {
            relationships.push({ target: `go:${imp}`, type: 'IMPORTS', metadata: { package: imp } });
          }
        }
      }
    }

    const goSingleImport = /import\s+["'](.+?)["']/g;
    while ((m = goSingleImport.exec(content)) !== null) {
      relationships.push({ target: `go:${m[1]}`, type: 'IMPORTS', metadata: { package: m[1] } });
    }

    // Handler functions (common Go web pattern)
    if (/func\s+\w+\(w\s+http\.ResponseWriter/.test(content) || /\.HandleFunc\(/.test(content)) {
      relationships.push({ target: 'go:http', type: 'ROUTE_HANDLER' });
    }
  }

  // ── Rust ──
  if (language === 'Rust') {
    // use statements
    const rustUse = /use\s+([\w:]+)/g;
    while ((m = rustUse.exec(content)) !== null) {
      relationships.push({ target: `rust:${m[1]}`, type: 'IMPORTS', metadata: { crate: m[1] } });
    }
    // mod statements
    const rustMod = /mod\s+(\w+)/g;
    while ((m = rustMod.exec(content)) !== null) {
      relationships.push({ target: `rust:mod:${m[1]}`, type: 'IMPORTS', metadata: { module: m[1] } });
    }
    // Trait implementations
    if (/impl\s+\w+\s+for\s+\w+/.test(content)) {
      const traitImpl = /impl\s+(\w+)\s+for\s+(\w+)/g;
      while ((m = traitImpl.exec(content)) !== null) {
        relationships.push({ target: `trait:${m[1]}`, type: 'IMPLEMENTS', metadata: { trait: m[1], struct: m[2] } });
      }
    }
  }

  // ── C# / .NET ──
  if (language === 'C#') {
    const csUsing = /using\s+([\w.]+)/g;
    while ((m = csUsing.exec(content)) !== null) {
      relationships.push({ target: `cs:${m[1]}`, type: 'IMPORTS', metadata: { namespace: m[1] } });
    }

    // ASP.NET patterns
    if (/\[ApiController\]|\[Route\(/.test(content) || /:\s*ControllerBase\b|:\s*Controller\b/.test(content)) {
      relationships.push({ target: 'dotnet:controller', type: 'ROUTE_HANDLER' });
    }
    if (/\[HttpGet\]|\[HttpPost\]|\[HttpPut\]|\[HttpDelete\]/.test(content)) {
      relationships.push({ target: 'dotnet:routes', type: 'ROUTE_HANDLER' });
    }
    if (/class\s+\w+.*?:\s*DbContext\b/.test(content) || /DbSet\s*</.test(content)) {
      relationships.push({ target: 'dotnet:ef', type: 'DATABASE_WRITE', metadata: { orm: 'Entity Framework' } });
    }
    // DI
    if (/services\.Add(Scoped|Transient|Singleton)\b/.test(content) || /\[Inject\]/.test(content)) {
      relationships.push({ target: 'dotnet:di', type: 'DEPENDENCY_INJECT' });
    }
  }

  // ── Ruby ──
  if (language === 'Ruby') {
    const rbRequire = /require(?:_relative)?\s+['"](.+?)['"]/g;
    while ((m = rbRequire.exec(content)) !== null) {
      const imp = m[1];
      if (m[0].includes('require_relative')) {
        const resolved = resolveImport(fileDir, rootDir, imp + '.rb');
        if (resolved) relationships.push({ target: resolved, type: 'IMPORTS' });
      } else {
        relationships.push({ target: `ruby:${imp}`, type: 'EXTERNAL_PACKAGE' });
      }
    }

    // Rails patterns
    if (/class\s+\w+\s*<\s*ApplicationController\b/.test(content)) {
      relationships.push({ target: 'rails:controller', type: 'EXTENDS' });
    }
    if (/class\s+\w+\s*<\s*ApplicationRecord\b|class\s+\w+\s*<\s*ActiveRecord::Base\b/.test(content)) {
      relationships.push({ target: 'rails:model', type: 'DATABASE_WRITE' });
    }
    if (/has_many|has_one|belongs_to|has_and_belongs_to_many/.test(content)) {
      relationships.push({ target: 'rails:associations', type: 'DATABASE_READ' });
    }
  }

  // ── C / C++ ──
  if (language === 'C' || language === 'C++') {
    const cInclude = /#include\s*["'](.+?)["']/g;
    while ((m = cInclude.exec(content)) !== null) {
      const resolved = resolveImport(fileDir, rootDir, m[1]);
      if (resolved) relationships.push({ target: resolved, type: 'IMPORTS' });
      else relationships.push({ target: `c:${m[1]}`, type: 'IMPORTS' });
    }
  }

  // ── Environment variables (any language) ──
  if (/process\.env\.|os\.environ|getenv\(|ENV\[|env\(/.test(content)) {
    relationships.push({ target: 'env:variables', type: 'ENV_USAGE' });
  }

  return relationships;
}

// ─── Import Resolver ─────────────────────────────────────────────────────────

// ─── Import Resolver ─────────────────────────────────────────────────────────

function resolveImport(baseDir, rootDir, target) {
  if (!target || target.startsWith('pkg:')) return null;

  // Handle @/ or ~/ path aliases (Next.js / React / Vue / Vite)
  if (target.startsWith('@/') || target.startsWith('~/')) {
    const rel = target.slice(2);
    const candidates = [
      path.resolve(rootDir, rel),
      path.resolve(rootDir, 'src', rel),
      path.resolve(rootDir, 'frontend', rel),
      path.resolve(rootDir, 'frontend', 'src', rel),
      path.resolve(rootDir, 'app', rel),
      path.resolve(baseDir, rel),
    ];
    for (const cand of candidates) {
      const res = tryResolveFile(cand, rootDir);
      if (res) return res;
    }
  }

  // Handle relative imports (./ or ../)
  if (target.startsWith('.')) {
    const cand = path.resolve(baseDir, target);
    const res = tryResolveFile(cand, rootDir);
    if (res) return res;
  }

  // Direct resolve from baseDir
  const candBase = path.resolve(baseDir, target);
  const resBase = tryResolveFile(candBase, rootDir);
  if (resBase) return resBase;

  // Direct resolve from rootDir
  const candRoot = path.resolve(rootDir, target);
  const resRoot = tryResolveFile(candRoot, rootDir);
  if (resRoot) return resRoot;

  // Python module paths (e.g. apps.accounts.models or backend.apps.accounts.models)
  const pyRel = target.replace(/\./g, '/');
  const pyCandidates = [
    path.resolve(rootDir, pyRel),
    path.resolve(rootDir, 'backend', pyRel),
    path.resolve(rootDir, 'src', pyRel),
    path.resolve(baseDir, pyRel),
  ];
  for (const cand of pyCandidates) {
    const res = tryResolveFile(cand, rootDir);
    if (res) return res;
  }

  // Subdirectory search for relative paths (backend, frontend, src, apps, lib)
  const subDirs = ['backend', 'frontend', 'src', 'app', 'apps', 'lib', 'components'];
  for (const sd of subDirs) {
    const candSub = path.resolve(rootDir, sd, target);
    const resSub = tryResolveFile(candSub, rootDir);
    if (resSub) return resSub;
  }

  return null;
}

function tryResolveFile(candidate, rootDir) {
  if (fs.existsSync(candidate) && safeIsFile(candidate)) {
    return path.relative(rootDir, candidate).replace(/\\/g, '/');
  }
  const exts = ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs', '.vue', '.svelte', '.py', '.go', '.php', '.rb', '.rs', '.java', '.kt', '.dart', '.cs', '.c', '.cpp', '.h', '.hpp', '.json', '.css', '.scss'];
  for (const e of exts) {
    const withExt = candidate + e;
    if (fs.existsSync(withExt) && safeIsFile(withExt)) {
      return path.relative(rootDir, withExt).replace(/\\/g, '/');
    }
  }
  for (const e of exts) {
    const idx = path.join(candidate, 'index' + e);
    if (fs.existsSync(idx) && safeIsFile(idx)) {
      return path.relative(rootDir, idx).replace(/\\/g, '/');
    }
    const initPy = path.join(candidate, '__init__' + e);
    if (fs.existsSync(initPy) && safeIsFile(initPy)) {
      return path.relative(rootDir, initPy).replace(/\\/g, '/');
    }
  }
  return null;
}

function safeIsFile(p) {
  try { return fs.statSync(p).isFile(); } catch (_) { return false; }
}

// ─── Content Reader ──────────────────────────────────────────────────────────

function readFileSafely(absPath) {
  try {
    const stat = fs.statSync(absPath);
    if (stat.size > 2 * 1024 * 1024) return null; // Skip > 2MB
    const buf = fs.readFileSync(absPath);
    for (let i = 0; i < Math.min(buf.length, 512); i++) {
      if (buf[i] === 0) return null; // Binary
    }
    return buf.toString('utf8');
  } catch (_) {
    return null;
  }
}

// ─── File Collector ──────────────────────────────────────────────────────────

function collectFiles(node) {
  if (!node) return [];
  const files = [];
  function walk(n) {
    if (!n) return;
    if (!n.children) {
      files.push(n);
    } else {
      for (const c of n.children) walk(c);
    }
  }
  walk(node);
  return files;
}

// ─── Main Graph Generator ────────────────────────────────────────────────────

/**
 * Generate a Universal Graph Model from a scanned project tree.
 *
 * @param {string} rootDir - Absolute path to project root
 * @param {Object} [scannedTree] - Optional pre-scanned tree from scanner.js
 * @returns {Object} Universal Graph Model (ready for visualization or JSON export)
 */
function generateUniversalGraph(rootDir, scannedTree = null) {
  const absRoot = path.resolve(rootDir);

  let tree = scannedTree;
  if (!tree) {
    const { scan } = require('./scanner.js');
    tree = scan(absRoot);
  }

  if (!tree) {
    throw new Error(`Could not scan directory: ${rootDir}`);
  }

  const projectName = tree.name || path.basename(absRoot);
  const builder = new UniversalGraphBuilder(projectName);
  const files = collectFiles(tree);

  // Detect frameworks
  const frameworks = detectFrameworks(files, absRoot);

  // Language stats
  const langStats = {};
  let totalLines = 0;

  // First pass: create file nodes
  const contentMap = {};
  const relPathSet = new Set();
  const folderSet = new Set();

  for (const file of files) {
    const relPath = path.relative(absRoot, file.path).replace(/\\/g, '/');
    if (relPathSet.has(relPath)) continue;
    relPathSet.add(relPath);

    // Track folder hierarchy
    let parentFolder = path.dirname(relPath).replace(/\\/g, '/');
    while (parentFolder && parentFolder !== '.') {
      folderSet.add(parentFolder);
      parentFolder = path.dirname(parentFolder).replace(/\\/g, '/');
    }

    const language = detectLanguage(file.path);
    const content = readFileSafely(file.path);
    contentMap[relPath] = content;

    // Count language stats
    langStats[language] = (langStats[language] || 0) + 1;

    // Count lines
    let lineCount = 0;
    if (content) {
      lineCount = content.split('\n').length;
      totalLines += lineCount;
    }

    const nodeType = detectNodeType(relPath, content, language);

    // Extract functions/classes for description
    let description = '';
    let exportedNames = [];
    let functionNames = [];

    if (content && ['JavaScript', 'TypeScript', 'Vue', 'Svelte'].includes(language)) {
      const namedExports = content.match(/export\s+(?:const|let|var|function|class)\s+(\w+)/g);
      if (namedExports) {
        exportedNames = namedExports.map(e => e.match(/\s(\w+)$/)?.[1]).filter(Boolean);
      }
      const funcs = content.match(/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\()/g);
      if (funcs) {
        functionNames = funcs.map(f => {
          const m = f.match(/(?:function\s+|(?:const|let|var)\s+)(\w+)/);
          return m ? m[1] : null;
        }).filter(Boolean);
      }
      if (exportedNames.length > 0) {
        description = `Exports: ${exportedNames.slice(0, 5).join(', ')}${exportedNames.length > 5 ? '...' : ''}`;
      }
    } else if (content && language === 'Dart') {
      const classes = content.match(/class\s+([A-Z]\w+)/g);
      if (classes) {
        exportedNames = classes.map(c => c.replace(/^class\s+/, '')).filter(Boolean);
      }
      const funcs = content.match(/(?:void|Future<[^>]+>|String|int|double|bool|Widget)\s+([a-z]\w*)\s*\(/g);
      if (funcs) {
        functionNames = funcs.map(f => f.match(/\s+([a-z]\w*)\s*\(/)?.[1]).filter(Boolean);
      }
      if (exportedNames.length > 0) {
        description = `Classes: ${exportedNames.slice(0, 5).join(', ')}${exportedNames.length > 5 ? '...' : ''}`;
      }
    }

    const badges = [];
    if (frameworks.length > 0) {
      const relevantFw = frameworks.find(fw => {
        if (fw === 'React' && ['JavaScript', 'TypeScript'].includes(language)) return true;
        if (fw === 'Vue' && language === 'Vue') return true;
        if (fw === 'Svelte' && language === 'Svelte') return true;
        if (fw === 'Next.js' && ['JavaScript', 'TypeScript'].includes(language)) return true;
        if (fw === 'Django' && language === 'Python') return true;
        if (fw === 'Laravel' && language === 'PHP') return true;
        if (fw === 'Flutter' && language === 'Dart') return true;
        if (fw === 'Express' && ['JavaScript', 'TypeScript'].includes(language)) return true;
        return false;
      });
      if (relevantFw) badges.push(relevantFw);
    }
    if (nodeType === 'ENTRY') badges.push('Entry Point');
    if (nodeType === 'TEST') badges.push('Test');

    builder.addNode({
      id: relPath,
      name: path.basename(relPath),
      type: nodeType,
      filePath: relPath,
      language,
      framework: badges[0] || '',
      description,
      badges,
      status: 'active',
      metadata: {
        size: file.size || 0,
        lines: lineCount,
        exports: exportedNames,
        functions: functionNames,
        ext: path.extname(relPath),
      },
    });
  }

  // Create folder nodes and PARENT_CHILD edges for structure
  for (const folder of folderSet) {
    if (!builder._nodes.has(folder)) {
      builder.addNode({
        id: folder,
        name: path.basename(folder),
        type: 'FOLDER',
        filePath: folder,
        language: '',
        framework: '',
        description: `Directory: ${folder}`,
        badges: ['Folder'],
        status: 'active',
        metadata: { isFolder: true },
      });
    }

    const parent = path.dirname(folder).replace(/\\/g, '/');
    if (parent && parent !== '.' && folderSet.has(parent)) {
      builder.addEdge({
        source: parent,
        target: folder,
        type: 'PARENT_CHILD',
        label: 'Contains',
      });
    }
  }

  // Connect files to parent folders
  for (const relPath of relPathSet) {
    const parent = path.dirname(relPath).replace(/\\/g, '/');
    if (parent && parent !== '.' && builder._nodes.has(parent)) {
      builder.addEdge({
        source: parent,
        target: relPath,
        type: 'PARENT_CHILD',
        label: 'Contains',
      });
    }
  }

  // Second pass: extract relationships and create edges
  for (const relPath of relPathSet) {
    const content = contentMap[relPath];
    if (!content) continue;

    const language = detectLanguage(relPath);
    const absFilePath = path.resolve(absRoot, relPath);
    const relationships = extractRelationships(absFilePath, absRoot, content, language);

    for (const rel of relationships) {
      let targetId = rel.target;

      // Handle virtual package/API/pattern nodes
      if (targetId.includes(':') && !builder._nodes.has(targetId)) {
        const parts = targetId.split(':');
        const prefix = parts[0];
        const name = parts.slice(1).join(':');

        let type = 'PACKAGE';
        if (prefix === 'pkg') type = 'PACKAGE';
        else if (prefix === 'api') type = 'API';
        else if (prefix === 'hook') type = 'HOOK';
        else if (prefix === 'ctx') type = 'CONTEXT';
        else if (prefix === 'state') type = 'STORE';
        else if (prefix === 'django' || prefix === 'rails' || prefix === 'fastapi') type = 'SERVICE';
        else if (prefix === 'env') type = 'ENVIRONMENT';
        else if (prefix === 'flutter') type = 'WIDGET';

        builder.addNode({
          id: targetId,
          name: name || targetId,
          type,
          filePath: targetId,
          language: '',
          framework: prefix,
          description: `Dependency / Pattern: ${targetId}`,
          badges: [prefix.toUpperCase()],
          status: 'active',
          metadata: { isVirtual: true }
        });
      }

      if (builder._nodes.has(targetId)) {
        builder.addEdge({
          source: relPath,
          target: targetId,
          type: rel.type,
          metadata: rel.metadata || {},
        });
      }
    }
  }

  // Set metadata
  builder.setMetadata({
    languages: langStats,
    frameworks,
    totalFiles: files.length,
    totalLines,
  });

  return builder.build();
}

module.exports = {
  generateUniversalGraph,
  detectLanguage,
  detectNodeType,
  extractRelationships,
  detectFrameworks,
  resolveImport,
  collectFiles,
};
