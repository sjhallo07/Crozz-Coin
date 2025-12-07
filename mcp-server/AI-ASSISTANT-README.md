# 🤖 AI Documentation Assistant - Advanced LLM-Powered Tool

The most advanced tool for fetching, analyzing, understanding documentation, and maintaining project history using AI capabilities.

## 🚀 Quick Start

```bash
cd /workspaces/Crozz-Coin/mcp-server
npm run ai-assistant
```

## 🎯 Core Features

### 📚 Documentation Management

- **Fetch** documentation from any URL (Sui docs, GitHub, Rust docs)
- **Cache** fetched content for offline access
- **Analyze** markdown structure automatically
- **Extract** headings, code blocks, and links

### 🔍 Intelligent Search

- Search across entire Crozz-Coin codebase
- Context-aware results
- File type filtering
- Preview snippets

### 🧠 Understanding & Context

- Understand complex topics with context
- Get suggestions for related files
- Track git context automatically
- Build knowledge graphs

### 📊 History & Sequences

- Maintain conversation history
- Track all project actions
- Timeline visualization
- Sequence analysis

## 💡 Commands

### Documentation Commands

#### fetch <url>

Fetch and cache documentation from any URL:

```bash
ai> fetch https://docs.sui.io/guides/developer/getting-started
ai> fetch https://raw.githubusercontent.com/MystenLabs/sui/main/README.md
ai> fetch https://doc.rust-lang.org/book/ch01-00-getting-started.html
```

#### analyze <url>

Fetch and analyze documentation structure:

```bash
ai> analyze https://docs.sui.io/concepts/sui-move-concepts
```

Returns:

- Section count
- Code examples
- Link references
- Document structure

#### summarize <file>

Summarize any project file:

```bash
ai> summarize README.md
ai> summarize crates/sui-core/Cargo.toml
ai> summarize docs/learn/build-test.md
```

### Search Commands

#### search <query>

Search across project files:

```bash
ai> search consensus
ai> search transaction validation
ai> search "move module"
```

#### understand <topic>

Get contextual understanding of a topic:

```bash
ai> understand sui consensus
ai> understand move programming
ai> understand validator node
```

Returns:

- Related files
- Current context
- Suggestions
- Next steps

### Comparison Commands

#### compare <file1> <file2>

Compare two files:

```bash
ai> compare README.md docs/README.md
ai> compare Cargo.toml workspace.toml
```

### History Commands

#### history [limit]

Show conversation history:

```bash
ai> history
ai> history 50
```

#### sequences [action]

Show project action sequences:

```bash
ai> sequences
ai> sequences fetch_documentation
ai> sequences search
```

#### timeline [days]

Show timeline of recent activities:

```bash
ai> timeline
ai> timeline 7
ai> timeline 30
```

#### context

Show current project context:

```bash
ai> context
```

Returns:

- Git branch and commit
- Recent actions
- History length
- Sequences count

## 📖 Usage Examples

### Daily Documentation Workflow

```bash
# Start AI assistant
npm run ai-assistant

# Fetch Sui documentation
ai> fetch https://docs.sui.io/guides/developer/first-app

# Analyze the structure
ai> analyze https://docs.sui.io/guides/developer/first-app

# Search for related code
ai> search "first app"

# Understand the concept
ai> understand sui application structure

# Check timeline
ai> timeline 1
```

### Research Workflow

```bash
# Understand a complex topic
ai> understand consensus mechanism

# Search related implementations
ai> search consensus

# Fetch external docs
ai> fetch https://docs.sui.io/concepts/sui-move-concepts

# Summarize local files
ai> summarize consensus/README.md

# Compare implementations
ai> compare consensus/src/lib.rs crates/sui-core/src/consensus.rs
```

### History Analysis

```bash
# View recent actions
ai> sequences

# See conversation history
ai> history 20

# Get project context
ai> context

# View weekly timeline
ai> timeline 7
```

## 🔧 Advanced Features

### Automatic Context Tracking

The AI assistant automatically tracks:

- Git branch and commit
- File changes status
- Working directory
- Action sequences
- Timestamps

### Smart Caching

- Downloaded docs cached locally
- Fast repeated access
- Configurable cache size
- Auto-cleanup after 30 days

### History Persistence

All interactions saved to:

- `ai-history.json` - Conversation history
- `project-sequences.json` - Action sequences
- `docs-cache/` - Cached documentation

### Integration with Other Tools

Works seamlessly with:

