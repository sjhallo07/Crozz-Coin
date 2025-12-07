#!/bin/bash

echo "🚀 Crozz-Coin Development Tools"
echo "================================"
echo ""
echo "Available tools:"
echo "1. MCP Server - Model Context Protocol server (17 tools)"
echo "2. Git Chat - Interactive Git interface"
echo "3. AI Assistant - Advanced documentation & analysis tool"
echo ""
echo "Select a tool (1-3) or 'all' to see all commands:"
read -r choice

cd /workspaces/Crozz-Coin/mcp-server

case $choice in
  1)
    echo "Starting MCP Server..."
    npm start
    ;;
  2)
    echo "Starting Git Chat..."
    npm run git-chat
    ;;
  3)
    echo "Starting AI Assistant..."
    npm run ai-assistant
    ;;
  all)
    echo ""
    echo "📌 Start MCP Server:"
    echo "   cd /workspaces/Crozz-Coin/mcp-server && npm start"
    echo ""
    echo "📌 Start Git Chat:"
    echo "   cd /workspaces/Crozz-Coin/mcp-server && npm run git-chat"
    echo ""
    echo "�� Start AI Assistant:"
    echo "   cd /workspaces/Crozz-Coin/mcp-server && npm run ai-assistant"
    echo ""
    ;;
  *)
    echo "Invalid choice"
    ;;
esac
