#!/usr/bin/env node

/**
 * AI-Powered Documentation Assistant
 * Fetches, analyzes, and understands documentation using LLM
 * Maintains project history and sequences
 */

import readline from 'readline';
import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const HISTORY_FILE = path.join(__dirname, 'ai-history.json');
const SEQUENCE_FILE = path.join(__dirname, 'project-sequences.json');
const DOCS_CACHE = path.join(__dirname, 'docs-cache');

// State management
let conversationHistory = [];
let projectSequences = [];
let docsCache = new Map();

// Initialize storage
await initializeStorage();

async function initializeStorage() {
  try {
    await fs.mkdir(DOCS_CACHE, { recursive: true });
    
    // Load history
    try {
      const historyData = await fs.readFile(HISTORY_FILE, 'utf-8');
      conversationHistory = JSON.parse(historyData);
    } catch {
      conversationHistory = [];
    }
    
    // Load sequences
    try {
      const sequenceData = await fs.readFile(SEQUENCE_FILE, 'utf-8');
      projectSequences = JSON.parse(sequenceData);
    } catch {
      projectSequences = [];
    }
  } catch (error) {
    console.error('Storage initialization error:', error.message);
  }
}

async function saveHistory() {
  await fs.writeFile(HISTORY_FILE, JSON.stringify(conversationHistory, null, 2));
}

async function saveSequences() {
  await fs.writeFile(SEQUENCE_FILE, JSON.stringify(projectSequences, null, 2));
}

