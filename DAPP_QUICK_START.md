# Crozz Coin DApp - Quick Start Guide

**🚀 Get Started with Crozz Service Marketplace in 5 Minutes**

---

## What is Crozz Service Marketplace?

A decentralized Function-as-a-Service (FaaS) platform built on Sui blockchain that enables:

✅ **Service Providers**: Register and monetize services  
✅ **Users**: Browse and access free or paid services  
✅ **Admins**: Manage services and track revenue  
✅ **On-Chain Payments**: Secure SUI token transactions  

---

## Quick Navigation

- **New User?** → [User Guide](#for-users)
- **Service Provider?** → [Admin Guide](#for-administrators)
- **Developer?** → [Developer Guide](#for-developers)
- **Need Help?** → [Troubleshooting](#troubleshooting)

---

## For Users

### Step 1: Connect Your Wallet

1. Visit the Crozz DApp at your deployed URL
2. Click **"Connect Wallet"** in the top-right
3. Select your Sui wallet (Sui Wallet, Ethos, Suiet, etc.)
4. Approve the connection

### Step 2: Get Testnet SUI

If on testnet, click **"Get Testnet SUI"** and:
1. Visit the Sui Faucet
2. Enter your wallet address
3. Request testnet tokens

### Step 3: Browse Services

1. Scroll to **"Service Marketplace"** section
2. Browse available services:
   - **Free Services**: Marked with "FREE" badge
   - **Paid Services**: Show price in SUI
3. Read service descriptions and check statistics

### Step 4: Access a Service

1. Click **"Access"** on your chosen service
2. Review the confirmation dialog:
   - Service name and description
   - Price (if applicable)
3. Click **"Confirm Access"**
4. Approve the transaction in your wallet
5. Wait for confirmation

### Step 5: Track Your Usage

1. Switch to **"My Dashboard"** tab
2. View your statistics:
   - Total services used
   - Total spent
   - Recent activity
   - Spending trends

---

## For Administrators

### Prerequisites

- Hold an **AdminCap NFT** (capability to manage services)
- Have sufficient **SUI tokens** for gas fees
- Connected wallet on the correct network

### Register a New Service

1. Click **"Register Service"** button
2. Fill in the service details:
   ```
   Service Name:    Your service name
   Description:     What your service does
   Price (SUI):     0 for free, or set a price
   ```
3. Click **"Register Service"**
4. Approve the transaction (requires AdminCap)
5. Service appears in marketplace immediately

### Manage Services

1. Switch to **"Admin View"** in Dashboard
2. Navigate to **"Services"** tab
3. View all your services with:
   - Usage statistics
   - Revenue per service
   - Performance trends
4. Enable/disable services as needed

### Withdraw Revenue

1. Go to **"Revenue"** tab in Admin Dashboard
2. View total available balance
3. Click **"Withdraw All Revenue"**
4. Approve transaction
5. Funds sent to admin address (set during deployment)

---

## For Developers

### Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/sjhallo07/Crozz-Coin.git
cd Crozz-Coin

# 2. Navigate to UI directory
cd sui-stack-hello-world/ui

# 3. Install dependencies
pnpm install --ignore-workspace

# 4. Start development server
pnpm dev

# 5. Open browser
# Visit http://localhost:5173
```

### Deploy Smart Contracts

```bash
# 1. Navigate to Move package
cd sui-stack-hello-world/move/service-marketplace

# 2. Build the package
sui move build

# 3. Publish to testnet
sui client publish --gas-budget 100000000

# 4. Save the output:
# - Package ID
# - Marketplace Object ID
# - AdminCap Object ID
```

### Configure Frontend

Create `.env` file in `sui-stack-hello-world/ui/`:

```env
VITE_MARKETPLACE_PACKAGE_ID=0xYOUR_PACKAGE_ID
VITE_MARKETPLACE_OBJECT_ID=0xYOUR_MARKETPLACE_ID
VITE_ADMIN_CAP_ID=0xYOUR_ADMIN_CAP_ID
```

### Build for Production

```bash
# Build optimized bundle
cd sui-stack-hello-world/ui
pnpm build

# Output in dist/ directory
```

### Deploy Frontend

#### Option 1: Vercel
```bash
vercel --prod
```

#### Option 2: Netlify
```bash
netlify deploy --prod --dir=dist
```

#### Option 3: GitHub Pages
```bash
pnpm build --base=/Crozz-Coin/
cp -r dist/* ../../docs/marketplace/
```

---

## Key Features

### 🛍️ Service Marketplace

- **Browse Services**: View all available services with details
- **Category Filtering**: Find services by type (Compute, Storage, API, etc.)
- **Price Display**: Clear pricing for free and paid services
- **Usage Statistics**: See how many times a service has been used
- **One-Click Access**: Simple process to use services

### 📊 User Dashboard

- **Usage Tracking**: Monitor your service usage over time
- **Spending Analysis**: Track how much you've spent
- **Activity History**: View recent service accesses
- **Category Insights**: See your favorite service categories

### 🎛️ Admin Dashboard

- **Revenue Overview**: Total earnings across all services
- **Service Management**: Register, update, and monitor services
- **Performance Metrics**: Usage and revenue per service
- **Withdrawal System**: Easy revenue withdrawal to admin wallet

### 💰 Payment System

- **Free Services**: Instant access, no payment required
- **Paid Services**: Automatic SUI token payment processing
- **Secure Transactions**: All payments verified on-chain
- **Transparent Pricing**: Clear pricing before confirmation

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│            CROZZ ECOSYSTEM                  │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend (React)  ←→  Blockchain (Sui)    │
│         ↓                     ↓             │
│   - Service UI          - Smart Contract   │
│   - Dashboard           - Payment System   │
│   - Wallet Kit          - Admin Controls   │
│                                             │
└─────────────────────────────────────────────┘
```

### Tech Stack

- **Frontend**: React 19.2.1, TypeScript 5.9.3, Vite 7.2.7
- **UI Library**: Radix UI Themes
- **Blockchain**: Sui Blockchain (Move language)
- **SDK**: @mysten/dapp-kit 0.19.11, @mysten/sui 1.45.2
- **State**: React Hooks, TanStack Query

---

## Documentation

### Complete Documentation Suite

1. **[DAPP_ARCHITECTURE_DOCUMENTATION.md](./DAPP_ARCHITECTURE_DOCUMENTATION.md)**
   - Comprehensive architecture guide
   - Component API reference
   - Integration instructions
   - Security best practices

2. **[SERVICE_MARKETPLACE_GUIDE.md](./SERVICE_MARKETPLACE_GUIDE.md)**
   - Detailed marketplace usage
   - Move contract API
   - Deployment instructions
   - Troubleshooting guide

3. **[UI_SCREENSHOTS_GUIDE.md](./UI_SCREENSHOTS_GUIDE.md)**
   - Visual UI documentation
   - User flow diagrams
   - Component screenshots
   - Design principles

4. **[COMPLETE_DAPP_DEPLOYMENT_GUIDE.md](./COMPLETE_DAPP_DEPLOYMENT_GUIDE.md)**
   - Bytecode resources
   - UI development completion
   - Frontend-backend connection
   - Deployment options

---

## Troubleshooting

### Common Issues

#### ❌ "Transaction Failed"
**Solution**: Check wallet balance and ensure sufficient SUI for gas

#### ❌ "Service Not Found"
**Solution**: Refresh page or verify service ID is correct

#### ❌ "Admin Functions Not Available"
**Solution**: Ensure you hold the AdminCap NFT for this marketplace

#### ❌ "Wallet Not Connecting"
**Solution**: Install/update wallet extension, refresh page

#### ❌ "GraphQL Service Not Available"
**Solution**: Check network connection or try different RPC endpoint

### Getting Help

- **Documentation**: Read the comprehensive guides listed above
- **GitHub Issues**: Report bugs at repository issues page
- **Community**: Join Discord/Telegram for community support
- **Code Examples**: Check `/examples` directory in repository

---

## Security Notes

### For Users

✅ **DO**:
- Verify transaction details before signing
- Keep your seed phrase secure
- Use hardware wallets for large amounts
- Check service descriptions before accessing

❌ **DON'T**:
- Share your private keys or seed phrase
- Approve transactions you don't understand
- Connect to untrusted dApps
- Ignore wallet security warnings

### For Developers

✅ **DO**:
- Validate all user inputs
- Test contracts thoroughly on testnet
- Use official Sui SDK versions
- Follow Move security best practices
- Audit contracts before mainnet

❌ **DON'T**:
- Store private keys in code
- Skip input validation
- Deploy untested contracts to mainnet
- Ignore compiler warnings
- Use outdated dependencies

---

## Example Transactions

### Access Free Service

```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::marketplace::access_free_service`,
  arguments: [
    tx.object(MARKETPLACE_ID),
    tx.pure.u64(serviceId),
  ],
});
await signAndExecuteTransaction({ transaction: tx });
```

### Access Paid Service

```typescript
const tx = new Transaction();
const [coin] = tx.splitCoins(tx.gas, [price * 1_000_000_000]);
tx.moveCall({
  target: `${PACKAGE_ID}::marketplace::access_paid_service`,
  arguments: [
    tx.object(MARKETPLACE_ID),
    tx.pure.u64(serviceId),
    coin,
  ],
});
await signAndExecuteTransaction({ transaction: tx });
```

### Register Service (Admin)

```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::marketplace::register_service`,
  arguments: [
    tx.object(ADMIN_CAP_ID),
    tx.object(MARKETPLACE_ID),
    tx.pure.string(name),
    tx.pure.string(description),
    tx.pure.u64(price * 1_000_000_000),
  ],
});
await signAndExecuteTransaction({ transaction: tx });
```

---

## Next Steps

### For Users
1. ✅ Connect wallet and get testnet SUI
2. ✅ Browse available services
3. ✅ Try accessing a free service
4. ✅ Check your dashboard statistics

### For Admins
1. ✅ Obtain AdminCap NFT
2. ✅ Register your first service
3. ✅ Monitor service usage
4. ✅ Track and withdraw revenue

### For Developers
1. ✅ Set up local development environment
2. ✅ Deploy contracts to testnet
3. ✅ Configure frontend with contract IDs
4. ✅ Test all user flows
5. ✅ Deploy to production

---

## Resources

### Official Links
- **Sui Documentation**: https://docs.sui.io
- **Sui Explorer**: https://suiscan.xyz
- **Sui Faucet**: https://faucet.sui.io
- **Move Book**: https://move-book.com

### Crozz Resources
- **Repository**: https://github.com/sjhallo07/Crozz-Coin
- **Architecture Docs**: See documentation links above
- **Example dApps**: Check `/dapps` directory

---

## License

Apache-2.0 License - See [LICENSE](./LICENSE) file for details

---

## Support

Need help? Check these resources:

1. **Documentation**: Read comprehensive guides above
2. **Examples**: Review code examples in repository
3. **Issues**: Search/create GitHub issues
4. **Community**: Join community channels

---

**Version**: 1.0  
**Last Updated**: December 11, 2025  
**Status**: Production Ready  
**Maintained By**: Crozz Ecosystem Team

---

## Summary

You now have everything needed to use or develop with the Crozz Service Marketplace:

- ✅ Smart contracts for service management
- ✅ Full-featured frontend UI
- ✅ User and admin dashboards
- ✅ Payment processing system
- ✅ Comprehensive documentation
- ✅ Deployment guides
- ✅ Example code and flows

**Ready to start?** Connect your wallet and explore the marketplace!
