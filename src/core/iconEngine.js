'use strict';

/**
 * Customizable file extension → icon mapping engine.
 *
 * 100+ built-in mappings + support for user-defined JSON override.
 * Zero dependencies.
 */

const fs = require('fs');
const path = require('path');

/** Default icon for unknown extensions. */
const DEFAULT_ICON = '📄';
const DIR_ICON = '📁';

/**
 * Built-in extension → emoji icon map.
 * 100+ entries covering all major languages, configs, assets, and tools.
 */
const BUILT_IN_ICONS = {
  // JavaScript / TypeScript
  '.js': '📄', '.mjs': '📄', '.cjs': '📄',
  '.ts': '📘', '.tsx': '⚛️ ', '.jsx': '⚛️ ',
  '.d.ts': '📘',

  // Web
  '.html': '🌐', '.htm': '🌐', '.xhtml': '🌐',
  '.css': '🎨', '.scss': '🎨', '.sass': '🎨', '.less': '🎨', '.styl': '🎨',
  '.vue': '💚', '.svelte': '🧡', '.astro': '🚀',

  // Data / Config
  '.json': '📋', '.jsonc': '📋', '.json5': '📋',
  '.yml': '⚙️ ', '.yaml': '⚙️ ',
  '.toml': '⚙️ ', '.ini': '⚙️ ', '.cfg': '⚙️ ',
  '.xml': '📰', '.xsd': '📰', '.xsl': '📰',
  '.csv': '📊', '.tsv': '📊',
  '.env': '🔐', '.env.local': '🔐', '.env.production': '🔐',

  // Documentation
  '.md': '📝', '.mdx': '📝',
  '.txt': '📄', '.rst': '📝', '.adoc': '📝',
  '.pdf': '📕', '.doc': '📄', '.docx': '📄',

  // Python
  '.py': '🐍', '.pyw': '🐍', '.pyi': '🐍', '.pyc': '🐍',
  '.pyx': '🐍', '.ipynb': '📓',

  // Go
  '.go': '🐹', '.mod': '🐹', '.sum': '🐹',

  // Rust
  '.rs': '🦀', '.rlib': '🦀',

  // Java / JVM
  '.java': '☕', '.jar': '☕', '.class': '☕',
  '.kt': '🟣', '.kts': '🟣',
  '.scala': '🔴', '.groovy': '🔵',
  '.clj': '🟢', '.cljs': '🟢',

  // C / C++
  '.c': '🔧', '.h': '🔧',
  '.cpp': '🔧', '.cc': '🔧', '.cxx': '🔧',
  '.hpp': '🔧', '.hh': '🔧', '.hxx': '🔧',

  // C#
  '.cs': '🟪', '.csx': '🟪', '.csproj': '🟪',
  '.sln': '🟪',

  // Swift / Objective-C
  '.swift': '🍊',
  '.m': '📱', '.mm': '📱',

  // Ruby
  '.rb': '💎', '.erb': '💎', '.rake': '💎',
  '.gemspec': '💎',

  // PHP
  '.php': '🐘', '.phtml': '🐘',

  // Shell / Scripting
  '.sh': '💻', '.bash': '💻', '.zsh': '💻', '.fish': '💻',
  '.ps1': '💻', '.psm1': '💻', '.bat': '💻', '.cmd': '💻',

  // Database / Query
  '.sql': '🗃️ ', '.graphql': '📡', '.gql': '📡',
  '.prisma': '🔷',

  // Dart / Flutter
  '.dart': '🎯',

  // Elixir / Erlang
  '.ex': '💜', '.exs': '💜', '.erl': '💜', '.hrl': '💜',

  // Haskell
  '.hs': '🟪', '.lhs': '🟪',

  // Lua
  '.lua': '🌙',

  // R
  '.r': '📈', '.R': '📈', '.rmd': '📈',

  // Perl
  '.pl': '🐪', '.pm': '🐪',

  // Images
  '.svg': '🖼️ ', '.png': '🖼️ ', '.jpg': '🖼️ ', '.jpeg': '🖼️ ',
  '.gif': '🖼️ ', '.webp': '🖼️ ', '.ico': '🖼️ ', '.bmp': '🖼️ ',
  '.tiff': '🖼️ ', '.avif': '🖼️ ',

  // Media
  '.mp4': '🎬', '.mov': '🎬', '.avi': '🎬', '.mkv': '🎬', '.webm': '🎬',
  '.mp3': '🎵', '.wav': '🎵', '.flac': '🎵', '.ogg': '🎵', '.aac': '🎵',

  // Fonts
  '.woff': '🔤', '.woff2': '🔤', '.ttf': '🔤', '.otf': '🔤', '.eot': '🔤',

  // Archives
  '.zip': '📦', '.tar': '📦', '.gz': '📦', '.rar': '📦', '.7z': '📦',
  '.bz2': '📦', '.xz': '📦',

  // Config / CI
  '.gitignore': '🙈', '.gitattributes': '🙈',
  '.npmignore': '🙈', '.npmrc': '📦',
  '.dockerignore': '🐳', '.editorconfig': '⚙️ ',
  '.eslintrc': '🔍', '.prettierrc': '✨',
  '.babelrc': '🔄', '.browserslistrc': '🌍',

  // Docker / Infra
  '.dockerfile': '🐳',

  // Lock files
  '.lock': '🔒',

  // Certificates / Keys
  '.pem': '🔑', '.key': '🔑', '.crt': '🔑', '.cer': '🔑',

  // Binary / Compiled
  '.exe': '⚡', '.dll': '⚡', '.so': '⚡', '.dylib': '⚡',
  '.o': '⚡', '.a': '⚡', '.lib': '⚡',
  '.wasm': '⚡',

  // License
  '.license': '📜',

  // Makefiles (by name, not extension)
  '': '📄',
};

