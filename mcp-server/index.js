#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

// Load configuration
let config;
try {
  const configData = await fs.readFile(path.join(__dirname, "config.json"), "utf-8");
  config = JSON.parse(configData);
} catch (error) {
  console.error("Failed to load config.json, using defaults");
  config = {
    server: { name: "crozz-coin-mcp-server", version: "1.0.0" },
    features: { chat: { enabled: true }, commands: { enabled: true } },
    tools: {},
  };
}

// Create MCP server
const server = new Server(
  {
    name: config.server.name,
    version: config.server.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Chat history storage
let chatHistory = [];

// Helper function to check if tool is enabled
function isToolEnabled(toolName) {
  return config.tools[toolName]?.enabled !== false;
}

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = [];

  // Chat tools
  if (isToolEnabled("send_message")) {
    tools.push({
      name: "send_message",
      description: "Send a chat message and store it in history",
      inputSchema: {
        type: "object",
        properties: {
          message: { type: "string", description: "The message to send" },
          user: { type: "string", description: "Username (optional)" },
        },
        required: ["message"],
      },
    });
  }

  if (isToolEnabled("get_chat_history")) {
    tools.push({
      name: "get_chat_history",
      description: "Retrieve the chat history",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Maximum number of messages (default: 50)" },
        },
      },
    });
  }

  if (isToolEnabled("clear_chat_history")) {
    tools.push({
      name: "clear_chat_history",
      description: "Clear all chat history",
      inputSchema: { type: "object", properties: {} },
    });
  }

  // Command execution
  if (isToolEnabled("execute_command")) {
    tools.push({
      name: "execute_command",
      description: "Execute a shell command in the project directory",
      inputSchema: {
        type: "object",
        properties: {
          command: { type: "string", description: "Shell command to execute" },
          cwd: { type: "string", description: "Working directory (optional)" },
        },
        required: ["command"],
      },
    });
  }

  // Build tools
  if (isToolEnabled("build_project")) {
    tools.push({
      name: "build_project",
      description: "Build the Crozz-Coin project using cargo",
      inputSchema: {
        type: "object",
        properties: {
          release: { type: "boolean", description: "Build in release mode" },
        },
      },
    });
  }

  if (isToolEnabled("cargo_check")) {
    tools.push({
      name: "cargo_check",
      description: "Run cargo check to verify code compilation",
      inputSchema: {
        type: "object",
        properties: {
          package: { type: "string", description: "Specific package to check" },
        },
      },
    });
  }

  if (isToolEnabled("cargo_clippy")) {
    tools.push({
      name: "cargo_clippy",
      description: "Run cargo clippy for linting",
      inputSchema: {
        type: "object",
        properties: {
          fix: { type: "boolean", description: "Auto-fix issues" },
        },
      },
    });
  }

  if (isToolEnabled("cargo_fmt")) {
    tools.push({
      name: "cargo_fmt",
      description: "Format code using cargo fmt",
      inputSchema: {
        type: "object",
        properties: {
          check: { type: "boolean", description: "Check formatting without applying" },
        },
      },
    });
  }

  // Test tools
  if (isToolEnabled("run_tests")) {
    tools.push({
      name: "run_tests",
      description: "Run tests for the Crozz-Coin project",
      inputSchema: {
        type: "object",
        properties: {
          package: { type: "string", description: "Specific package to test" },
          test: { type: "string", description: "Specific test to run" },
        },
      },
    });
  }

  // Git tools
  if (isToolEnabled("git_status")) {
    tools.push({
      name: "git_status",
      description: "Get git status of the repository",
      inputSchema: { type: "object", properties: {} },
    });
  }

  if (isToolEnabled("git_log")) {
    tools.push({
      name: "git_log",
      description: "Get git commit history",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Number of commits (default: 10)" },
          oneline: { type: "boolean", description: "Show one line per commit" },
        },
      },
    });
  }

  if (isToolEnabled("git_diff")) {
    tools.push({
      name: "git_diff",
      description: "Show git diff for changes",
      inputSchema: {
        type: "object",
        properties: {
          staged: { type: "boolean", description: "Show staged changes" },
          file: { type: "string", description: "Specific file to diff" },
        },
      },
    });
  }

  if (isToolEnabled("git_branch")) {
    tools.push({
      name: "git_branch",
      description: "List git branches",
      inputSchema: {
        type: "object",
        properties: {
          all: { type: "boolean", description: "Show all branches including remote" },
        },
      },
    });
  }

  // File operations
  if (isToolEnabled("list_files")) {
    tools.push({
      name: "list_files",
      description: "List files in a directory",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Directory path (relative to project root)" },
          recursive: { type: "boolean", description: "List recursively" },
        },
      },
    });
  }

  if (isToolEnabled("read_file")) {
    tools.push({
      name: "read_file",
      description: "Read contents of a file",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "File path (relative to project root)" },
        },
        required: ["path"],
      },
    });
  }

  if (isToolEnabled("write_file")) {
    tools.push({
      name: "write_file",
      description: "Write content to a file",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "File path (relative to project root)" },
          content: { type: "string", description: "Content to write" },
        },
        required: ["path", "content"],
      },
    });
  }

  if (isToolEnabled("search_code")) {
    tools.push({
      name: "search_code",
      description: "Search for text in code files",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          path: { type: "string", description: "Directory to search in" },
          filePattern: { type: "string", description: "File pattern (e.g., '*.rs')" },
        },
        required: ["query"],
      },
    });
  }

  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "execute_command": {
        if (!isToolEnabled("execute_command")) throw new Error("Tool disabled");
        const cwd = args.cwd || PROJECT_ROOT;
        const { stdout, stderr } = await execAsync(args.command, {
          cwd,
          maxBuffer: config.features.commands?.maxBufferSize || 10 * 1024 * 1024,
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ stdout: stdout.trim(), stderr: stderr.trim(), success: true }, null, 2),
          }],
        };
      }

      case "send_message": {
        if (!isToolEnabled("send_message")) throw new Error("Tool disabled");
        const timestamp = new Date().toISOString();
        const message = { user: args.user || "anonymous", message: args.message, timestamp };
        chatHistory.push(message);
        if (chatHistory.length > (config.features.chat?.maxHistorySize || 1000)) {
          chatHistory.shift();
        }
        return { content: [{ type: "text", text: `Message sent at ${timestamp}` }] };
      }

      case "get_chat_history": {
        if (!isToolEnabled("get_chat_history")) throw new Error("Tool disabled");
        const limit = args.limit || 50;
        const messages = chatHistory.slice(-limit);
        return { content: [{ type: "text", text: JSON.stringify(messages, null, 2) }] };
      }

      case "clear_chat_history": {
        if (!isToolEnabled("clear_chat_history")) throw new Error("Tool disabled");
        const count = chatHistory.length;
        chatHistory = [];
        return { content: [{ type: "text", text: `Cleared ${count} messages` }] };
      }

      case "build_project": {
        if (!isToolEnabled("build_project")) throw new Error("Tool disabled");
        const buildCmd = args.release ? "cargo build --release" : "cargo build";
        const { stdout, stderr } = await execAsync(buildCmd, {
          cwd: PROJECT_ROOT,
          maxBuffer: 50 * 1024 * 1024,
        });
        return { content: [{ type: "text", text: `Build completed:\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}` }] };
      }

      case "cargo_check": {
        if (!isToolEnabled("cargo_check")) throw new Error("Tool disabled");
        const cmd = args.package ? `cargo check -p ${args.package}` : "cargo check";
        const { stdout, stderr } = await execAsync(cmd, { cwd: PROJECT_ROOT, maxBuffer: 50 * 1024 * 1024 });
        return { content: [{ type: "text", text: `Check completed:\n\n${stdout}\n${stderr}` }] };
      }

      case "cargo_clippy": {
        if (!isToolEnabled("cargo_clippy")) throw new Error("Tool disabled");
        const cmd = args.fix ? "cargo clippy --fix --allow-dirty" : "cargo clippy";
        const { stdout, stderr } = await execAsync(cmd, { cwd: PROJECT_ROOT, maxBuffer: 50 * 1024 * 1024 });
        return { content: [{ type: "text", text: `Clippy completed:\n\n${stdout}\n${stderr}` }] };
      }

      case "cargo_fmt": {
        if (!isToolEnabled("cargo_fmt")) throw new Error("Tool disabled");
        const cmd = args.check ? "cargo fmt -- --check" : "cargo fmt";
        const { stdout, stderr } = await execAsync(cmd, { cwd: PROJECT_ROOT, maxBuffer: 50 * 1024 * 1024 });
        return { content: [{ type: "text", text: `Format completed:\n\n${stdout}\n${stderr}` }] };
      }

      case "run_tests": {
        if (!isToolEnabled("run_tests")) throw new Error("Tool disabled");
        let testCmd = "cargo test";
        if (args.package) testCmd += ` -p ${args.package}`;
        if (args.test) testCmd += ` ${args.test}`;
        const { stdout, stderr } = await execAsync(testCmd, {
          cwd: PROJECT_ROOT,
          maxBuffer: 50 * 1024 * 1024,
        });
        return { content: [{ type: "text", text: `Tests completed:\n\n${stdout}\n${stderr}` }] };
      }

      case "git_status": {
        if (!isToolEnabled("git_status")) throw new Error("Tool disabled");
        const { stdout } = await execAsync("git status", { cwd: PROJECT_ROOT });
        return { content: [{ type: "text", text: stdout }] };
      }

      case "git_log": {
        if (!isToolEnabled("git_log")) throw new Error("Tool disabled");
        const limit = args.limit || 10;
        const format = args.oneline ? "--oneline" : "";
        const { stdout } = await execAsync(`git log ${format} -n ${limit}`, { cwd: PROJECT_ROOT });
        return { content: [{ type: "text", text: stdout }] };
      }

      case "git_diff": {
        if (!isToolEnabled("git_diff")) throw new Error("Tool disabled");
        let cmd = "git diff";
        if (args.staged) cmd += " --staged";
        if (args.file) cmd += ` ${args.file}`;
        const { stdout } = await execAsync(cmd, { cwd: PROJECT_ROOT, maxBuffer: 50 * 1024 * 1024 });
        return { content: [{ type: "text", text: stdout || "No changes" }] };
      }

      case "git_branch": {
        if (!isToolEnabled("git_branch")) throw new Error("Tool disabled");
        const cmd = args.all ? "git branch -a" : "git branch";
        const { stdout } = await execAsync(cmd, { cwd: PROJECT_ROOT });
        return { content: [{ type: "text", text: stdout }] };
      }

      case "list_files": {
        if (!isToolEnabled("list_files")) throw new Error("Tool disabled");
        const targetPath = path.join(PROJECT_ROOT, args.path || ".");
        const cmd = args.recursive ? `find ${targetPath} -type f` : `ls -la ${targetPath}`;
        const { stdout } = await execAsync(cmd, { maxBuffer: 10 * 1024 * 1024 });
        return { content: [{ type: "text", text: stdout }] };
      }

      case "read_file": {
        if (!isToolEnabled("read_file")) throw new Error("Tool disabled");
        const filePath = path.join(PROJECT_ROOT, args.path);
        const content = await fs.readFile(filePath, "utf-8");
        return { content: [{ type: "text", text: content }] };
      }

      case "write_file": {
        if (!isToolEnabled("write_file")) throw new Error("Tool disabled");
        const filePath = path.join(PROJECT_ROOT, args.path);
        await fs.writeFile(filePath, args.content, "utf-8");
        return { content: [{ type: "text", text: `File written: ${args.path}` }] };
      }

      case "search_code": {
        if (!isToolEnabled("search_code")) throw new Error("Tool disabled");
        const searchPath = args.path ? path.join(PROJECT_ROOT, args.path) : PROJECT_ROOT;
        const pattern = args.filePattern ? `--include="${args.filePattern}"` : "";
        const cmd = `grep -r ${pattern} "${args.query}" ${searchPath} || true`;
        const { stdout } = await execAsync(cmd, { maxBuffer: 50 * 1024 * 1024 });
        return { content: [{ type: "text", text: stdout || "No matches found" }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}\n${error.stderr || ""}` }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  if (config.logging?.toConsole) {
    console.error(`${config.server.name} v${config.server.version} running on stdio`);
    console.error(`Enabled tools: ${Object.keys(config.tools).filter(t => config.tools[t].enabled).length}`);
  }
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
