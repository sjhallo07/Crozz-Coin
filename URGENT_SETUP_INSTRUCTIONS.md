# 🚨 URGENT SETUP INSTRUCTIONS - Crozz-Coin
## Critical Steps to Get Your Application Running

**Created**: December 7, 2025  
**Priority**: 🔴 CRITICAL  
**Estimated Time**: 2-3 hours

---

## ⚡ QUICK START (5 Minutes)

```bash
# 1. Update all dApp dependencies (CRITICAL)
cd /workspaces/Crozz-Coin/dapps/kiosk
pnpm install @mysten/dapp-kit@0.19.11 @mysten/sui@1.45.2 @tanstack/react-query@5.90.12

cd ../multisig-toolkit
pnpm install @mysten/dapp-kit@0.19.11 @mysten/sui@1.45.2 @tanstack/react-query@5.90.12

cd ../sponsored-transactions
pnpm install @mysten/dapp-kit@0.19.11 @mysten/sui@1.45.2 @tanstack/react-query@5.90.12

# 2. Start a dApp (choose one)
cd /workspaces/Crozz-Coin/dapps/kiosk
pnpm install
pnpm dev
# Open browser to http://localhost:5173
```

---

## 🔴 CRITICAL ISSUES TO FIX IMMEDIATELY

### 1. OUTDATED DEPENDENCIES (Security Risk)

**Problem**: All dApps are using versions that are 5-27 versions behind

**Impact**: 
- Security vulnerabilities
- Missing features
- Potential bugs
- Incompatibility issues

**Solution**:

```bash
# Update each dApp
cd /workspaces/Crozz-Coin/dapps/kiosk
pnpm add @mysten/dapp-kit@0.19.11 @mysten/sui@1.45.2 @tanstack/react-query@5.90.12

cd /workspaces/Crozz-Coin/dapps/multisig-toolkit
pnpm add @mysten/dapp-kit@0.19.11 @mysten/sui@1.45.2 @tanstack/react-query@5.90.12

cd /workspaces/Crozz-Coin/dapps/sponsored-transactions
pnpm add @mysten/dapp-kit@0.19.11 @mysten/sui@1.45.2 @tanstack/react-query@5.90.12

cd /workspaces/Crozz-Coin/dapps/kiosk-cli
pnpm add @mysten/sui@1.45.2
```

**Verification**:
```bash
# Check versions after update
grep -A 3 '"dependencies"' /workspaces/Crozz-Coin/dapps/kiosk/package.json
```

---

### 2. NO DATABASE RUNNING (Data Layer Missing)

**Problem**: Indexer database not configured or running

**Impact**:
- Cannot query historical blockchain data
- No transaction history
- Limited dApp functionality

**Solution - Option A: Local Development (Docker)**

```bash
# 1. Start PostgreSQL with Docker
docker run -d \
  --name sui-indexer-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=sui_indexer \
  -p 5432:5432 \
  -v sui-pgdata:/var/lib/postgresql/data \
  postgres:14

# 2. Wait for PostgreSQL to start
sleep 10

# 3. Verify connection
docker exec -it sui-indexer-db psql -U postgres -c "SELECT version();"

# 4. Run database migrations
cd /workspaces/Crozz-Coin/crates/sui-indexer
DATABASE_URL=postgres://postgres:postgres@localhost:5432/sui_indexer
diesel migration run --database-url $DATABASE_URL

# 5. Start the indexer (in background)
cargo run --release --bin sui-indexer -- \
  --db-url postgres://postgres:postgres@localhost:5432/sui_indexer \
  --rpc-client-url https://fullnode.testnet.sui.io:443 \
  &
```

**Solution - Option B: Production (Managed Service)**

```bash
# Use AWS RDS, Google Cloud SQL, or Supabase
# Example connection string:
DATABASE_URL=postgres://username:password@your-db-host.com:5432/sui_indexer

# Run migrations
cd /workspaces/Crozz-Coin/crates/sui-indexer
diesel migration run --database-url $DATABASE_URL

# Deploy indexer to production server
cargo build --release --bin sui-indexer
./target/release/sui-indexer \
  --db-url $DATABASE_URL \
  --rpc-client-url https://fullnode.testnet.sui.io:443
```

---

### 3. NETWORK CONFIGURATION (Testnet vs Mainnet)