- **MCP Server** - Use via MCP protocol
- **Git Chat** - Git operations tracked
- **Project Tools** - All actions logged

## 📊 Data Analysis

### Conversation Analytics

```bash
ai> history
# Shows all your questions and AI responses

ai> sequences
# Shows all actions taken in the project
```

### Pattern Recognition

The assistant recognizes patterns in your workflow:

- Frequently accessed docs
- Common search queries
- File access patterns
- Git workflow sequences

## 🎓 Best Practices

### 1. Start with Context

```bash
ai> context
ai> understand crozz-coin architecture
```

### 2. Fetch Before Analyzing

```bash
ai> fetch <url>
ai> analyze <url>
```

### 3. Use Search to Explore

```bash
ai> search consensus
ai> search move
```

### 4. Track Your Progress

```bash
ai> timeline 7
ai> sequences
```

### 5. Compare and Validate

```bash
ai> compare old-impl.rs new-impl.rs
```

## 🔌 API Integration

The AI assistant can be integrated with:

### Claude Desktop / MCP Clients

```json
{
  "mcpServers": {
    "ai-assistant": {
      "command": "node",
      "args": ["/workspaces/Crozz-Coin/mcp-server/ai-assistant.js"]
    }
  }
}
```

### Custom Scripts

```javascript
import { exec } from 'child_process';

// Fetch docs programmatically
exec('echo "fetch https://docs.sui.io" | node ai-assistant.js');
```

## 📈 Configuration

Edit `llm-config.json` to customize:

```json
{
  "features": {
    "documentation": {
      "cacheEnabled": true,
      "maxCacheSize": 104857600
    },
    "history": {
      "maxEntries": 10000
    },
    "fetching": {
      "timeout": 30000,
      "retries": 3
    }
  }
}
```

## 🎯 Use Cases

### 1. Learning Sui

```bash
ai> fetch https://docs.sui.io/guides/developer/getting-started
ai> understand sui basics
ai> search "sui move"
```

### 2. Code Review

```bash
ai> search TODO
ai> search FIXME
ai> compare main.rs main.rs.backup
```

### 3. Documentation Discovery

```bash
ai> fetch https://docs.sui.io
ai> analyze https://docs.sui.io/concepts
ai> search documentation
```

### 4. Workflow Analysis

```bash
ai> timeline 30
ai> sequences fetch_documentation
ai> context
```

## 🚀 Pro Tips

1. **Batch Fetching**: Fetch multiple docs in one session
2. **Smart Search**: Use specific queries for better results
3. **Context Awareness**: Check context before major operations
4. **History Review**: Review history to learn patterns
5. **Timeline Analysis**: Use timeline to track progress

## 🔗 Supported URLs

The assistant can fetch from:

- **Sui Docs**: docs.sui.io/*
- **GitHub**: github.com/*, raw.githubusercontent.com/*
- **Rust Docs**: doc.rust-lang.org/*
- **Any public URL**: Via curl

## 📝 Storage

### Files Created

- `ai-history.json` - All conversations (up to 10,000 entries)
- `project-sequences.json` - All actions tracked
- `docs-cache/*.txt` - Cached documentation

### Data Retention

- History: 90 days
- Sequences: 180 days
- Cache: 30 days

## 🛠️ Troubleshooting

### Can't fetch URL

```bash
# Check curl is working
curl -sL https://docs.sui.io

# Try with different URL
ai> fetch https://raw.githubusercontent.com/MystenLabs/sui/main/README.md
```

### Cache issues

```bash
# Clear cache manually
rm -rf /workspaces/Crozz-Coin/mcp-server/docs-cache/*
```

### History too large

```bash
# Backup and clear
mv ai-history.json ai-history.backup.json
```

## 🌟 What Makes This Advanced?

1. **LLM-Ready**: Structured data perfect for LLM processing
2. **Context Tracking**: Never lose track of your work
3. **Smart Caching**: Fast, offline-capable
4. **Sequence Analysis**: Understand your workflow
5. **Git Integration**: Automatic context awareness
6. **Multi-Source**: Fetch from anywhere
7. **Pattern Recognition**: Learn from your actions
8. **History Persistence**: Never lose insights

## 🎉 Getting Started Checklist

- [ ] Run `npm run ai-assistant`
- [ ] Try `help` command
- [ ] Fetch your first documentation
- [ ] Search the codebase
- [ ] Check your context
- [ ] View the timeline

---

**🤖 Powered by AI. Built for Developers.**
