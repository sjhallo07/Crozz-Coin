# CROZZ ECOSYSTEM - dApp UI

![CROZZ Logo](./public/logo-no-background.png)

**A NEW BEGINNING** - The official CROZZ_COIN decentralized application on Sui Blockchain.

## 🌟 Overview

CROZZ ECOSYSTEM is a revolutionary blockchain project built on the Sui network, representing **THE TRUE RELIGION** of decentralized finance. Our dApp provides a comprehensive interface for interacting with the CROZZ_COIN token and ecosystem features.

**Status:** 🚀 Pre Sale Coming Soon  
**Website:** [crozzcoin.com](https://crozzcoin.com/)

## ✨ Features

### ✅ Implemented

#### Blockchain Integration
- **Wallet Connection** - Seamless integration with Sui wallets
- **Testnet Support** - Full Sui Testnet compatibility
- **Transaction Execution** - Smart contract interactions
- **Faucet Integration** - Easy testnet SUI acquisition

#### GraphQL RPC Client
- **Full Sui GraphQL Support** - Access to all blockchain data
- **8 Custom Hooks** - React hooks for common operations
- **Interactive Explorer** - Test queries in real-time
- **Type Safety** - Complete TypeScript definitions (45+ types)
- **Pagination** - Cursor-based pagination for large datasets
- **Multi-Network** - Devnet, Testnet, and Mainnet support

#### Custom Indexing Framework
- **Sequential Pipelines** - In-order data processing
- **Concurrent Pipelines** - High-throughput parallel processing
- **PostgreSQL Integration** - Production-ready storage
- **Multiple Data Sources** - Remote stores, local files, RPC endpoints

#### UI/UX
- **Official Branding** - CROZZ ECOSYSTEM design system
- **Responsive Design** - Mobile-first approach
- **Radix UI Components** - Modern, accessible components
- **Dark/Light Themes** - User preference support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Sui wallet extension ([Sui Wallet](https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil))
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/sjhallo07/Crozz-Coin.git
cd Crozz-Coin/sui-stack-hello-world/ui

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

### Environment Setup

Create a `.env` file:

```env
VITE_SUI_NETWORK=testnet
VITE_GRAPHQL_ENDPOINT=https://graphql.testnet.sui.io/graphql
```

## 📖 Usage Guide

### Connecting Your Wallet

1. Click **"Connect Wallet"** in the top-right corner
2. Select your Sui wallet (e.g., Sui Wallet, Suiet)
3. Approve the connection request
4. Ensure you're on **Sui Testnet**

### Getting Testnet SUI

1. Connect your wallet
2. Click **"Get Testnet SUI"** button
3. Complete the faucet request
4. Wait for tokens to arrive (~30 seconds)

### Using GraphQL Explorer

The app includes an interactive GraphQL explorer with 5 tabs:

#### 1. Epoch Tab
Query current or specific epoch information:
- Epoch ID and timestamps
- Validator information
- Reference gas price
- Protocol configurations

#### 2. Transactions Tab
Browse and filter transactions:
- Paginated transaction list
- Filter by sender address
- Transaction details and effects
- Gas usage information

#### 3. Object Tab
Inspect on-chain objects:
- Object details by ID
- Move object contents
- Ownership information
- Version history

#### 4. Balance Tab
Check coin balances:
- Total balance by owner
- Coin type filtering
- Individual coin details
- Balance formatting (MIST ↔ SUI)

#### 5. Config Tab
View service configuration:
- Maximum query depth
- Maximum nodes per query
- Page size limits
- Timeout settings
- Data retention policies

### Creating Greetings

The demo application includes a simple greeting system:

1. Connect wallet and ensure Testnet connection
2. Click **"Create Greeting"**
3. Enter your greeting text
4. Sign the transaction
5. View your greeting with a shareable link

## 🛠️ Development

### Project Structure

```
ui/
├── public/
│   └── logo-no-background.png       # CROZZ official logo
├── src/
│   ├── components/
│   │   ├── GraphQLExplorer.tsx      # Interactive query UI (500+ lines)
│   │   ├── Greeting.tsx             # Display greeting component
│   │   └── CreateGreeting.tsx       # Create greeting form
│   ├── contexts/
│   │   └── GraphQLContext.tsx       # GraphQL state management (200+ lines)
│   ├── hooks/
│   │   └── useGraphQL.ts            # 8 custom hooks (550+ lines)
│   ├── services/
│   │   └── graphqlClient.ts         # GraphQL client (450+ lines)
│   ├── types/
│   │   └── graphql.ts               # TypeScript definitions (400+ lines)
│   ├── utils/
│   │   └── graphqlUtils.ts          # Helper utilities (550+ lines)
│   ├── examples/
│   │   └── graphqlExamples.ts       # 15 working examples (450+ lines)
│   ├── App.tsx                      # Main application
│   └── main.tsx                     # App entry point
├── GRAPHQL_README.md                # GraphQL documentation
├── PROJECT_INFO.md                  # Project information
└── package.json
```

### Available Scripts

```bash
# Development
pnpm dev                 # Start dev server (port 5173)
pnpm build              # Build for production
pnpm preview            # Preview production build

# Linting
pnpm lint               # Run ESLint
pnpm lint:fix           # Fix linting issues

# Type Checking
pnpm typecheck          # Run TypeScript compiler check
```

### Key Technologies

- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite** - Build tool and dev server
- **Radix UI** - Component library
- **@mysten/dapp-kit** - Sui wallet integration
- **@mysten/sui** - Sui JavaScript SDK

## 📚 Documentation

### GraphQL Integration
See [GRAPHQL_README.md](./GRAPHQL_README.md) for comprehensive GraphQL documentation including:
- Architecture overview
- API reference
- Usage examples
- Best practices
- Pagination guide
- Error handling

### Custom Indexing
See [Custom Indexing Framework](../../docs/custom-indexing/) for indexer documentation:
- Pipeline architectures
- Database integration
- Data sources
- Example implementations

### Project Information
See [PROJECT_INFO.md](./PROJECT_INFO.md) for:
- Token details
- Team information
- Website structure
- Technical stack
- Roadmap

## 🔗 GraphQL Endpoints

### Testnet (Default)
```
https://graphql.testnet.sui.io/graphql
```

### Mainnet
```
https://graphql.mainnet.sui.io/graphql
```

### Devnet
```
https://graphql.devnet.sui.io/graphql
```

## 🎯 Roadmap

### Phase 1: Foundation ✅
- [x] Sui dApp integration
- [x] Wallet connection
- [x] GraphQL client
- [x] Official branding

### Phase 2: Token Launch 🔄
- [ ] Smart contract deployment
- [ ] Tokenomics implementation
- [ ] Pre-sale mechanism
- [ ] Whitepaper release

### Phase 3: Ecosystem 📋
- [ ] Staking features
- [ ] Governance system
- [ ] Community features
- [ ] Mobile app

### Phase 4: Expansion 🔮
- [ ] Cross-chain bridges
- [ ] DeFi integrations
- [ ] NFT marketplace
- [ ] Advanced analytics

## 👥 Team

**Owner:** Carlo Luken  
**Developer:** Marcos Mora  
**Contact:** Abreu760@hotmail.com

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the CROZZ ECOSYSTEM. All rights reserved.

## 🔗 Links

- **Website:** [crozzcoin.com](https://crozzcoin.com/)
- **GitHub:** [github.com/sjhallo07/Crozz-Coin](https://github.com/sjhallo07/Crozz-Coin)
- **Sui Network:** [sui.io](https://sui.io/)
- **Sui Docs:** [docs.sui.io](https://docs.sui.io/)

## 📞 Support

For questions, issues, or support:

- **Email:** Abreu760@hotmail.com
- **Website:** [crozzcoin.com/#Contact](https://crozzcoin.com/#Contact)
- **GitHub Issues:** [Create an issue](https://github.com/sjhallo07/Crozz-Coin/issues)

---

**A NEW BEGINNING** - CROZZ ECOSYSTEM © 2025

Built with ❤️ on the Sui Blockchain