**Problem**: Need to ensure all dApps connect to the correct network

**Current Status**: ✅ Testnet (good for development)

**For Production Deployment**:

Update each dApp's network configuration:

```typescript
// File: dapps/kiosk/src/Root.tsx
const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl('mainnet') },  // Production
  testnet: { url: getFullnodeUrl('testnet') },  // Testing
});

// Change default network
<SuiClientProvider 
  defaultNetwork="mainnet"  // Changed from "testnet"
  networks={networkConfig}
>
```

**⚠️ IMPORTANT**: 
- Use **testnet** for development/testing
- Use **mainnet** only for production
- Never test with real funds on mainnet

---

## 📋 STEP-BY-STEP SETUP GUIDE

### Step 1: Prerequisites Installation

```bash
# Install Node.js 18+ (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install Rust (if not installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install PostgreSQL client tools
sudo apt-get install -y postgresql-client

# Install Docker (if not installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Step 2: Clone and Setup Repository

```bash
# If not already cloned
cd /workspaces
git clone https://github.com/your-repo/Crozz-Coin.git
cd Crozz-Coin

# Install all dependencies
pnpm install

# Build Rust components
cargo build --release
```

### Step 3: Database Setup (Choose One)

**Option A: Quick Docker Setup (Recommended for Development)**

```bash
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:14
    container_name: sui-indexer-db
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
      POSTGRES_DB: sui_indexer
    ports:
      - "5432:5432"
    volumes:
      - sui-pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  sui-pgdata:
EOF

# Start database
docker-compose up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 15
```

**Option B: Install PostgreSQL Locally**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb sui_indexer
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

### Step 4: Run Database Migrations

```bash
# Install diesel CLI if not installed
cargo install diesel_cli --no-default-features --features postgres

# Set database URL
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/sui_indexer

# Run migrations
cd /workspaces/Crozz-Coin/crates/sui-indexer
diesel migration run

# Verify tables were created
psql $DATABASE_URL -c "\dt"
```

### Step 5: Start the Indexer

```bash
# Build indexer (first time)
cd /workspaces/Crozz-Coin
cargo build --release --bin sui-indexer

# Start indexer in background
nohup ./target/release/sui-indexer \
  --db-url postgres://postgres:postgres@localhost:5432/sui_indexer \
  --rpc-client-url https://fullnode.testnet.sui.io:443 \
  > indexer.log 2>&1 &

# Save the process ID
echo $! > indexer.pid

# Monitor indexer logs
tail -f indexer.log
```

### Step 6: Update and Start Frontend dApps

```bash
# Update dependencies for each dApp
cd /workspaces/Crozz-Coin/dapps

# Kiosk dApp
cd kiosk
pnpm add @mysten/dapp-kit@0.19.11 @mysten/sui@1.45.2 @tanstack/react-query@5.90.12
pnpm install
pnpm dev &  # Runs on http://localhost:5173

# Multisig Toolkit
cd ../multisig-toolkit
pnpm add @mysten/dapp-kit@0.19.11 @mysten/sui@1.45.2 @tanstack/react-query@5.90.12
pnpm install
# pnpm dev  # Uncomment to run (different port)

# Sponsored Transactions
cd ../sponsored-transactions
pnpm add @mysten/dapp-kit@0.19.11 @mysten/sui@1.45.2 @tanstack/react-query@5.90.12
pnpm install
# pnpm dev  # Uncomment to run (different port)
```

### Step 7: Install Wallet Extension

**Required**: You need a Sui-compatible wallet to interact with dApps

1. **Sui Wallet** (Recommended)
   - Chrome: https://chrome.google.com/webstore/detail/sui-wallet/
   - Install extension
   - Create new wallet or import existing
   - Switch to Testnet network

2. **Alternative Wallets**:
   - Suiet Wallet
   - Ethos Wallet
   - Martian Wallet

### Step 8: Get Testnet SUI Tokens

```bash
# Method 1: Using Sui CLI
sui client faucet

# Method 2: Web Faucet
# Visit: https://faucet.testnet.sui.io/
# Enter your wallet address

# Method 3: Discord Faucet
# Join Sui Discord: https://discord.gg/sui
# Use #testnet-faucet channel
```

### Step 9: Deploy Smart Contracts (if needed)

```bash
# Navigate to regulated-token contract
cd /workspaces/Crozz-Coin/dapps/regulated-token

