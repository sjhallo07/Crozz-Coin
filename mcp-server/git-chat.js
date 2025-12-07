#!/usr/bin/env node

/**
 * GitKraken-style Git Chat Interface for Codespaces
 * Interactive chat interface for Git commands
 */

import readline from 'readline';
import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);
const PROJECT_ROOT = process.cwd();

// Chat history
const chatHistory = [];

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: chalk.cyan('git-chat> ')
});

// Git command helpers
const gitCommands = {
  status: async () => {
    const { stdout } = await execAsync('git status', { cwd: PROJECT_ROOT });
    return stdout;
  },
  
  log: async (limit = 10) => {
    const { stdout } = await execAsync(`git log --oneline -n ${limit}`, { cwd: PROJECT_ROOT });
    return stdout;
  },
  
  diff: async (options = '') => {
    const { stdout } = await execAsync(`git diff ${options}`, { cwd: PROJECT_ROOT });
    return stdout || 'No changes to show';
  },
  
  branch: async (all = false) => {
    const cmd = all ? 'git branch -a' : 'git branch';
    const { stdout } = await execAsync(cmd, { cwd: PROJECT_ROOT });
    return stdout;
  },
  
  add: async (files = '.') => {
    const { stdout, stderr } = await execAsync(`git add ${files}`, { cwd: PROJECT_ROOT });
    return stdout || stderr || `Added: ${files}`;
  },
  
  commit: async (message) => {
    if (!message) throw new Error('Commit message required');
    const { stdout } = await execAsync(`git commit -m "${message}"`, { cwd: PROJECT_ROOT });
    return stdout;
  },
  
  push: async (remote = 'origin', branch = '') => {
    const cmd = branch ? `git push ${remote} ${branch}` : `git push`;
    const { stdout } = await execAsync(cmd, { cwd: PROJECT_ROOT });
    return stdout;
  },
  
  pull: async (remote = 'origin', branch = '') => {
    const cmd = branch ? `git pull ${remote} ${branch}` : `git pull`;
    const { stdout } = await execAsync(cmd, { cwd: PROJECT_ROOT });
    return stdout;
  },
  
  checkout: async (branch) => {
    if (!branch) throw new Error('Branch name required');
    const { stdout } = await execAsync(`git checkout ${branch}`, { cwd: PROJECT_ROOT });
    return stdout;
  },
  
  stash: async (action = 'save') => {
    const { stdout } = await execAsync(`git stash ${action}`, { cwd: PROJECT_ROOT });
    return stdout;
  },
  
  remote: async () => {
    const { stdout } = await execAsync('git remote -v', { cwd: PROJECT_ROOT });
    return stdout;
  },
  
  custom: async (command) => {
    const { stdout, stderr } = await execAsync(`git ${command}`, { cwd: PROJECT_ROOT });
    return stdout || stderr;
  }
};

