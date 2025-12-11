# Quick Start - Development Server

## 🚀 Running the Kiosk Demo Interface

The Kiosk Demo is now set up and ready to run!

### Start the Server

```bash
# Install dependencies (first time only)
pnpm install

# Start the development server
cd dapps/kiosk
pnpm dev
```

### Access the Interface

Once the server starts, access the Kiosk Demo at:

**🌐 Local URL: http://localhost:5173/**

### What You'll See

![Kiosk Demo Interface](https://github.com/user-attachments/assets/5c1f5666-fc96-4a20-afff-f0d3ee051669)

The interface provides:
- ✅ Wallet connection functionality
- ✅ Network selection (localnet, devnet, testnet, mainnet)
- ✅ Kiosk search by address or ID
- ✅ Kiosk creation and management
- ✅ Marketplace for purchasing from other kiosks

### Server Status

```
✅ Dependencies Installed: All project dependencies installed via pnpm
✅ Development Server: Running on http://localhost:5173/
✅ Hot Module Replacement: Enabled for instant updates
✅ Network: testnet (default)
```

### Next Steps

1. **Connect Wallet**: Install a Sui-compatible wallet extension (e.g., Sui Wallet)
2. **Select Network**: Choose testnet for safe testing
3. **Get Test Tokens**: Visit [Sui Testnet Faucet](https://docs.sui.io/guides/developer/getting-started/get-address) for test SUI
4. **Create Kiosk**: Follow the interface prompts to create your kiosk
5. **Explore**: Browse and interact with other kiosks on the network

### Available Commands

```bash
# Development
pnpm dev              # Start dev server with hot reload

# Production
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run linters
pnpm lint:fix         # Fix linting issues
pnpm prettier:fix     # Format code
```

### Alternative dApps

You can also run other dApps in the repository:

```bash
# Multisig Toolkit
cd dapps/multisig-toolkit && pnpm dev

# Sponsored Transactions
cd dapps/sponsored-transactions && pnpm dev

# Regulated Token
cd dapps/regulated-token && pnpm dev
```

### Troubleshooting

**Port in use?** Change the port:
```bash
pnpm dev -- --port 3000
```

**Dependencies issues?** Clean and reinstall:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

For detailed setup instructions, see [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)

---

**📚 Additional Resources:**
- [Complete dApp Deployment Guide](./COMPLETE_DAPP_DEPLOYMENT_GUIDE.md)
- [Sui Documentation](https://docs.sui.io/)
- [Project README](./README.md)