# Build Move package
sui move build

# Test Move package
sui move test

# Deploy to testnet
sui client publish --gas-budget 100000000

# Save the package ID from output
# Example: 0x1234...abcd
```

### Step 10: Verify Everything is Running

```bash
# Check database
psql postgres://postgres:postgres@localhost:5432/sui_indexer \
  -c "SELECT COUNT(*) FROM transactions;"

# Check indexer process
ps aux | grep sui-indexer

# Check indexer logs
tail -n 50 indexer.log

# Check frontend dApps
curl http://localhost:5173  # Should return HTML

# Check RPC connectivity
curl https://fullnode.testnet.sui.io:443 \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"sui_getLatestCheckpointSequenceNumber","params":[]}'
```

---

## 🧪 TESTING CHECKLIST

### ✅ Database Tests

```bash
# 1. Check PostgreSQL is running
docker ps | grep postgres
# OR
systemctl status postgresql

# 2. Check database connection
psql postgres://postgres:postgres@localhost:5432/sui_indexer -c "SELECT 1;"

# 3. Check tables exist
psql postgres://postgres:postgres@localhost:5432/sui_indexer -c "\dt"

# 4. Check indexer is writing data
psql postgres://postgres:postgres@localhost:5432/sui_indexer \
  -c "SELECT COUNT(*) as transaction_count FROM transactions;"
```

### ✅ Frontend Tests

```bash
# 1. Check dApp is running
curl -I http://localhost:5173

# 2. Open in browser
# Visit: http://localhost:5173

# 3. Test wallet connection
# - Click "Connect Wallet" button
# - Select your wallet
# - Approve connection

# 4. Test transaction
# - Try to create a transaction
# - Sign with wallet
# - Verify it executes
```

### ✅ Smart Contract Tests

```bash
# 1. Navigate to contract directory
cd /workspaces/Crozz-Coin/dapps/regulated-token

# 2. Run Move tests
sui move test

# 3. Build package
sui move build

# Expected output: BUILD SUCCESSFUL
```

### ✅ Network Connectivity Tests

```bash
# 1. Test Testnet RPC
curl https://fullnode.testnet.sui.io:443 \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"sui_getLatestCheckpointSequenceNumber","params":[]}'

# 2. Test GraphQL endpoint
curl https://graphql.testnet.sui.io/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"{ chainIdentifier }"}'

# 3. Test Faucet
curl -X POST https://faucet.testnet.sui.io/gas \
  -H "Content-Type: application/json" \
  -d '{"recipient":"YOUR_WALLET_ADDRESS"}'
```

---

## 🔧 TROUBLESHOOTING

### Problem: "Cannot connect to PostgreSQL"

```bash
# Solution 1: Check if PostgreSQL is running
docker ps | grep postgres
# OR
sudo systemctl status postgresql

# Solution 2: Restart PostgreSQL
docker restart sui-indexer-db
# OR
sudo systemctl restart postgresql

# Solution 3: Check port is not in use
sudo netstat -tulpn | grep 5432

# Solution 4: Check connection string
psql postgres://postgres:postgres@localhost:5432/sui_indexer
```

### Problem: "Module not found" or "Cannot find package"

```bash
# Solution: Clean install
cd /workspaces/Crozz-Coin/dapps/kiosk
rm -rf node_modules pnpm-lock.yaml
pnpm install

# If still failing, update pnpm
npm install -g pnpm@latest
pnpm install
```

### Problem: "Cargo build failed"

```bash
# Solution 1: Update Rust
rustup update stable

# Solution 2: Clean build
cargo clean
cargo build --release

# Solution 3: Install missing dependencies
sudo apt-get update
sudo apt-get install -y build-essential pkg-config libssl-dev
```

### Problem: "Wallet not connecting"

```bash
# Solution 1: Check wallet is on correct network
# Open wallet extension → Settings → Network → Select "Testnet"

# Solution 2: Refresh browser
# Press Ctrl+Shift+R (hard refresh)

# Solution 3: Clear browser cache
# Open DevTools → Application → Clear storage

