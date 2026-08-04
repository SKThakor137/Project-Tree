/**
 * Terminal Shell Integration Hook generator & installer for project-tree-md.
 * Ensures tree is executed ONLY ONCE on the first command run in a terminal tab/session,
 * preventing repeated execution on every prompt/command.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const colors = require('../utils/colors.js');

/**
 * Returns shell hook code for the specified shell type.
 * @param {string} [shell='powershell'] - 'powershell', 'bash', 'zsh', or 'cmd'
 * @returns {string} Shell script snippet
 */
function generateShellHook(shell = 'powershell') {
  const normalized = (shell || 'powershell').toLowerCase().trim();

  switch (normalized) {
    case 'pwsh':
    case 'powershell':
    case 'ps':
      return [
        '# --- project-tree-md Terminal Tab Hook ---',
        'if (-not (Test-Path Function:\\__old_ptree_prompt)) {',
        '    if (Test-Path Function:\\prompt) {',
        '        $function:__old_ptree_prompt = $function:prompt',
        '    }',
        '    function prompt {',
        '        if (-not $global:__PTREE_SHOWN_IN_TAB) {',
        '            $global:__PTREE_SHOWN_IN_TAB = $true',
        '            try { ptree --no-copy } catch {}',
        '        }',
        '        if (Test-Path Function:\\__old_ptree_prompt) {',
        '            & $function:__old_ptree_prompt',
        '        } else {',
        '            "PS $($executionContext.SessionState.Path.CurrentLocation)$(\'>\' * ($nestedPromptLevel + 1)) "',
        '        }',
        '    }',
        '}',
        '# ------------------------------------------'
      ].join('\n');

    case 'bash':
      return [
        '# --- project-tree-md Terminal Tab Hook ---',
        '__ptree_tab_hook() {',
        '    if [ -z "$__PTREE_SHOWN_IN_TAB" ]; then',
        '        export __PTREE_SHOWN_IN_TAB=1',
        '        ptree --no-copy 2>/dev/null || npx project-tree-md --no-copy 2>/dev/null',
        '    }',
        '}',
        'if [[ ! "$PROMPT_COMMAND" =~ "__ptree_tab_hook" ]]; then',
        '    PROMPT_COMMAND="__ptree_tab_hook;${PROMPT_COMMAND:-}"',
        '}',
        '# ------------------------------------------'
      ].join('\n');

    case 'zsh':
      return [
        '# --- project-tree-md Terminal Tab Hook ---',
        '__ptree_tab_hook() {',
        '    if [ -z "$__PTREE_SHOWN_IN_TAB" ]; then',
        '        export __PTREE_SHOWN_IN_TAB=1',
        '        ptree --no-copy 2>/dev/null || npx project-tree-md --no-copy 2>/dev/null',
        '    }',
        '}',
        'autoload -U add-zsh-hook 2>/dev/null',
        'add-zsh-hook precmd __ptree_tab_hook 2>/dev/null',
        '# ------------------------------------------'
      ].join('\n');

    case 'cmd':
    case 'bat':
      return [
        ':: --- project-tree-md Terminal Tab Hook ---',
        'if not defined __PTREE_SHOWN_IN_TAB (',
        '    set __PTREE_SHOWN_IN_TAB=1',
        '    ptree --no-copy',
        ')',
        ':: ------------------------------------------'
      ].join('\n');

    default:
      throw new Error(`Unsupported shell type: "${shell}". Supported: powershell, bash, zsh, cmd.`);
  }
}

/**
 * Gets the standard profile file path for the target shell.
 * @param {string} shell
 * @returns {string} Absolute path to profile file
 */
function getProfilePath(shell = 'powershell') {
  const normalized = (shell || 'powershell').toLowerCase().trim();
  const homeDir = os.homedir();

  if (normalized === 'bash') {
    return path.join(homeDir, '.bashrc');
  }
  if (normalized === 'zsh') {
    return path.join(homeDir, '.zshrc');
  }
  if (normalized === 'cmd' || normalized === 'bat') {
    return path.join(homeDir, 'ptree_init.cmd');
  }

  // PowerShell default path check
  const oneDriveDocs = path.join(homeDir, 'OneDrive', 'Documents');
  const standardDocs = path.join(homeDir, 'Documents');
  const docsDir = fs.existsSync(oneDriveDocs) ? oneDriveDocs : standardDocs;
  
  return path.join(docsDir, 'WindowsPowerShell', 'Microsoft.PowerShell_profile.ps1');
}

/**
 * Installs the shell hook into the user's profile file safely.
 * @param {string} [shell='powershell']
 * @returns {{ success: boolean, targetFile: string, message: string }}
 */
function installShellHook(shell = 'powershell') {
  const hookCode = generateShellHook(shell);
  const targetFile = getProfilePath(shell);

  const dir = path.dirname(targetFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let content = '';
  if (fs.existsSync(targetFile)) {
    content = fs.readFileSync(targetFile, 'utf8');
  }

  const marker = '# --- project-tree-md Terminal Tab Hook ---';
  const cmdMarker = ':: --- project-tree-md Terminal Tab Hook ---';

  if (content.includes(marker) || content.includes(cmdMarker)) {
    // Replace existing block
    const regex = new RegExp(`(${marker}|${cmdMarker})[\\s\\S]*?(${marker}|${cmdMarker}|# -----+|:: -----+)`, 'g');
    content = content.replace(regex, hookCode);
  } else {
    // Append to file
    content = content ? content.trimEnd() + '\n\n' + hookCode + '\n' : hookCode + '\n';
  }

  fs.writeFileSync(targetFile, content, 'utf8');

  return {
    success: true,
    targetFile,
    message: `Shell hook installed into ${targetFile}. Tree will now appear ONCE per terminal tab session.`
  };
}

module.exports = {
  generateShellHook,
  getProfilePath,
  installShellHook,
};
