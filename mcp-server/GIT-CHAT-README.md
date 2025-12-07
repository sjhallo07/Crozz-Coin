# Git Chat Interface - GitKraken Alternative for Codespaces

Interactive chat interface for Git commands with natural language support. A lightweight GitKraken alternative that runs in your terminal.

## 🚀 Quick Start

```bash
cd /workspaces/Crozz-Coin/mcp-server
npm run git-chat
```

Or directly:
```bash
node git-chat.js
```

## 💬 Natural Language Commands

Talk to Git like you would to a person:

### Status & Info
```
status
what's the status?
show me the status
```

### Commit History
```
log
history
show last 5 commits
commits
```

### Changes & Diffs
```
diff
what changed?
show changes
diff staged    (for staged changes)
```

### Branches
```
branches
list branches
show all branches
```

### Staging Files
```
add .
add src/file.rs
stage all
stage src/
```

### Committing
```
commit fix authentication bug
commit add new feature
commit "your message here"
```

### Push & Pull
```
push
pull
push origin main
```

### Branch Switching
```
checkout main
switch develop
checkout -b new-feature
```

### Stash
```
stash
stash pop
stash list
```

### Remotes
```
remote
show remotes
```

## 🎯 Direct Git Commands

Execute any git command directly:

```
git log --graph --all
git diff HEAD~1
git rebase -i HEAD~3
git cherry-pick abc123
```

## 📋 Built-in Commands

- `help` - Show all available commands
- `history` - Show your chat history
- `clear` - Clear the screen
- `exit` or `quit` - Exit the chat

## 🎨 Features

- **Natural Language Processing**: Understand conversational Git commands
- **Color-coded Output**: Easy-to-read colored terminal output
- **Chat History**: Track all your commands
- **Error Handling**: Friendly error messages
- **Full Git Support**: Execute any Git command

## 📖 Usage Examples

### Daily Workflow

```bash
# Start git-chat
npm run git-chat

# Check what's going on
> status

# See recent commits
> show last 10 commits

# Check your changes
> what changed?

# Stage everything
> add .

# Commit your work
> commit implement new API endpoint

# Push to remote
> push

# Exit when done
> exit
```

### Working with Branches

```bash
> branches
> checkout develop
> git checkout -b feature/new-ui
> branches
```

### Reviewing Changes

```bash
> diff
> diff staged
> git diff HEAD~1
> git show abc123
```

## 🔧 Advanced Usage

### Create Aliases

Add to your `.bashrc` or `.zshrc`:

```bash
alias gchat='cd /workspaces/Crozz-Coin/mcp-server && npm run git-chat'
```

Then just run:
```bash
gchat
```

### Integration with MCP Server

The Git chat interface works alongside the MCP server. You can:
- Use MCP server for programmatic Git access
- Use Git chat for interactive terminal sessions

Both tools share the same Git repository and work seamlessly together.

## 🆚 Comparison with GitKraken

| Feature | GitKraken | Git Chat |
|---------|-----------|----------|
| GUI | ✅ Desktop GUI | ❌ Terminal-based |
| Codespaces | ❌ Not available | ✅ Works perfectly |
| Natural Language | ❌ | ✅ |
| Full Git Commands | ✅ | ✅ |
| Visual Graph | ✅ | ❌ (use `git log --graph`) |
| Free | ❌ Limited | ✅ Free |
| Speed | Medium | ⚡ Instant |

## 🎓 Tips

1. **Use natural language** - Don't memorize commands, just ask naturally
2. **Tab completion** - Your terminal's tab completion works with git commands
3. **Command history** - Use up/down arrows to recall previous commands
4. **Combine with MCP** - Use git-chat for interactive work, MCP for automation
5. **Learn Git** - Seeing the actual Git commands helps you learn

## 🐛 Troubleshooting

### Permission Denied
```bash
chmod +x /workspaces/Crozz-Coin/mcp-server/git-chat.js
```

### Command Not Found
Make sure you're in the mcp-server directory:
```bash
cd /workspaces/Crozz-Coin/mcp-server
```

### Git Errors
The chat interface shows Git's actual error messages, so you can debug easily.

## 🚀 Pro Tips for Crozz-Coin Development

### Before Starting Work
```
> status
> pull
> checkout develop
```

### During Development
```
> diff
> add crates/sui-core/
> commit fix consensus bug in validator
```

### Before Pushing
```
> status
> log
> push
```

### Quick Checks
```
> show last 5 commits
> branches
> what changed?
```

## 📚 More Resources

- Git Documentation: https://git-scm.com/doc
- GitHub Codespaces: https://docs.github.com/codespaces
- MCP Server README: See main README.md

---

**🎉 Enjoy your GitKraken-alternative Git Chat experience!**
