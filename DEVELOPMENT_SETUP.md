# Development Setup Guide

This guide provides instructions for installing dependencies, building, and running the development server for the Crozz Coin project.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)
- pnpm (v9.1.1 or higher)

## Installation Steps

### 1. Install pnpm

If you don't have pnpm installed, install it globally:

```bash
npm install -g pnpm@9.1.1
```

Verify installation:
```bash
pnpm --version
```

### 2. Install Project Dependencies

From the root of the repository, install all dependencies:

```bash
pnpm install
```

This will install dependencies for all workspace packages defined in `pnpm-workspace.yaml`.

## Running the Development Server

### Kiosk Demo dApp

The Kiosk Demo is a React/Vite application that demonstrates the Sui Kiosk functionality.

#### Start the Development Server

```bash
cd dapps/kiosk
pnpm dev
```

The development server will start and be available at:
- **Local URL**: http://localhost:5173/

#### Development Server Output

When running successfully, you should see:
```
VITE v5.4.21  ready in 179 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Interface Screenshot

![Kiosk Demo Interface](https://github.com/user-attachments/assets/5c1f5666-fc96-4a20-afff-f0d3ee051669)

## Features of the Kiosk Demo

The Kiosk Demo interface includes:
- **Wallet Connection**: Connect your Sui wallet to interact with kiosks
- **Network Selection**: Switch between localnet, devnet, testnet, and mainnet
- **Kiosk Search**: Search for kiosks by address or Sui Kiosk ID
- **Kiosk Management**: Create and manage your own kiosk
- **Kiosk Marketplace**: Purchase items from other kiosks

## Build for Production

To build the Kiosk Demo for production:

```bash
cd dapps/kiosk
pnpm build
```

The production build will be created in the `dist` directory.

## Preview Production Build

To preview the production build locally:

```bash
cd dapps/kiosk
pnpm preview
```

## Other Available dApps

This repository contains several other dApps that can be run similarly:

- **Kiosk CLI** (`dapps/kiosk-cli`)
- **Multisig Toolkit** (`dapps/multisig-toolkit`)
- **Regulated Token** (`dapps/regulated-token`)
- **Sponsored Transactions** (`dapps/sponsored-transactions`)

Each dApp can be run using the same pattern:
```bash
cd dapps/<dapp-name>
pnpm dev
```

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, you can specify a different port:

```bash
pnpm dev -- --port 3000
```

### Dependencies Issues

If you encounter dependency issues, try:

```bash
# Remove node_modules and lockfile
rm -rf node_modules pnpm-lock.yaml

# Clean pnpm cache
pnpm store prune

# Reinstall dependencies
pnpm install
```

### Vite HMR Not Working

If Hot Module Replacement (HMR) isn't working:

1. Check your firewall settings
2. Try using `--host` flag to expose the server:
   ```bash
   pnpm dev -- --host
   ```

## Additional Resources

- [Sui Documentation](https://docs.sui.io/)
- [Vite Documentation](https://vitejs.dev/)
- [Complete dApp Deployment Guide](./COMPLETE_DAPP_DEPLOYMENT_GUIDE.md)
- [Project README](./README.md)

## Testing the Interface

Once the development server is running, you can:

1. Open http://localhost:5173/ in your browser
2. Connect a Sui wallet (requires a Sui-compatible wallet extension)
3. Select your preferred network (testnet recommended for testing)
4. Search for existing kiosks or create your own
5. Interact with the kiosk marketplace

## Development Workflow

1. Start the development server: `pnpm dev`
2. Make your changes in the `src` directory
3. The browser will automatically reload with your changes
4. Test your changes in the browser
5. Build for production when ready: `pnpm build`

## Environment Configuration

The Kiosk Demo uses the following network configurations:
- **Localnet**: For local development with a local Sui node
- **Devnet**: Sui's development network
- **Testnet**: Sui's test network (recommended for testing)
- **Mainnet**: Sui's production network

Make sure you have sufficient SUI tokens in your wallet for the selected network.