// Parse natural language commands
function parseCommand(input) {
  const lower = input.toLowerCase().trim();
  
  // Status commands
  if (lower.match(/status|what'?s? (the )?status|show (me )?status/)) {
    return { command: 'status' };
  }
  
  // Log/history commands
  if (lower.match(/log|history|commits?|show.*commits?/)) {
    const match = lower.match(/(\d+)/);
    const limit = match ? parseInt(match[1]) : 10;
    return { command: 'log', args: [limit] };
  }
  
  // Diff commands
  if (lower.match(/diff|changes?|what.*changed/)) {
    const staged = lower.includes('staged') || lower.includes('cached');
    return { command: 'diff', args: [staged ? '--staged' : ''] };
  }
  
  // Branch commands
  if (lower.match(/branch(es)?|list.*branch/)) {
    const all = lower.includes('all') || lower.includes('remote');
    return { command: 'branch', args: [all] };
  }
  
  // Add commands
  if (lower.match(/add|stage/)) {
    const match = input.match(/add\s+(.+)|stage\s+(.+)/i);
    const files = match ? (match[1] || match[2]).trim() : '.';
    return { command: 'add', args: [files] };
  }
  
  // Commit commands
  if (lower.match(/commit/)) {
    const match = input.match(/commit\s+["']?(.+?)["']?$/i);
    const message = match ? match[1] : null;
    return { command: 'commit', args: [message] };
  }
  
  // Push commands
  if (lower.match(/push/)) {
    return { command: 'push' };
  }
  
  // Pull commands
  if (lower.match(/pull/)) {
    return { command: 'pull' };
  }
  
  // Checkout commands
  if (lower.match(/checkout|switch/)) {
    const match = input.match(/checkout\s+(\S+)|switch\s+(\S+)/i);
    const branch = match ? (match[1] || match[2]) : null;
    return { command: 'checkout', args: [branch] };
  }
  
  // Stash commands
  if (lower.match(/stash/)) {
    const action = lower.includes('pop') ? 'pop' : lower.includes('list') ? 'list' : 'save';
    return { command: 'stash', args: [action] };
  }
  
  // Remote commands
  if (lower.match(/remote/)) {
    return { command: 'remote' };
  }
  
  // Direct git command
  if (lower.startsWith('git ')) {
    return { command: 'custom', args: [input.substring(4)] };
  }
  
  return null;
}

// Help text
function showHelp() {
  console.log(chalk.bold.cyan('\n📚 Git Chat Commands:\n'));
  console.log(chalk.yellow('Natural Language:'));
  console.log('  "status" or "what\'s the status?" - Show git status');
  console.log('  "log" or "show last 5 commits" - Show commit history');
  console.log('  "diff" or "what changed?" - Show changes');
  console.log('  "branches" or "list all branches" - Show branches');
  console.log('  "add ." or "stage all" - Stage files');
  console.log('  "commit fix bug" - Commit with message');
  console.log('  "push" - Push to remote');
  console.log('  "pull" - Pull from remote');
  console.log('  "checkout main" - Switch branch');
  console.log('  "stash" - Stash changes');
  
  console.log(chalk.yellow('\nDirect Git Commands:'));
  console.log('  git <command> - Execute any git command');
  
  console.log(chalk.yellow('\nChat Commands:'));
  console.log('  help - Show this help');
  console.log('  history - Show chat history');
  console.log('  clear - Clear screen');
  console.log('  exit - Exit chat\n');
}

// Main command handler
async function handleCommand(input) {
  const trimmed = input.trim();
  
  if (!trimmed) return;
  
  // Add to history
  chatHistory.push({ input: trimmed, timestamp: new Date().toISOString() });
  
  // Special commands
  if (trimmed === 'help') {
    showHelp();
    return;
  }
  
  if (trimmed === 'history') {
    console.log(chalk.bold('\n📜 Chat History:\n'));
    chatHistory.forEach((item, i) => {
      console.log(chalk.gray(`${i + 1}. [${item.timestamp}] ${item.input}`));
    });
    console.log();
    return;
  }
  
  if (trimmed === 'clear') {
    console.clear();
    console.log(chalk.bold.cyan('🚀 Git Chat Interface - Crozz-Coin\n'));
    return;
  }
  
  if (trimmed === 'exit' || trimmed === 'quit') {
    console.log(chalk.green('\n👋 Goodbye!\n'));
    rl.close();
    process.exit(0);
  }
  
  // Parse and execute git command
  const parsed = parseCommand(trimmed);
  
  if (!parsed) {
    console.log(chalk.red('❌ Command not recognized. Type "help" for available commands.\n'));
    return;
  }
  
  try {
    console.log(chalk.blue(`\n⚡ Executing: ${parsed.command}...\n`));
    const result = await gitCommands[parsed.command](...(parsed.args || []));
    console.log(chalk.green(result));
    console.log();
  } catch (error) {
    console.log(chalk.red(`❌ Error: ${error.message}\n`));
  }
}

// Start chat interface
console.clear();
console.log(chalk.bold.cyan('🚀 Git Chat Interface - Crozz-Coin'));
console.log(chalk.gray('Type "help" for commands or use natural language for Git operations\n'));

rl.prompt();

rl.on('line', async (line) => {
  await handleCommand(line);
  rl.prompt();
}).on('close', () => {
  console.log(chalk.green('\n👋 Goodbye!\n'));
  process.exit(0);
});
