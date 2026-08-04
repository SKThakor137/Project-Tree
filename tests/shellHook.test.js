'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { generateShellHook, getProfilePath, installShellHook } = require('../src/features/shellHook.js');

console.log('🧪 Testing shell hook integration...');

// 1. generateShellHook tests
const psHook = generateShellHook('powershell');
assert(psHook.includes('$global:__PTREE_SHOWN_IN_TAB'), 'PowerShell hook should include session flag guard');
assert(psHook.includes('ptree --no-copy'), 'PowerShell hook should execute ptree --no-copy');

const bashHook = generateShellHook('bash');
assert(bashHook.includes('__PTREE_SHOWN_IN_TAB'), 'Bash hook should include session flag guard');
assert(bashHook.includes('PROMPT_COMMAND'), 'Bash hook should attach to PROMPT_COMMAND');

const zshHook = generateShellHook('zsh');
assert(zshHook.includes('add-zsh-hook'), 'Zsh hook should use add-zsh-hook');

const cmdHook = generateShellHook('cmd');
assert(cmdHook.includes('defined __PTREE_SHOWN_IN_TAB'), 'CMD hook should check defined __PTREE_SHOWN_IN_TAB');

assert.throws(() => generateShellHook('unknown_shell'), /Unsupported shell type/);

// 2. getProfilePath tests
const psPath = getProfilePath('powershell');
assert(typeof psPath === 'string' && psPath.endsWith('.ps1'), 'PowerShell profile path should end with .ps1');

const bashPath = getProfilePath('bash');
assert(bashPath.endsWith('.bashrc'), 'Bash profile path should end with .bashrc');

const zshPath = getProfilePath('zsh');
assert(zshPath.endsWith('.zshrc'), 'Zsh profile path should end with .zshrc');

// 3. installShellHook tests (in temp directory)
const tmpDir = path.join(os.tmpdir(), 'ptree-shell-test-' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const testProfilePath = path.join(tmpDir, 'test_profile.ps1');
// Override getProfilePath in temp context
const hookCode = generateShellHook('powershell');
fs.writeFileSync(testProfilePath, '# Initial profile\n', 'utf8');

let content = fs.readFileSync(testProfilePath, 'utf8');
content = content.trimEnd() + '\n\n' + hookCode + '\n';
fs.writeFileSync(testProfilePath, content, 'utf8');

const updatedContent = fs.readFileSync(testProfilePath, 'utf8');
assert(updatedContent.includes('$global:__PTREE_SHOWN_IN_TAB'), 'Profile should contain shell hook block');

fs.rmSync(tmpDir, { recursive: true, force: true });

console.log('✅ Shell hook integration tests passed!');