// Fetch utilities
async function fetchUrl(url) {
  try {
    const { stdout } = await execAsync(`curl -sL "${url}"`);
    return stdout;
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error.message}`);
  }
}

async function fetchAndCache(url, cacheKey) {
  if (docsCache.has(cacheKey)) {
    return docsCache.get(cacheKey);
  }
  
  const content = await fetchUrl(url);
  const cacheFile = path.join(DOCS_CACHE, `${cacheKey}.txt`);
  await fs.writeFile(cacheFile, content);
  docsCache.set(cacheKey, content);
  
  return content;
}

// Documentation analyzers
async function analyzeMarkdown(content) {
  const lines = content.split('\n');
  const analysis = {
    headings: [],
    codeBlocks: [],
    links: [],
    structure: []
  };
  
  let inCodeBlock = false;
  let currentCode = [];
  
  for (const line of lines) {
    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      analysis.headings.push({
        level: headingMatch[1].length,
        text: headingMatch[2]
      });
      analysis.structure.push(`${'  '.repeat(headingMatch[1].length - 1)}${headingMatch[2]}`);
    }
    
    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        analysis.codeBlocks.push(currentCode.join('\n'));
        currentCode = [];
      }
      inCodeBlock = !inCodeBlock;
    } else if (inCodeBlock) {
      currentCode.push(line);
    }
    
    // Links
    const linkMatches = line.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
    for (const match of linkMatches) {
      analysis.links.push({ text: match[1], url: match[2] });
    }
  }
  
  return analysis;
}

// Project sequence tracking
function recordSequence(action, details) {
  const sequence = {
    timestamp: new Date().toISOString(),
    action,
    details,
    context: {
      workingDirectory: process.cwd(),
      branch: null,
    }
  };
  
  projectSequences.push(sequence);
  saveSequences().catch(console.error);
  
  return sequence;
}

async function getGitContext() {
  try {
    const { stdout: branch } = await execAsync('git branch --show-current', { cwd: PROJECT_ROOT });
    const { stdout: commit } = await execAsync('git rev-parse --short HEAD', { cwd: PROJECT_ROOT });
    const { stdout: status } = await execAsync('git status --short', { cwd: PROJECT_ROOT });
    
    return {
      branch: branch.trim(),
      commit: commit.trim(),
      hasChanges: status.trim().length > 0,
      changes: status.trim()
    };
  } catch {
    return null;
  }
}

// AI-powered commands
const aiCommands = {
  fetch: async (url) => {
    const cacheKey = Buffer.from(url).toString('base64').substring(0, 32);
    const content = await fetchAndCache(url, cacheKey);
    recordSequence('fetch_documentation', { url, size: content.length });
    return { content, cached: false };
  },
  
  analyze: async (url) => {
    const { content } = await aiCommands.fetch(url);
    const analysis = await analyzeMarkdown(content);
    recordSequence('analyze_documentation', { url, analysis });
    
    return {
      summary: `Found ${analysis.headings.length} sections, ${analysis.codeBlocks.length} code examples, ${analysis.links.length} links`,
      headings: analysis.headings,
      structure: analysis.structure,
      codeBlocks: analysis.codeBlocks.length,
      links: analysis.links.length
    };
  },
  
  search: async (query) => {
    const results = [];
    
    // Search in project files
    try {
      const { stdout } = await execAsync(
        `grep -r "${query}" ${PROJECT_ROOT} --include="*.md" --include="*.rs" --include="*.toml" -n | head -20`,
        { maxBuffer: 10 * 1024 * 1024 }
      );
      
      results.push(...stdout.split('\n').filter(Boolean).map(line => {
        const [file, ...rest] = line.split(':');
        return { file, content: rest.join(':') };
      }));
    } catch {}
    
    recordSequence('search', { query, resultsCount: results.length });
    return results;
  },
  
  summarize: async (path) => {
    const filePath = path.startsWith('/') ? path : `${PROJECT_ROOT}/${path}`;
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    const summary = {
      path,
      lines: lines.length,
      size: content.length,
      type: path.split('.').pop(),
      preview: lines.slice(0, 20).join('\n'),
      structure: null
    };
    
    if (path.endsWith('.md')) {
      summary.structure = await analyzeMarkdown(content);
    }
    
    recordSequence('summarize_file', summary);
    return summary;
  },
  
  history: async (limit = 20) => {
    return conversationHistory.slice(-limit);
  },
  
  sequences: async (filter = null) => {
    if (!filter) {
      return projectSequences.slice(-20);
    }
    return projectSequences.filter(s => s.action === filter).slice(-20);
  },
  
  context: async () => {
    const gitContext = await getGitContext();
    const recentSequences = projectSequences.slice(-5);
    
    return {
      git: gitContext,
      recentActions: recentSequences.map(s => `${s.action}: ${JSON.stringify(s.details)}`),
      historyLength: conversationHistory.length,
      sequencesCount: projectSequences.length
    };
  },
  
  understand: async (topic) => {
    // Find related documentation
    const searches = await aiCommands.search(topic);
    const context = await aiCommands.context();
    
    const understanding = {
      topic,
      relatedFiles: searches.slice(0, 5),
      context,
      suggestions: []
    };
    
    // Generate suggestions based on topic
    if (topic.toLowerCase().includes('sui')) {
      understanding.suggestions.push('Check docs/learn/ for Sui tutorials');
      understanding.suggestions.push('Review crates/sui-core/ for core implementation');
    }
    if (topic.toLowerCase().includes('consensus')) {
      understanding.suggestions.push('Review consensus/ directory');
      understanding.suggestions.push('Check crates/sui-core/src/consensus/');
    }
    
    recordSequence('understand_topic', understanding);
    return understanding;
  },
  
  compare: async (file1, file2) => {
    const path1 = file1.startsWith('/') ? file1 : `${PROJECT_ROOT}/${file1}`;
    const path2 = file2.startsWith('/') ? file2 : `${PROJECT_ROOT}/${file2}`;
    
    const [content1, content2] = await Promise.all([
      fs.readFile(path1, 'utf-8'),
      fs.readFile(path2, 'utf-8')
    ]);
    
    const comparison = {
      file1,
      file2,
      size1: content1.length,
      size2: content2.length,
      lines1: content1.split('\n').length,
      lines2: content2.split('\n').length,
      diff: null
    };
    
    try {
      const { stdout } = await execAsync(`diff -u "${path1}" "${path2}"`);
      comparison.diff = stdout;
    } catch (error) {
      comparison.diff = error.stdout || 'Files are identical';
    }
    
    recordSequence('compare_files', comparison);
    return comparison;
  },
  
  timeline: async (days = 7) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const timeline = projectSequences.filter(s => 
      new Date(s.timestamp) > cutoff
    ).map(s => ({
      time: new Date(s.timestamp).toLocaleString(),
      action: s.action,
      summary: JSON.stringify(s.details).substring(0, 100)
    }));
    
    return timeline;
  }
};

// Command parser
function parseAICommand(input) {
  const parts = input.trim().split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
  
  if (command === 'fetch' && args.length > 0) {
    return { command: 'fetch', args: [args.join(' ')] };
  }
  if (command === 'analyze' && args.length > 0) {
    return { command: 'analyze', args: [args.join(' ')] };
  }
  if (command === 'search' && args.length > 0) {
    return { command: 'search', args: [args.join(' ')] };
  }
  if (command === 'summarize' && args.length > 0) {
    return { command: 'summarize', args: [args.join(' ')] };
  }
  if (command === 'understand' && args.length > 0) {
    return { command: 'understand', args: [args.join(' ')] };
  }
  if (command === 'compare' && args.length >= 2) {
    return { command: 'compare', args: [args[0], args.slice(1).join(' ')] };
  }
  if (command === 'history') {
    return { command: 'history', args: args.length > 0 ? [parseInt(args[0])] : [] };
  }
  if (command === 'sequences') {
    return { command: 'sequences', args: args };
  }
  if (command === 'context') {
    return { command: 'context', args: [] };
  }
  if (command === 'timeline') {
    return { command: 'timeline', args: args.length > 0 ? [parseInt(args[0])] : [] };
  }
  
  return null;
}

// Help text
function showHelp() {
  console.log(chalk.bold.cyan('\n🤖 AI Assistant Commands:\n'));
  
  console.log(chalk.yellow('Documentation & Fetching:'));
  console.log('  fetch <url> - Fetch and cache documentation from URL');
  console.log('  analyze <url> - Fetch and analyze documentation structure');
  console.log('  summarize <file> - Summarize a project file');
  console.log('  compare <file1> <file2> - Compare two files\n');
  
  console.log(chalk.yellow('Search & Understanding:'));
  console.log('  search <query> - Search across project files');
  console.log('  understand <topic> - Get contextual understanding of a topic');
  console.log('  context - Show current project context\n');
  
  console.log(chalk.yellow('History & Sequences:'));
  console.log('  history [limit] - Show conversation history');
  console.log('  sequences [action] - Show project action sequences');
  console.log('  timeline [days] - Show timeline of recent activities\n');
  
  console.log(chalk.yellow('Utility:'));
  console.log('  help - Show this help');
  console.log('  clear - Clear screen');
  console.log('  exit - Exit assistant\n');
  
  console.log(chalk.gray('Examples:'));
  console.log(chalk.gray('  fetch https://docs.sui.io/guides/developer/getting-started'));
  console.log(chalk.gray('  search consensus'));
  console.log(chalk.gray('  understand sui transactions'));
  console.log(chalk.gray('  timeline 7\n'));
}

// Main handler
async function handleCommand(input) {
  const trimmed = input.trim();
  if (!trimmed) return;
  
  // Record in conversation history
  conversationHistory.push({
    timestamp: new Date().toISOString(),
    input: trimmed,
    type: 'user'
  });
  await saveHistory();
  
  // Special commands
  if (trimmed === 'help') {
    showHelp();
    return;
  }
  
  if (trimmed === 'clear') {
    console.clear();
    console.log(chalk.bold.cyan('🤖 AI Documentation Assistant - Crozz-Coin\n'));
    return;
  }
  
  if (trimmed === 'exit' || trimmed === 'quit') {
    console.log(chalk.green('\n👋 Goodbye! History saved.\n'));
    process.exit(0);
  }
  
  // Parse and execute AI command
  const parsed = parseAICommand(trimmed);
  
  if (!parsed) {
    console.log(chalk.red('❌ Command not recognized. Type "help" for available commands.\n'));
    return;
  }
  
  try {
    console.log(chalk.blue(`\n⚡ ${parsed.command}...\n`));
    const result = await aiCommands[parsed.command](...parsed.args);
    
    // Format output based on result type
    if (typeof result === 'object' && !Array.isArray(result)) {
      console.log(chalk.green(JSON.stringify(result, null, 2)));
    } else if (Array.isArray(result)) {
      result.forEach((item, i) => {
        console.log(chalk.green(`${i + 1}. ${JSON.stringify(item)}`));
      });
    } else {
      console.log(chalk.green(result));
    }
    
    // Record response
    conversationHistory.push({
      timestamp: new Date().toISOString(),
      command: parsed.command,
      result: typeof result === 'string' ? result.substring(0, 500) : 'object',
      type: 'assistant'
    });
    await saveHistory();
    
    console.log();
  } catch (error) {
    console.log(chalk.red(`❌ Error: ${error.message}\n`));
    conversationHistory.push({
      timestamp: new Date().toISOString(),
      error: error.message,
      type: 'error'
    });
    await saveHistory();
  }
}

// Start interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: chalk.cyan('ai> ')
});

console.clear();
console.log(chalk.bold.cyan('🤖 AI Documentation Assistant - Crozz-Coin'));
console.log(chalk.gray('Fetch, analyze, and understand documentation with AI'));
console.log(chalk.gray('Type "help" for commands\n'));

rl.prompt();

rl.on('line', async (line) => {
  await handleCommand(line);
  rl.prompt();
}).on('close', () => {
  console.log(chalk.green('\n👋 Goodbye!\n'));
  process.exit(0);
});
