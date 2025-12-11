# Complete dApp Deployment Guide for Crozz Ecosystem

**Version**: 1.0  
**Date**: December 11, 2025  
**Target Network**: Sui Testnet  
**Project**: Crozz-Coin - Sui Stack Hello World dApp

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Bytecode Resources](#2-bytecode-resources)
3. [UI Development Completion](#3-ui-development-completion)
4. [Frontend-Backend Connection](#4-frontend-backend-connection)
5. [Deployment Process](#5-deployment-process)
6. [File Relocation and Node Modules](#6-file-relocation-and-node-modules)
7. [Dashboard Integration](#7-dashboard-integration)
8. [JSON Schema and Configuration](#8-json-schema-and-configuration)
9. [Testing and Validation](#9-testing-and-validation)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Introduction

This guide provides comprehensive instructions for deploying decentralized applications (dApps) within the Crozz ecosystem on the Sui blockchain testnet. The Crozz-Coin project is a full-stack dApp built with:

- **Smart Contracts**: Move language on Sui blockchain
- **Frontend**: React 19.2.1 + TypeScript 5.9.3 + Vite 7.2.7
- **Blockchain SDK**: @mysten/sui 1.45.2 and @mysten/dapp-kit 0.19.11
- **Network**: Sui Testnet (default)

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CROZZ ECOSYSTEM                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐     ┌──────────┐   │
│  │  Move Smart  │      │  React/TS    │     │  Wallet  │   │
│  │  Contracts   │◄────►│  Frontend    │◄───►│  (Sui)   │   │
│  └──────────────┘      └──────────────┘     └──────────┘   │
│         │                      │                    │        │
│         └──────────────────────┴────────────────────┘        │
│                            │                                  │
│                    ┌───────▼────────┐                        │
│                    │  Sui Testnet   │                        │
│                    │  RPC Endpoint  │                        │
│                    └────────────────┘                        │
└───────────────────────────────────────────────────────────────┘
```

### Key References

This guide is based on the following repository documents:

- [CLAUDE.md](./sui-stack-hello-world/CLAUDE.md) - Development guidelines
- [COMPREHENSIVE_ARCHITECTURE_ANALYSIS.md](./COMPREHENSIVE_ARCHITECTURE_ANALYSIS.md) - Architecture deep dive
- [External Crates](./external-crates/) - Move compiler and VM components

---

## 2. Bytecode Resources

### 2.1 Move Smart Contract Bytecode

The Crozz ecosystem uses Move smart contracts compiled to bytecode for deployment on the Sui blockchain.

#### Location of Move Packages

```bash
sui-stack-hello-world/
├── move/hello-world/          # Main greeting contract
├── coin-standard/             # Token standard implementation
└── currency-standard/         # Currency framework
```

#### Building Move Bytecode

**Step 1: Navigate to Move Package**
```bash
cd sui-stack-hello-world/move/hello-world
```

**Step 2: Build the Package**
```bash
sui move build
```

**Expected Output:**
```
BUILDING hello_world
Successfully verified dependencies on-chain against source.
Build Successful
```

**Step 3: Verify Bytecode Generation**
```bash
ls -la build/hello_world/bytecode_modules/
# Should show: greeting.mv
```

#### Bytecode Module Structure

```
build/
└── hello_world/
    ├── bytecode_modules/
    │   └── greeting.mv          # Compiled bytecode
    ├── sources/
    │   └── greeting.move        # Source code
    ├── BuildInfo.yaml           # Build metadata
    └── package-digest           # Package hash
```

### 2.2 Publishing Bytecode to Testnet

**Step 1: Verify Sui CLI Configuration**
```bash
# Check active network
sui client active-env
# Should output: testnet

# Check active address
sui client active-address
```

**Step 2: Ensure Testnet SUI Balance**
```bash
# Check balance
sui client gas

# Request from faucet if needed
sui client faucet
```

**Step 3: Publish the Package**
```bash
sui client publish --gas-budget 100000000
```

**Step 4: Capture Package ID**

From the output, save the PackageID shown in the Published Objects section.

**Step 5: Update Frontend Configuration**
```typescript
// Update: ui/src/constants.ts
export const TESTNET_HELLO_WORLD_PACKAGE_ID = "0x1234...5678"; // Your PackageID
```

### 2.3 Bytecode Resources Required

| Resource | Location | Purpose | Size |
|----------|----------|---------|------|
| greeting.mv | build/hello_world/bytecode_modules/ | Main contract bytecode | ~2-5 KB |
| Sui Framework | On-chain dependency | Standard library | N/A (on-chain) |
| Move Stdlib | On-chain dependency | Core primitives | N/A (on-chain) |

### 2.4 Dependencies and Versions

```toml
# Move.toml
[package]
name = "hello_world"
version = "0.0.1"
edition = "2024.beta"

[dependencies]
Sui = { 
  git = "https://github.com/MystenLabs/sui.git", 
  subdir = "crates/sui-framework/packages/sui-framework", 
  rev = "framework/testnet" 
}

[addresses]
hello_world = "0x0"  # Will be replaced with actual package ID on publish
```

---

## 3. UI Development Completion

### 3.1 Current Frontend Status

The UI is **production-ready** with the following components:

```
ui/
├── src/
│   ├── components/          # React components
│   ├── hooks/              # Custom hooks
│   ├── contracts/          # Contract ABIs/types
│   ├── App.tsx             # Main application
│   ├── main.tsx            # Entry point
│   ├── constants.ts        # Configuration
│   └── networkConfig.ts    # Network settings
├── public/                 # Static assets
├── package.json            # Dependencies
└── vite.config.mts        # Build configuration
```

### 3.2 Steps to Complete UI Development

#### Step 1: Install Dependencies

```bash
cd sui-stack-hello-world/ui
pnpm install
```

**Dependencies Installed:**
- React 19.2.1
- @mysten/dapp-kit 0.19.11
- @mysten/sui 1.45.2
- @tanstack/react-query 5.90.12
- Radix UI (for components)
- TailwindCSS (for styling)

#### Step 2: Configure Environment Variables

Create `.env.local`:
```bash
# Network Configuration
VITE_SUI_NETWORK=testnet
VITE_FULLNODE_URL=https://fullnode.testnet.sui.io:443
VITE_FAUCET_URL=https://faucet.testnet.sui.io/gas

# Package IDs (update after deployment)
VITE_HELLO_WORLD_PACKAGE_ID=0x1234...5678
```

#### Step 3: Update Constants

```typescript
// src/constants.ts
export const TESTNET_HELLO_WORLD_PACKAGE_ID = 
  import.meta.env.VITE_HELLO_WORLD_PACKAGE_ID || 
  "0x1234...5678"; // Fallback

export const NETWORK = "testnet";
```

#### Step 4: Test Development Build

```bash
pnpm dev
# Server should start at http://localhost:5173
```

#### Step 5: Build for Production

```bash
pnpm build
```

**Expected Output:**
```
vite v7.2.7 building for production...
✓ 2373 modules transformed.
dist/index.html                2.27 kB │ gzip:  0.94 kB
dist/assets/index-xxx.css    702.23 kB │ gzip: 83.64 kB
dist/assets/index-xxx.js     760.02 kB │ gzip: 229.85 kB
✓ built in 16.58s
```

### 3.3 UI Testing Checklist

- [ ] Install all dependencies successfully
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] No ESLint errors (`pnpm lint`)
- [ ] Development server starts without errors
- [ ] Production build completes successfully
- [ ] Wallet connection works (tested with Sui Wallet)
- [ ] Transaction signing and execution works
- [ ] All components render correctly
- [ ] Responsive design works on mobile

---

## 4. Frontend-Backend Connection

### 4.1 Connection Architecture

The frontend connects to the Sui blockchain via RPC endpoints. There is **no traditional backend server**; instead, the blockchain acts as the backend.

```
Frontend (React)
    │
    │ @mysten/dapp-kit
    │ @mysten/sui
    │
    ├──► SuiClient (RPC)
    │       │
    │       └──► https://fullnode.testnet.sui.io:443
    │               │
    │               └──► Sui Validator Network
    │                       │
    │                       └──► Smart Contracts
    │
    └──► Wallet Extension
            │
            └──► User's Private Keys (for signing)
```

### 4.2 Setting Up RPC Connection

#### Configure SuiClient Provider

```typescript
// src/main.tsx
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { networkConfig } from "./networkConfig";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider>
          <App />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
```

### 4.3 RPC Endpoints Configuration

```typescript
// Network endpoints for different environments
const ENDPOINTS = {
  testnet: {
    fullnode: "https://fullnode.testnet.sui.io:443",
    faucet: "https://faucet.testnet.sui.io/gas",
    graphql: "https://sui-testnet.mystenlabs.com/graphql",
    explorer: "https://suiexplorer.com/?network=testnet",
  },
  mainnet: {
    fullnode: "https://fullnode.mainnet.sui.io:443",
    graphql: "https://sui-mainnet.mystenlabs.com/graphql",
    explorer: "https://suiexplorer.com/?network=mainnet",
  },
  localnet: {
    fullnode: "http://127.0.0.1:9000",
    faucet: "http://127.0.0.1:9123",
    graphql: "http://127.0.0.1:9125/graphql",
  },
};
```

---

## 5. Deployment Process

### 5.1 Overview of Deployment Steps

The deployment involves two main components:
1. **Smart Contracts** - Deploy to Sui blockchain
2. **Frontend** - Deploy to hosting service

### 5.2 Smart Contract Deployment (Detailed)

#### Prerequisites

- Sui CLI installed and configured
- Testnet wallet with SUI tokens
- Move package built successfully

#### Step-by-Step Deployment

**1. Verify Environment**
```bash
# Check Sui CLI version
sui --version

# Check active network
sui client active-env
# Expected: testnet

# Check wallet balance
sui client gas
# Should have at least 1 SUI for gas
```

**2. Build Move Package**
```bash
cd sui-stack-hello-world/move/hello-world
sui move build
```

**3. Test Move Package (Optional but Recommended)**
```bash
sui move test
```

**4. Publish to Testnet**
```bash
sui client publish --gas-budget 100000000
```

**5. Save Deployment Information**

From the output, save:
- **Package ID**: Used in frontend configuration
- **Transaction Digest**: For verification
- **Object Changes**: Created objects

### 5.3 Frontend Deployment to Free Hosting

#### Option 1: Vercel (Recommended)

**Prerequisites:**
- GitHub account
- Vercel account (free tier)

**Step 1: Prepare for Deployment**
```bash
cd sui-stack-hello-world/ui

# Build the application
pnpm build
```

**Step 2: Create vercel.json**
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "pnpm install"
}
```

**Step 3: Configure Environment Variables**

In Vercel Dashboard:
- Go to Project Settings → Environment Variables
- Add:
  - `VITE_SUI_NETWORK=testnet`
  - `VITE_HELLO_WORLD_PACKAGE_ID=<your_package_id>`

**Step 4: Deploy via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Step 5: Deploy via GitHub Integration**
1. Push code to GitHub
2. Connect repository to Vercel
3. Automatic deployment on every push

#### Option 2: Netlify

**Step 1: Create netlify.toml**
```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Step 2: Deploy via Netlify CLI**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

#### Option 3: GitHub Pages

**Step 1: Update vite.config.mts**
```typescript
export default defineConfig({
  base: '/Crozz-Coin/', // Your repository name
  plugins: [react()],
});
```

**Step 2: Add Deployment Script to package.json**
```json
{
  "scripts": {
    "predeploy": "pnpm build",
    "deploy": "gh-pages -d dist"
  }
}
```

**Step 3: Deploy**
```bash
pnpm add -D gh-pages
pnpm deploy
```

#### Option 4: Cloudflare Pages

**Step 1: Build Configuration**
```
Build command: pnpm build
Build output directory: dist
```

**Step 2: Deploy via Wrangler**
```bash
# Install Wrangler
npm i -g wrangler

# Login
wrangler login

# Deploy
wrangler pages deploy dist
```

### 5.4 Post-Deployment Verification

**Checklist:**
- [ ] Frontend loads without errors
- [ ] Wallet connection works
- [ ] Network indicator shows "testnet"
- [ ] Can create transactions
- [ ] Transactions succeed on blockchain
- [ ] Explorer links work correctly
- [ ] Mobile responsive design verified

---

## 6. File Relocation and Node Modules

### 6.1 Project Structure Organization

#### Current Structure
```
Crozz-Coin/
├── sui-stack-hello-world/        # Main dApp
│   ├── move/hello-world/         # Smart contracts
│   ├── ui/                       # Frontend application
│   │   ├── src/
│   │   ├── public/
│   │   ├── node_modules/         # Dependencies (gitignored)
│   │   ├── package.json
│   │   └── pnpm-lock.yaml
│   ├── coin-standard/            # Token contracts
│   └── currency-standard/        # Currency contracts
├── dashboards/                    # Dashboard services
├── external-crates/              # Move compiler components
└── dapps/                        # Additional dApps
```

### 6.2 Node Modules Setup

#### Installing Dependencies

**For Main UI:**
```bash
cd sui-stack-hello-world/ui
pnpm install
```

**For Dashboard (if applicable):**
```bash
cd dashboards
pnpm install
```

**Expected node_modules size:** ~300-500 MB

#### Essential Node Modules

| Package | Version | Purpose | Size |
|---------|---------|---------|------|
| @mysten/sui | 1.45.2 | Sui SDK core | ~15 MB |
| @mysten/dapp-kit | 0.19.11 | dApp integration | ~5 MB |
| react | 19.2.1 | UI framework | ~1 MB |
| @tanstack/react-query | 5.90.12 | Data fetching | ~800 KB |
| vite | 7.2.7 | Build tool | ~25 MB |

### 6.3 Node Modules Optimization

#### Reduce Installation Size

**Step 1: Use pnpm (Content-Addressable Storage)**
```bash
# pnpm stores packages once, links across projects
# Saves ~50% disk space for multiple projects
pnpm install
```

**Step 2: Production-Only Install**
```bash
# For production deployment
pnpm install --prod
# Excludes devDependencies (~40% size reduction)
```

### 6.4 Gitignore Configuration

Ensure proper gitignore for node_modules:

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build output
dist/
build/
.vite/

# Environment
.env.local
.env.*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
pnpm-debug.log*
```

---

## 7. Dashboard Integration

### 7.1 Dashboard Folder Structure

The `dashboards/` directory provides client services and admin interfaces.

```
dashboards/
├── README.md
├── package.json
├── src/
│   ├── components/
│   │   ├── Analytics.tsx
│   │   ├── TransactionMonitor.tsx
│   │   └── UserManagement.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── blockchain.ts
│   └── App.tsx
└── public/
```

### 7.2 Setting Up Dashboard Services

#### Install Dashboard Dependencies

```bash
cd dashboards
pnpm install
```

#### Dashboard Configuration

```typescript
// dashboards/src/config.ts
export const DASHBOARD_CONFIG = {
  network: "testnet",
  rpcEndpoint: "https://fullnode.testnet.sui.io:443",
  refreshInterval: 5000, // 5 seconds
  
  // Admin addresses (optional)
  adminAddresses: [
    "0xabcd...1234",
    "0xefgh...5678",
  ],
};
```

### 7.3 Dashboard Features

The dashboard can provide:
- Transaction monitoring
- User analytics
- System health checks
- Contract management
- Real-time metrics

### 7.4 Dashboard Deployment

**Separate Deployment from Main dApp:**

```bash
# Build dashboard
cd dashboards
pnpm build

# Deploy to subdomain
# dashboard.your-domain.com
vercel --prod
```

---

## 8. JSON Schema and Configuration

### 8.1 Vercel JSON Schema

The repository uses Vercel's JSON schema for deployment configuration:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": {
    "deploymentEnabled": {
      "gh-pages": false
    }
  }
}
```

#### Schema Purpose

- **Validation**: Ensures vercel.json has correct structure
- **Autocomplete**: IDEs provide suggestions based on schema
- **Documentation**: Schema documents available configuration options

### 8.2 Relevance to Deployment

#### Why This Schema Matters

1. **Deployment Configuration**: Defines how Vercel builds and deploys the project
2. **Git Integration**: Controls which branches trigger deployments
3. **Build Settings**: Specifies build commands and output directories
4. **Environment Variables**: Can include environment-specific settings

#### Extended Configuration Example

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "pnpm install",
  "devCommand": "pnpm dev",
  
  "git": {
    "deploymentEnabled": {
      "gh-pages": false,
      "main": true,
      "develop": true
    }
  },
  
  "env": {
    "VITE_SUI_NETWORK": "testnet"
  },
  
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### 8.3 Configuration for Different Platforms

#### Netlify (netlify.toml)

```toml
[build]
  command = "pnpm build"
  publish = "dist"
  
[build.environment]
  VITE_SUI_NETWORK = "testnet"
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

### 8.4 Environment Variables Schema

Create `.env.example` for documentation:

```bash
# Network Configuration
VITE_SUI_NETWORK=testnet

# RPC Endpoints
VITE_FULLNODE_URL=https://fullnode.testnet.sui.io:443
VITE_FAUCET_URL=https://faucet.testnet.sui.io/gas

# Smart Contract Package IDs
VITE_HELLO_WORLD_PACKAGE_ID=0x1234567890abcdef...

# Optional: Analytics
VITE_ANALYTICS_ID=
```

---

## 9. Testing and Validation

### 9.1 Smart Contract Testing

#### Unit Tests for Move Contracts

```bash
cd sui-stack-hello-world/move/hello-world
sui move test
```

**Expected Output:**
```
Running Move unit tests
[ PASS    ] 0x0::greeting::test_create_greeting
[ PASS    ] 0x0::greeting::test_update_greeting
Test result: OK. Total tests: 2; passed: 2; failed: 0
```

### 9.2 Frontend Testing

#### Development Testing

```bash
cd sui-stack-hello-world/ui

# Type check
pnpm tsc --noEmit

# Lint check
pnpm lint

# Build test
pnpm build
```

### 9.3 Integration Testing

#### Test Against Local Network

**Step 1: Start Local Sui Network**
```bash
sui start --with-faucet --force-regenesis --epoch-duration-ms 5000
```

**Step 2: Publish Contract to Local Network**
```bash
sui client switch --env local
sui client publish --gas-budget 100000000
```

**Step 3: Run Frontend Tests**
```bash
cd ui
VITE_SUI_NETWORK=local pnpm dev
```

### 9.4 Validation Checklist

#### Pre-Deployment Validation

- [ ] All Move tests pass
- [ ] Frontend builds without errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All environment variables configured
- [ ] Package ID updated in constants
- [ ] Wallet connection tested
- [ ] Transaction signing tested
- [ ] Transaction execution tested on testnet
- [ ] Explorer links verified
- [ ] Mobile responsiveness checked

#### Post-Deployment Validation

- [ ] Deployed frontend accessible
- [ ] SSL certificate active (HTTPS)
- [ ] Wallet connection works on production
- [ ] Transactions execute successfully
- [ ] No console errors in production
- [ ] Analytics tracking functional (if applicable)
- [ ] Error monitoring active (if applicable)

---

## 10. Troubleshooting

### 10.1 Common Issues and Solutions

#### Issue: "Package not found" Error

**Symptoms:**
```
Error: Package '0x123...' not found
```

**Solutions:**
1. Verify package ID is correct in constants.ts
2. Ensure package was published to correct network
3. Check network configuration matches deployment network

```bash
# Verify package exists
sui client object <PACKAGE_ID> --network testnet
```

#### Issue: "Insufficient Gas" Error

**Symptoms:**
```
Transaction failed: InsufficientGas
```

**Solutions:**
1. Request more SUI from faucet:
```bash
sui client faucet
```

2. Check gas budget in transaction
3. Verify wallet has SUI:
```bash
sui client gas
```

#### Issue: "Wallet Not Detected"

**Symptoms:**
- Connect button doesn't show wallet options
- "No wallets detected" message

**Solutions:**
1. Install wallet extension (Sui Wallet, Slush, etc.)
2. Refresh browser page (Ctrl+Shift+R)
3. Check browser console for errors
4. Verify wallet extension is enabled
5. Try different wallet

#### Issue: "Network Connection Failed"

**Symptoms:**
```
Error: Failed to fetch from https://fullnode.testnet.sui.io
```

**Solutions:**
1. Check internet connection
2. Verify RPC endpoint is accessible
3. Try alternative RPC endpoint
4. Check for firewall/proxy issues

#### Issue: "Transaction Rejected by User"

**Symptoms:**
```
Error: User rejected the request
```

**Solutions:**
- This is expected when user clicks "Reject"
- Add proper error handling in your code

### 10.2 Build and Deployment Issues

#### Issue: "Module Not Found" During Build

**Symptoms:**
```
Error: Cannot find module '@mysten/sui'
```

**Solutions:**
```bash
# Clear node modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Clear pnpm cache if needed
pnpm store prune
```

#### Issue: Vite Build Fails

**Symptoms:**
```
Error: Build failed with X errors
```

**Solutions:**
1. Check for TypeScript errors:
```bash
tsc --noEmit
```

2. Verify all imports are correct
3. Check for circular dependencies
4. Update dependencies:
```bash
pnpm update
```

#### Issue: Vercel Deployment Fails

**Symptoms:**
- Build succeeds locally but fails on Vercel

**Solutions:**
1. Check Vercel build logs
2. Verify environment variables are set
3. Ensure Node version matches
4. Check build command in vercel.json

### 10.3 Support Resources

#### Official Documentation
- Sui Docs: https://docs.sui.io
- dApp Kit: https://sdk.mystenlabs.com/dapp-kit
- Move Book: https://move-language.github.io/move/

#### Community Support
- Discord: https://discord.gg/sui
- Forum: https://forums.sui.io
- GitHub Issues: https://github.com/MystenLabs/sui/issues

#### Tools and Explorers
- Sui Explorer: https://suiexplorer.com
- Testnet Faucet: https://faucet.testnet.sui.io
- Network Status: https://suistats.com

---

## Appendix A: Quick Reference Commands

### Smart Contract Commands
```bash
# Build Move package
sui move build

# Test Move package
sui move test

# Publish to testnet
sui client publish --gas-budget 100000000

# Verify deployment
sui client object <PACKAGE_ID>
```

### Frontend Commands
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run linter
pnpm lint

# Type check
tsc --noEmit
```

### Deployment Commands
```bash
# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod --dir=dist

# Deploy to GitHub Pages
pnpm deploy
```

### Testing Commands
```bash
# Run Move tests
sui move test

# Type check frontend
tsc --noEmit

# Start local Sui network
sui start --with-faucet
```

---

## Appendix B: Configuration Templates

### Environment Variables (.env.local)
```bash
# Network
VITE_SUI_NETWORK=testnet

# RPC
VITE_FULLNODE_URL=https://fullnode.testnet.sui.io:443
VITE_FAUCET_URL=https://faucet.testnet.sui.io/gas

# Package IDs
VITE_HELLO_WORLD_PACKAGE_ID=0x...

# Optional
VITE_ANALYTICS_ID=
VITE_SENTRY_DSN=
```

### Vercel Configuration (vercel.json)
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "pnpm install"
}
```

### Netlify Configuration (netlify.toml)
```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Conclusion

This comprehensive guide provides all necessary information for deploying dApps within the Crozz ecosystem on Sui testnet. Follow the steps sequentially, validate each stage, and refer to the troubleshooting section for common issues.

**Key Takeaways:**

1. ✅ Move smart contracts must be built and published to Sui testnet
2. ✅ Frontend requires proper configuration with package IDs and network settings
3. ✅ Multiple free hosting options available (Vercel, Netlify, GitHub Pages, Cloudflare)
4. ✅ Dashboard services can be integrated for admin/client interfaces
5. ✅ Comprehensive testing validates deployment success
6. ✅ JSON schema ensures proper configuration across platforms

**Next Steps:**

1. Follow Section 2 to deploy smart contracts
2. Complete UI development per Section 3
3. Deploy frontend using Section 5
4. Integrate dashboard if needed (Section 7)
5. Validate with Section 9
6. Monitor and maintain with Section 10

---

**Document Version**: 1.0  
**Last Updated**: December 11, 2025  
**Maintained By**: Crozz-Coin Development Team  
**License**: MIT
