# Crozz dApp Deployment - Quick Start

**For complete instructions, see [COMPLETE_DAPP_DEPLOYMENT_GUIDE.md](./COMPLETE_DAPP_DEPLOYMENT_GUIDE.md)**

This quick start provides the fastest path to deploy your Crozz dApp to testnet.

---

## Prerequisites

- [ ] Sui CLI installed (`sui --version`)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] pnpm installed (`pnpm --version`)
- [ ] Sui Wallet extension installed in browser
- [ ] Testnet SUI tokens (from https://faucet.testnet.sui.io)

---

## 5-Minute Deployment

### Step 1: Build & Publish Smart Contract

```bash
# Navigate to Move package
cd sui-stack-hello-world/move/hello-world

# Build
sui move build

# Switch to testnet
sui client switch --env testnet

# Get testnet SUI (if needed)
sui client faucet

# Publish
sui client publish --gas-budget 100000000

# ✅ SAVE THE PACKAGE ID FROM OUTPUT
```

### Step 2: Configure Frontend

```bash
# Navigate to UI
cd ../../ui

# Install dependencies
pnpm install

# Create environment file
cat > .env.local << EOF
VITE_SUI_NETWORK=testnet
VITE_HELLO_WORLD_PACKAGE_ID=0xYOUR_PACKAGE_ID_HERE
EOF

# Update constants.ts with your package ID
# Edit: src/constants.ts
```

### Step 3: Test Locally

```bash
# Start dev server
pnpm dev

# Open browser to http://localhost:5173
# Connect wallet and test creating a greeting
```

### Step 4: Deploy to Hosting

**Option A: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# ✅ Your dApp is now live!
```

**Option B: Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Build
pnpm build

# Deploy
netlify deploy --prod --dir=dist
```

**Option C: GitHub Pages**
```bash
# Add gh-pages package
pnpm add -D gh-pages

# Add to package.json scripts:
# "deploy": "gh-pages -d dist"

# Deploy
pnpm build
pnpm deploy
```

---

## Verify Deployment

- [ ] Visit your deployed URL
- [ ] Connect Sui Wallet
- [ ] Create a greeting transaction
- [ ] Verify transaction on explorer
- [ ] Check greeting displays correctly

---

## Quick Troubleshooting

**Wallet not connecting?**
- Refresh browser
- Check wallet is on testnet
- Try different wallet

**Transaction failing?**
```bash
# Get more SUI from faucet
sui client faucet

# Verify package ID is correct
sui client object <YOUR_PACKAGE_ID>
```

**Build errors?**
```bash
# Clean and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

---

## Next Steps

1. **Read the full guide** for advanced features: [COMPLETE_DAPP_DEPLOYMENT_GUIDE.md](./COMPLETE_DAPP_DEPLOYMENT_GUIDE.md)
2. **Customize your dApp** - Modify Move contracts and UI
3. **Add features** - Integrate dashboard, analytics, etc.
4. **Deploy to mainnet** - When ready for production

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `sui-stack-hello-world/move/hello-world/sources/greeting.move` | Smart contract |
| `sui-stack-hello-world/ui/src/constants.ts` | Package ID config |
| `sui-stack-hello-world/ui/.env.local` | Environment variables |
| `sui-stack-hello-world/ui/src/networkConfig.ts` | Network settings |

---

## Support

- 📖 **Full Guide**: [COMPLETE_DAPP_DEPLOYMENT_GUIDE.md](./COMPLETE_DAPP_DEPLOYMENT_GUIDE.md)
- 🏗️ **Architecture**: [COMPREHENSIVE_ARCHITECTURE_ANALYSIS.md](./COMPREHENSIVE_ARCHITECTURE_ANALYSIS.md)
- 🌐 **Sui Docs**: https://docs.sui.io
- 💬 **Discord**: https://discord.gg/sui
- 🔍 **Explorer**: https://suiexplorer.com/?network=testnet

---

**Time to Deploy**: ~5 minutes  
**Difficulty**: Beginner  
**Last Updated**: December 11, 2025
