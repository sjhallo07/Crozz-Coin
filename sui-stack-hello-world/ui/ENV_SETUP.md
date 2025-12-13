# Sui dApp Environment Configuration Guide

## Overview

This directory contains environment configuration examples for connecting to different Sui networks.

## Available Networks

### Testnet (.env.testnet.example)

- **Use Case**: Development, testing, and CI/CD pipelines
- **Data Persistence**: Yes - data persists across resets
- **Faucet**: <https://faucet.testnet.sui.io/> (provides free test SUI)
- **RPC**: <https://fullnode.testnet.sui.io:443>
- **Explorer**: <https://testnet.suivision.xyz/>
- **Best For**: Integration testing, demo purposes, long-term testing

### Mainnet (.env.mainnet.example)

- **Use Case**: Production deployments only
- **Data Persistence**: Yes - permanent and persistent
- **Faucet**: ❌ NO PUBLIC FAUCET (real SUI only)
- **RPC**: <https://fullnode.mainnet.sui.io:443>
- **Explorer**: <https://suivision.xyz/>
- **Best For**: Live applications with real users and assets
- **⚠️ WARNING**: All transactions use REAL SUI tokens

## Setup Instructions

### 1. Choose Your Network

```bash
# For development/testing (Testnet)
cp .env.testnet.example .env

# For production (Mainnet)
cp .env.mainnet.example .env
```

### 2. Verify Configuration

The `.env` file should contain all required variables:

- `VITE_SUI_NETWORK`: Network identifier (testnet/mainnet)
- `VITE_FULLNODE_URL`: RPC endpoint
- `VITE_FAUCET_URL`: Faucet URL (empty for mainnet)
- `VITE_GRAPHQL_URL`: GraphQL endpoint
- `VITE_GRAPHQL_ENABLED`: GraphQL feature flag

### 3. Get Test SUI (Testnet Only)

1. Visit: <https://faucet.testnet.sui.io/>
2. Paste your wallet address
3. Request test SUI (you'll receive ~100 test SUI)

### 4. Start Development

```bash
pnpm install
pnpm run dev      # Run on testnet (default)
pnpm run build    # Build production bundle
pnpm run lint     # Check code quality
```

## Environment File Usage

### In Your Code

Access environment variables in React components:

```typescript
const rpcUrl = import.meta.env.VITE_FULLNODE_URL;
const network = import.meta.env.VITE_SUI_NETWORK;
```

### With Sui SDK

```typescript
import { SuiClient } from '@mysten/sui/client';

const suiClient = new SuiClient({
  url: import.meta.env.VITE_FULLNODE_URL,
});
```

## Common Tasks

### Switch Networks

```bash
# Switch from Testnet to Mainnet
cp .env.mainnet.example .env

# Or from Mainnet to Testnet
cp .env.testnet.example .env

# Then restart dev server
pnpm run dev
```

### Check Network Status

Visit the respective explorers:

- Testnet: <https://testnet.suivision.xyz/>
- Mainnet: <https://suivision.xyz/>

### Request Testnet SUI

1. Go to: <https://faucet.testnet.sui.io/>
2. Enter your wallet address
3. Click "Request SUI"
4. You should receive ~100 test SUI within a few seconds

## Network Comparison

| Feature | Testnet | Mainnet |
|---------|---------|---------|
| Real SUI | ❌ No | ✅ Yes |
| Faucet Available | ✅ Yes | ❌ No |
| Data Persistent | ✅ Yes | ✅ Yes |
| Best For | Testing | Production |
| Reset Frequency | Rarely | Never |
| Cost | Free | Real Cost |

## Troubleshooting

### Cannot Connect to Network

1. Check your `.env` file exists
2. Verify `VITE_FULLNODE_URL` is correct
3. Check internet connection
4. Try the RPC health endpoint:

   ```bash
   curl https://fullnode.testnet.sui.io:443/health
   ```

### No SUI in Testnet Wallet

1. Go to <https://faucet.testnet.sui.io/>
2. Make sure wallet is connected
3. Request SUI (wait a few seconds)
4. Check Testnet explorer: <https://testnet.suivision.xyz/>

### Mainnet Transactions Failing

- Ensure you have real SUI in your wallet
- Check mainnet explorer: <https://suivision.xyz/>
- Verify gas price is sufficient

## Security Notes

⚠️ **NEVER commit `.env` files to git** - they may contain sensitive data

- The `.env` file is in `.gitignore`
- Share `.env.example` files instead
- Keep `.env` files local to your machine

## Additional Resources

- [Sui Documentation](https://docs.sui.io/)
- [Sui RPC API](https://docs.sui.io/build/json-rpc)
- [Sui Faucet](https://faucet.testnet.sui.io/)
- [Sui Explorer (Testnet)](https://testnet.suivision.xyz/)
- [Sui Explorer (Mainnet)](https://suivision.xyz/)