# Solution 4: Reconnect wallet
# Disconnect in dApp → Disconnect in wallet → Reconnect
```

### Problem: "Indexer not syncing"

```bash
# Check indexer logs
tail -f indexer.log

# Common issues:
# 1. Database connection - Check DATABASE_URL
# 2. RPC endpoint down - Try different endpoint
# 3. Out of disk space - Check df -h

# Restart indexer
pkill -f sui-indexer
./target/release/sui-indexer \
  --db-url postgres://postgres:postgres@localhost:5432/sui_indexer \
  --rpc-client-url https://fullnode.testnet.sui.io:443 \
  > indexer.log 2>&1 &
```

### Problem: "Transaction failed with insufficient gas"

```bash
# Solution: Get more SUI from faucet
sui client faucet

# Or visit web faucet
# https://faucet.testnet.sui.io/

# Check your balance
sui client gas

# If still failing, increase gas budget in transaction
# In code: tx.setGasBudget(100000000)
```

---

## 🚀 PRODUCTION DEPLOYMENT CHECKLIST

### Before Going to Mainnet

- [ ] **Smart Contract Audit**: Hire professional auditors
- [ ] **Security Review**: Penetration testing on frontend
- [ ] **Database Backup**: Automated backup system
- [ ] **Monitoring**: Setup Grafana/Prometheus
- [ ] **Load Testing**: Test with 1000+ concurrent users
- [ ] **CDN Setup**: Use Vercel/Cloudflare for frontend
- [ ] **SSL Certificates**: HTTPS for all endpoints
- [ ] **Rate Limiting**: Implement API rate limits
- [ ] **Error Tracking**: Setup Sentry or similar
- [ ] **Documentation**: API docs, user guides
- [ ] **Legal Review**: Terms of service, privacy policy
- [ ] **Incident Response Plan**: On-call rotation

### Mainnet Configuration Changes

```typescript
// 1. Update network in all dApps
defaultNetwork="mainnet"

// 2. Update RPC endpoints
const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl('mainnet') },
});

// 3. Remove testnet-only features
// - Remove faucet links
// - Remove debug logs
// - Remove test accounts

// 4. Update smart contract addresses
// - Use mainnet package IDs
// - Update all contract references

// 5. Database configuration
// - Use production PostgreSQL
// - Enable connection pooling
// - Setup read replicas
```

---

## 📞 SUPPORT & RESOURCES

### Official Documentation
- **Sui Docs**: https://docs.sui.io
- **dApp Kit**: https://sdk.mystenlabs.com/dapp-kit
- **Move Language**: https://move-language.github.io/move/

### Community Support
- **Discord**: https://discord.gg/sui
- **Forum**: https://forums.sui.io
- **GitHub**: https://github.com/MystenLabs/sui

### Emergency Contacts
- **Critical Bugs**: File issue on GitHub
- **Security Issues**: security@mystenlabs.com
- **Community Help**: #dev-general on Discord

---

## 📝 QUICK REFERENCE COMMANDS

```bash
# Start everything
docker-compose up -d                                    # Database
./target/release/sui-indexer --db-url ... &            # Indexer
cd dapps/kiosk && pnpm dev &                           # Frontend

# Stop everything
pkill -f sui-indexer                                    # Stop indexer
docker-compose down                                     # Stop database
pkill -f "pnpm dev"                                     # Stop frontend

# Check status
docker ps                                               # Database
ps aux | grep sui-indexer                              # Indexer
curl http://localhost:5173                             # Frontend

# View logs
docker logs sui-indexer-db                             # Database
tail -f indexer.log                                    # Indexer
# (Frontend logs in terminal)

# Database queries
psql postgres://postgres:postgres@localhost:5432/sui_indexer
SELECT COUNT(*) FROM transactions;
SELECT COUNT(*) FROM objects;
SELECT COUNT(*) FROM events;
\q

# Get testnet tokens
sui client faucet

# Deploy contract
cd dapps/regulated-token
sui move build
sui client publish --gas-budget 100000000
```

---

**Document Status**: ✅ Ready for Immediate Use  
**Last Updated**: December 7, 2025  
**Priority**: 🔴 CRITICAL - Follow these steps before production deployment

**Estimated Setup Time**:
- Quick Start: 5 minutes
- Full Setup: 2-3 hours
- Production Ready: 1-2 weeks (including audits and testing)
