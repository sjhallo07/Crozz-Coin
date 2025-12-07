# Crozz-Coin MCP Server

Model Context Protocol (MCP) server for Crozz-Coin project with comprehensive chat and command functionality.

## Features

- **Chat Management**: Send messages, retrieve chat history, and clear history
- **Command Execution**: Execute shell commands in the project directory
- **Cargo Tools**: Build, check, clippy, fmt, and test
- **Git Operations**: Status, log, diff, and branch management
- **File Operations**: List, read, and write files
- **Code Search**: Search through code files
- **Configurable**: All features can be enabled/disabled via config.json

## Configuration

Edit `config.json` to customize the server behavior:

```json
{
  "server": {
    "name": "crozz-coin-mcp-server",
    "version": "1.0.0"
  },
  "features": {
    "chat": {
      "enabled": true,
      "maxHistorySize": 1000
    },
    "commands": {
      "enabled": true,
      "maxBufferSize": 52428800
    }
  },
  "tools": {
    "send_message": { "enabled": true },
    "execute_command": { "enabled": true }
    // ... all tools can be individually enabled/disabled
  }
}
```

## Available Tools (All Enabled by Default)

### Chat Tools

- **send_message**: Send and store chat messages
- **get_chat_history**: Retrieve chat history (configurable limit)
- **clear_chat_history**: Clear all messages

### Command Execution

- **execute_command**: Execute any shell command with custom working directory

### Cargo/Build Tools

- **build_project**: Build with cargo (dev or release)
- **cargo_check**: Verify code compilation
- **cargo_clippy**: Run linting with optional auto-fix
- **cargo_fmt**: Format code with optional check-only mode
- **run_tests**: Run tests for specific packages or all

### Git Tools

- **git_status**: Repository status
- **git_log**: Commit history with configurable limit
- **git_diff**: Show changes (staged or unstaged)
- **git_branch**: List branches (local or all)

### File Operations

- **list_files**: List directory contents (recursive option)
- **read_file**: Read file contents
- **write_file**: Write content to files

### Code Search

- **search_code**: Search for text in code with file pattern support

## Starting the Server

### Method 1: Direct Start

```bash
cd /workspaces/Crozz-Coin/mcp-server
npm start
```

### Method 2: Start in background

```bash
cd /workspaces/Crozz-Coin/mcp-server
node index.js &
```

### Method 3: With systemd or process manager

```bash
# Using PM2
npm install -g pm2
pm2 start index.js --name crozz-mcp-server
```

## Client Configuration

To use this MCP server with an MCP client (like Claude Desktop), add to your MCP settings:

```json
{
  "mcpServers": {
    "crozz-coin": {
      "command": "node",
      "args": ["/workspaces/Crozz-Coin/mcp-server/index.js"]
    }
  }
}
```

## Testing the Server

You can test the server using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node index.js
```

## Example Usage

Once connected via an MCP client, you can:

```
# Send a chat message
Tool: send_message
Args: { "message": "Hello from Crozz-Coin!", "user": "developer" }

# Get chat history
Tool: get_chat_history
Args: { "limit": 10 }

# Execute a command
Tool: execute_command
Args: { "command": "ls -la" }

# Build the project
Tool: build_project
Args: { "release": false }

# Run tests
Tool: run_tests
Args: { "package": "sui-core" }

# Check git status
Tool: git_status
Args: {}
```

## Security Notes

- Commands execute with the same permissions as the Node.js process
- All commands run in the project root by default
- Consider running in a restricted environment for production use

## Troubleshooting

If the server doesn't start:

1. Check Node.js version (requires v14+): `node --version`
2. Reinstall dependencies: `npm install`
3. Check for port conflicts
4. Review logs in console output
