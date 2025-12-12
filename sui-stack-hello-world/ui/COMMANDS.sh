#!/bin/bash
# Dashboard Startup Commands
# Copy and paste these commands to get started

# ==========================================
# STEP 1: Navigate to UI Directory
# ==========================================
cd sui-stack-hello-world/ui

# ==========================================
# STEP 2: Install Dependencies (if needed)
# ==========================================
pnpm install
# or
npm install

# ==========================================
# STEP 3: Start Development Server
# ==========================================
pnpm dev
# or
npm run dev

# ==========================================
# Output: 
# The dashboard will open at:
# http://localhost:5173
# ==========================================

# ==========================================
# BUILD FOR PRODUCTION
# ==========================================
pnpm build
# Creates dist/ folder ready for deployment

# ==========================================
# DEPLOY TO VERCEL
# ==========================================
vercel deploy

# ==========================================
# DEPLOY TO NETLIFY
# ==========================================
netlify deploy --prod --dir dist

# ==========================================
# RUN TESTS (if configured)
# ==========================================
pnpm test

# ==========================================
# RUN LINTER
# ==========================================
pnpm lint

# ==========================================
# FORMAT CODE
# ==========================================
pnpm format

# ==========================================
# TROUBLESHOOTING COMMANDS
# ==========================================

# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Check TypeScript errors
npx tsc --noEmit

# View available npm scripts
cat package.json | grep -A 10 '"scripts"'

# ==========================================
# USEFUL ENVIRONMENT SETUP
# ==========================================

# Create .env.local file
cat > .env.local << 'EOF'
VITE_TESTNET_HELLO_WORLD_PACKAGE_ID=0x...
VITE_TESTNET_HELLO_WORLD_CLOCK_ID=0x...
EOF

# ==========================================
# PROMOTE YOURSELF TO ADMIN (Browser Console)
# ==========================================

# Paste this in browser DevTools Console (F12):
# 
# const myAddress = "0x..."; // Replace with your address
# const admins = JSON.parse(localStorage.getItem("admin_addresses") || "[]");
# if (!admins.includes(myAddress)) {
#   admins.push(myAddress);
#   localStorage.setItem("admin_addresses", JSON.stringify(admins));
#   console.log("✅ Admin added! Refresh page.");
# }

# ==========================================
# GET TESTNET SUI
# ==========================================

# Open in browser:
# https://faucet.sui.io
# Paste your wallet address and get test tokens

# ==========================================
# VERIFY INSTALLATION
# ==========================================

# Check Node version
node --version
# Should be 16+ (v16.0.0 or higher)

# Check pnpm version
pnpm --version
# Should be 7+ (v7.0.0 or higher)

# Check Sui CLI
sui --version

# ==========================================
# USEFUL LINKS
# ==========================================

# Documentation
# - Sui Docs: https://docs.sui.io
# - dApp Kit: https://sdk.mysten.dev/dapp-kit
# - Radix UI: https://radix-ui.com
# - React: https://react.dev

# Testnets
# - Faucet: https://faucet.sui.io
# - Explorer: https://explorer.sui.io

# ==========================================
# PACKAGE STRUCTURE
# ==========================================

# After successful deployment, update:
# src/constants.ts with new Package ID:
# export const TESTNET_HELLO_WORLD_PACKAGE_ID = "0xYOUR_NEW_PACKAGE_ID";

# ==========================================
# FILE OVERVIEW
# ==========================================

# New Component Files:
# src/Dashboard.tsx                      - Main container
# src/panels/AdminPanel.tsx              - Admin controls
# src/panels/UserPanel.tsx               - User features
# src/panels/ConfigManager.tsx           - Settings
# src/components/WalletConnectSection.tsx - Wallet UI
# src/components/RoleSelector.tsx        - Role display
# src/components/DashboardNav.tsx        - Navigation
# src/hooks/useQueryAllGreetings.ts      - Data fetching

# Documentation Files:
# DASHBOARD_README.md                    - Full feature docs
# DASHBOARD_SETUP.md                     - Setup guide
# IMPLEMENTATION_COMPLETE.md             - Implementation summary
# DASHBOARD_VISUAL_OVERVIEW.md           - Architecture diagrams

# ==========================================
# QUICK FEATURE TEST
# ==========================================

# 1. Connect Wallet
#    - Click "Connect Wallet" in browser
#    - Approve in wallet popup

# 2. Create Greeting (User)
#    - Go to "User Panel" tab
#    - Type greeting text
#    - Click "Create Greeting"

# 3. View Greetings
#    - Scroll down to "All Greetings"
#    - See your greeting in list

# 4. Become Admin (Optional)
#    - Follow console steps above
#    - Access Admin Panel tabs

# 5. Manage Greetings (Admin)
#    - Create, update, transfer
#    - Manage other users' greetings

# ==========================================
# PRODUCTION CHECKLIST
# ==========================================

# Before deploying to production:
# [ ] Test all features locally
# [ ] Update package ID in constants.ts
# [ ] Set environment variables
# [ ] Test on Testnet
# [ ] Check gas costs
# [ ] Set up error tracking
# [ ] Enable analytics
# [ ] Test on mobile
# [ ] Security audit
# [ ] Final testing

# ==========================================
# GIT COMMANDS
# ==========================================

# Check changes
git status

# Stage changes
git add .

# Commit changes
git commit -m "feat: Add greeting module dashboard with admin & user panels"

# Push to origin
git push origin main

# ==========================================
# DEBUGGING TIPS
# ==========================================

# 1. Open DevTools (F12)
# 2. Go to Console tab
# 3. Look for errors
# 4. Check localStorage:
#    - Type: localStorage
#    - View: admin_addresses, greeting_config

# 5. Network tab
#    - Monitor RPC calls
#    - Check response times

# 6. Application tab
#    - Check localStorage values
#    - Verify session storage

# ==========================================
# PERFORMANCE OPTIMIZATION
# ==========================================

# Monitor bundle size
npm run build -- --analyze

# Check TypeScript compilation time
tsc --diagnostics

# Profile React rendering
# Install React DevTools browser extension

# ==========================================
# USEFUL DOCKER COMMANDS
# ==========================================

# Build Docker image
docker build -t greeting-dashboard .

# Run Docker container
docker run -p 5173:5173 greeting-dashboard

# ==========================================
# NEXT STEPS
# ==========================================

# 1. ✅ Run: pnpm dev
# 2. ✅ Connect wallet
# 3. ✅ Create greeting
# 4. ✅ Test all features
# 5. ⏭️  Deploy to production
# 6. ⏭️  Set up event indexer
# 7. ⏭️  Build analytics dashboard
# 8. ⏭️  Add mobile app

# ==========================================
# SUPPORT & HELP
# ==========================================

# Documentation
# - See: DASHBOARD_README.md
# - See: DASHBOARD_SETUP.md
# - See: IMPLEMENTATION_COMPLETE.md
# - See: DASHBOARD_VISUAL_OVERVIEW.md

# Community
# - Sui Discord: https://discord.gg/sui
# - GitHub Issues: Report bugs
# - Stack Overflow: Tag with 'sui'

# ==========================================
# SUCCESS!
# ==========================================

# If you see:
# ✓ VITE v7.2.7  ready in 234 ms
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
#
# Then everything is working! 🎉
# Open the URL in your browser and enjoy!

# ==========================================