/** Special filename → icon mappings (exact match on basename). */
const FILENAME_ICONS = {
  'Dockerfile':      '🐳',
  'docker-compose.yml': '🐳',
  'docker-compose.yaml': '🐳',
  'Makefile':        '🔨',
  'CMakeLists.txt':  '🔨',
  'Rakefile':        '💎',
  'Gemfile':         '💎',
  'LICENSE':         '📜',
  'LICENSE.md':      '📜',
  'CHANGELOG.md':    '📋',
  'CONTRIBUTING.md': '🤝',
  'README.md':       '📖',
  'README':          '📖',
  '.gitignore':      '🙈',
  '.gitmodules':     '🙈',
  '.npmrc':          '📦',
  '.nvmrc':          '📦',
  '.node-version':   '📦',
  'tsconfig.json':   '📘',
  'jest.config.js':  '🃏',
  'vitest.config.ts':'🃏',
  'webpack.config.js':'📦',
  'vite.config.ts':  '⚡',
  'vite.config.js':  '⚡',
  'rollup.config.js':'📦',
  'next.config.js':  '▲ ',
  'next.config.mjs': '▲ ',
  'nuxt.config.ts':  '💚',
  'tailwind.config.js': '🎨',
  '.prettierrc':     '✨',
  '.eslintrc.js':    '🔍',
  '.eslintrc.json':  '🔍',
  'package.json':    '📦',
  'package-lock.json':'🔒',
  'yarn.lock':       '🔒',
  'pnpm-lock.yaml':  '🔒',
  'Cargo.toml':      '🦀',
  'Cargo.lock':      '🔒',
  'go.mod':          '🐹',
  'go.sum':          '🔒',
  'requirements.txt':'🐍',
  'pyproject.toml':  '🐍',
  'setup.py':        '🐍',
  'Pipfile':         '🐍',
  'pubspec.yaml':    '🎯',
};

/**
 * Create an icon resolver with optional custom overrides.
 *
 * @param {Object|string|null} customIcons — custom icon map or path to JSON file
 * @returns {{ getIcon: function(Object): string, dirIcon: string }}
 */
function createIconResolver(customIcons = null) {
  let overrides = {};

  if (typeof customIcons === 'string') {
    // Load from file path
    try {
      const resolved = path.resolve(customIcons);
      if (fs.existsSync(resolved)) {
        overrides = JSON.parse(fs.readFileSync(resolved, 'utf8'));
      }
    } catch (_) {}
  } else if (customIcons && typeof customIcons === 'object') {
    overrides = customIcons;
  }

  const merged = { ...BUILT_IN_ICONS, ...overrides };
  const filenameMap = { ...FILENAME_ICONS, ...(overrides._filenames || {}) };

  const dirIcon = overrides._directory || DIR_ICON;

  /**
   * Get the icon for a ScanNode.
   *
   * @param {Object} node
   * @returns {string}
   */
  function getIcon(node) {
    if (node.children !== undefined) return String(dirIcon).trim() + ' ';

    let raw = DEFAULT_ICON;
    if (filenameMap[node.name]) {
      raw = filenameMap[node.name];
    } else {
      const ext = node.ext || '';
      raw = merged[ext] || DEFAULT_ICON;
    }
    return String(raw).trim() + ' ';
  }

  return { getIcon, dirIcon };
}

module.exports = { createIconResolver, BUILT_IN_ICONS, FILENAME_ICONS, DEFAULT_ICON, DIR_ICON };
