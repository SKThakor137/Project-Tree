'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Clean and format raw comment text into a 1-sentence description.
 *
 * @param {string} rawText
 * @returns {string|null}
 */
function cleanSummaryText(rawText) {
  if (!rawText) return null;

  let cleaned = rawText
    // Remove doc tags like @file, @description, @overview, @module, @brief, @typedef, @param, @returns
    .replace(/@(?:typedef|param|returns?|type|template|see|link)\s*\{[^}]*\}\s*\w*/gi, '')
    .replace(/@(?:file|overview|description|module|brief|doc|typedef|param|returns?|type|template|see|link)\b/gi, '')
    // Remove comment delimiters and markdown headers
    .replace(/^(\/\/|#+|--|;|\/\*+|\*+|\*\/|<!--|-->|'''|""")+/gm, '')
    .replace(/(\/\*+|\*+|\*\/|<!--|-->|'''|""")+$/gm, '')
    // Replace tabs/newlines with spaces
    .replace(/[\r\n\t]+/g, ' ')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return null;

  // Extract the first sentence if multiple sentences exist
  const sentenceMatch = cleaned.match(/^([^.!?]+[.!?])/);
  if (sentenceMatch && sentenceMatch[1] && sentenceMatch[1].length >= 5) {
    cleaned = sentenceMatch[1].trim();
  }

  // Truncate to maximum 90 characters for neat alignment in terminal trees
  if (cleaned.length > 90) {
    cleaned = cleaned.substring(0, 87).trim() + '...';
  }

  // Ensure first letter is capitalized
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Extract top header comment summary from a text file.
 *
 * @param {string} filePath
 * @param {number} [maxLines=35]
 * @returns {string|null}
 */
function extractFileSummary(filePath, maxLines = 35) {
  const fileName = path.basename(filePath).toLowerCase();
  const ext = path.extname(filePath).toLowerCase();

  // Special handling for package.json or JSON manifests
  if (fileName === 'package.json') {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const json = JSON.parse(content);
      if (json.description) return cleanSummaryText(json.description);
    } catch (_) {}
  }

  let fd;
  try {
    fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(4096);
    const bytesRead = fs.readSync(fd, buffer, 0, 4096, 0);
    fs.closeSync(fd);
    fd = null;

    if (bytesRead === 0) return null;

    // Check for null bytes (binary file safety)
    const contentBuffer = buffer.slice(0, bytesRead);
    for (let i = 0; i < contentBuffer.length; i++) {
      if (contentBuffer[i] === 0) return null;
    }

    const contentStr = contentBuffer.toString('utf8');
    const lines = contentStr.split(/\r?\n/).slice(0, maxLines);

    // Special handling for Markdown files (.md)
    if (ext === '.md') {
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('#')) {
          const headerText = trimmed.replace(/^#+\s*/, '').trim();
          if (headerText) return cleanSummaryText(headerText);
        }
        if (trimmed.startsWith('>')) {
          const quoteText = trimmed.replace(/^>\s*/, '').trim();
          if (quoteText) return cleanSummaryText(quoteText);
        }
      }
    }

    let commentLines = [];
    let inBlockComment = false;
    let blockCommentType = null; // 'slashStar', 'html', 'python'

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines, shebangs, directives, or top-level require/import statements before comment start
      if (!inBlockComment && commentLines.length === 0) {
        if (!line) continue;
        if (line.startsWith('#!')) continue;
        if (/^['"]use strict['"];?$/i.test(line)) continue;
        if (/^\/\/\s*@ts-(?:nocheck|check)/i.test(line)) continue;
        if (/^\/\*\s*eslint-/i.test(line)) continue;
        if (/^(?:const|let|var)\s+.*=\s*require\(.*$/i.test(line)) continue;
        if (/^import\s+.*from\s+.*$/i.test(line)) continue;
      }

      // Check block comment start
      if (!inBlockComment) {
        if (line.startsWith('/*')) {
          inBlockComment = true;
          blockCommentType = 'slashStar';
          const stripped = line.replace(/^\/\*+/, '').trim();
          if (stripped && !stripped.endsWith('*/')) commentLines.push(stripped);
          if (line.endsWith('*/') && line.length > 4) {
            commentLines.push(line.replace(/^\/\*+/, '').replace(/\*\/$/, '').trim());
            break;
          }
          continue;
        }
        if (line.startsWith('<!--')) {
          inBlockComment = true;
          blockCommentType = 'html';
          const stripped = line.replace(/^<!--+/, '').trim();
          if (stripped && !stripped.endsWith('-->')) commentLines.push(stripped);
          if (line.endsWith('-->') && line.length > 7) {
            commentLines.push(line.replace(/^<!--+/, '').replace(/--+>$/, '').trim());
            break;
          }
          continue;
        }
        if (line.startsWith('"""') || line.startsWith("'''")) {
          const delim = line.substring(0, 3);
          inBlockComment = true;
          blockCommentType = 'python';
          const stripped = line.substring(3).trim();
          if (stripped && !stripped.endsWith(delim)) commentLines.push(stripped);
          if (line.endsWith(delim) && line.length > 6) {
            commentLines.push(stripped.slice(0, -3).trim());
            break;
          }
          continue;
        }
      }

      // Inside block comment
      if (inBlockComment) {
        if (blockCommentType === 'slashStar' && line.includes('*/')) {
          const contentBefore = line.split('*/')[0].replace(/^\*+/, '').trim();
          if (contentBefore) commentLines.push(contentBefore);
          break;
        }
        if (blockCommentType === 'html' && line.includes('-->')) {
          const contentBefore = line.split('-->')[0].replace(/^<!--+/, '').trim();
          if (contentBefore) commentLines.push(contentBefore);
          break;
        }
        if (blockCommentType === 'python' && (line.includes('"""') || line.includes("'''"))) {
          const contentBefore = line.replace(/"""|'''/g, '').trim();
          if (contentBefore) commentLines.push(contentBefore);
          break;
        }

        const cleanedLine = line.replace(/^\*+/, '').trim();
        if (cleanedLine) commentLines.push(cleanedLine);
        continue;
      }

      // Single line comments
      if (line.startsWith('//') || line.startsWith('#') || line.startsWith('--') || line.startsWith(';')) {
        const cleanedLine = line.replace(/^(\/\/|#|--|;)+/, '').trim();
        if (cleanedLine) commentLines.push(cleanedLine);
        continue;
      }

      // If we encounter code after or without comment, stop
      if (commentLines.length > 0) break;
      if (!line.startsWith('//') && !line.startsWith('#') && !line.startsWith('/*') && !line.startsWith('<!--')) {
        // If code line reached and no comment yet, continue searching a few lines down for JSDoc or module comments
        continue;
      }
    }

    if (commentLines.length > 0) {
      const rawText = commentLines.join(' ');
      const clean = cleanSummaryText(rawText);
      if (clean) return clean;
    }

    // Fallback: Infer from framework role
    try {
      const { detectFrameworkRole } = require('../core/architectureFlow.js');
      const role = detectFrameworkRole(filePath, contentStr);
      if (role && role.role !== 'MODULE') {
        const fallbacks = {
          ENTRY: 'Application entry point.',
          LAYOUT: 'UI Layout wrapper.',
          PAGE: 'Page view component.',
          CLIENT_COMP: 'Client-side UI component.',
          ROUTE: 'API route handler.',
          CONTROLLER: 'Handles incoming requests and responses.',
          SERVICE: 'Business logic and core operations.',
          MODEL: 'Database model or schema definition.',
          MIDDLEWARE: 'Request interception and processing.',
          COMPONENT: 'Reusable UI component.',
          UTILITY: 'Helper utility functions.',
        };
        const description = fallbacks[role.role];
        if (description) {
           return `[Auto] ${description}`;
        }
      }
    } catch (_) {}

    // Fallback 2: Filename pattern matching
    const nameDesc = getDescriptionByFilename(fileName);
    if (nameDesc) return `[Auto] ${nameDesc}`;

    // Fallback 3: Extension-based description
    const extDesc = getDescriptionByExtension(ext);
    if (extDesc) return `[Auto] ${extDesc}`;

    return null;
  } catch (_) {
    return null;
  } finally {
    if (fd) {
      try { fs.closeSync(fd); } catch (_) {}
    }
  }
}

// ─── Filename Pattern Descriptions ────────────────────────────────────────────

const FILENAME_DESCRIPTIONS = [
  [/^package\.json$/i, 'Node.js package manifest and dependency list.'],
  [/^package-lock\.json$/i, 'Locked dependency version tree.'],
  [/^yarn\.lock$/i, 'Yarn locked dependency versions.'],
  [/^pnpm-lock\.yaml$/i, 'pnpm locked dependency versions.'],
  [/^tsconfig[^/]*\.json$/i, 'TypeScript compiler configuration.'],
  [/^jsconfig[^/]*\.json$/i, 'JavaScript project configuration.'],
  [/^\.env/i, 'Environment variables configuration.'],
  [/^\.gitignore$/i, 'Git ignore rules.'],
  [/^\.npmignore$/i, 'npm publish ignore rules.'],
  [/^\.eslintrc/i, 'ESLint linting configuration.'],
  [/^\.prettierrc/i, 'Prettier formatting configuration.'],
  [/^\.babelrc$/i, 'Babel transpiler configuration.'],
  [/^\.browserslistrc$/i, 'Browser compatibility targets.'],
  [/^readme/i, 'Project documentation and overview.'],
  [/^license/i, 'Software license file.'],
  [/^changelog/i, 'Version history and release notes.'],
  [/^contributing/i, 'Contribution guidelines.'],
  [/^dockerfile/i, 'Docker container build instructions.'],
  [/^docker-compose/i, 'Multi-container Docker orchestration.'],
  [/^makefile$/i, 'Build automation rules.'],
  [/^procfile$/i, 'Process type declarations.'],
  [/^jest\.config/i, 'Jest test framework configuration.'],
  [/^vitest\.config/i, 'Vitest test framework configuration.'],
  [/^webpack\.config/i, 'Webpack bundler configuration.'],
  [/^rollup\.config/i, 'Rollup bundler configuration.'],
  [/^postcss\.config/i, 'PostCSS processing configuration.'],
  [/^tailwind\.config/i, 'Tailwind CSS configuration.'],
  [/^vite\.config/i, 'Vite build tool configuration.'],
  [/^next\.config/i, 'Next.js framework configuration.'],
  [/^nuxt\.config/i, 'Nuxt.js framework configuration.'],
  [/^svelte\.config/i, 'Svelte framework configuration.'],
  [/^angular\.json$/i, 'Angular workspace configuration.'],
  [/^manifest\.json$/i, 'App manifest metadata.'],
  [/\.test\.(js|ts|jsx|tsx)$/i, 'Unit test file.'],
  [/\.spec\.(js|ts|jsx|tsx)$/i, 'Test specification file.'],
  [/\.stories\.(js|ts|jsx|tsx)$/i, 'Storybook component story.'],
  [/\.module\.css$/i, 'CSS module scoped styles.'],
  [/\.d\.ts$/i, 'TypeScript type declarations.'],
  [/^seed\.(js|ts)$/i, 'Database seed data script.'],
  [/^migrate/i, 'Database migration script.'],
  [/^schema\.(prisma|graphql|gql)$/i, 'Database/API schema definition.'],
];

function getDescriptionByFilename(fileName) {
  for (const [pattern, desc] of FILENAME_DESCRIPTIONS) {
    if (pattern.test(fileName)) return desc;
  }
  return null;
}

// ─── Extension-Based Descriptions ─────────────────────────────────────────────

const EXTENSION_DESCRIPTIONS = {
  '.js': 'JavaScript source file.',
  '.jsx': 'React JSX component file.',
  '.ts': 'TypeScript source file.',
  '.tsx': 'React TSX component file.',
  '.mjs': 'ES module JavaScript file.',
  '.cjs': 'CommonJS module file.',
  '.vue': 'Vue single-file component.',
  '.svelte': 'Svelte component file.',
  '.css': 'Stylesheet.',
  '.scss': 'SCSS stylesheet.',
  '.sass': 'Sass stylesheet.',
  '.less': 'Less stylesheet.',
  '.html': 'HTML document.',
  '.htm': 'HTML document.',
  '.json': 'JSON data file.',
  '.yaml': 'YAML configuration file.',
  '.yml': 'YAML configuration file.',
  '.toml': 'TOML configuration file.',
  '.xml': 'XML data file.',
  '.md': 'Markdown document.',
  '.mdx': 'MDX document (Markdown + JSX).',
  '.py': 'Python source file.',
  '.go': 'Go source file.',
  '.rs': 'Rust source file.',
  '.java': 'Java source file.',
  '.rb': 'Ruby source file.',
  '.php': 'PHP source file.',
  '.c': 'C source file.',
  '.cpp': 'C++ source file.',
  '.h': 'C/C++ header file.',
  '.hpp': 'C++ header file.',
  '.sh': 'Shell script.',
  '.bash': 'Bash shell script.',
  '.ps1': 'PowerShell script.',
  '.sql': 'SQL database script.',
  '.graphql': 'GraphQL schema/query file.',
  '.gql': 'GraphQL schema/query file.',
  '.prisma': 'Prisma database schema.',
  '.env': 'Environment variables.',
  '.svg': 'SVG vector graphic.',
  '.png': 'PNG image.',
  '.jpg': 'JPEG image.',
  '.gif': 'GIF image.',
  '.webp': 'WebP image.',
  '.ico': 'Favicon icon.',
  '.woff': 'Web font file.',
  '.woff2': 'Web font file (WOFF2).',
  '.ttf': 'TrueType font file.',
  '.pdf': 'PDF document.',
  '.lock': 'Dependency lock file.',
};

function getDescriptionByExtension(ext) {
  return EXTENSION_DESCRIPTIONS[ext] || null;
}

module.exports = {
  extractFileSummary,
  cleanSummaryText,
  getDescriptionByFilename,
  getDescriptionByExtension,
};
